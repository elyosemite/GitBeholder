import type { ProfilerOnRenderCallback } from "react";

/**
 * Dev-only performance collector. Splits every API call into backend time
 * (the `Server-Timing` header set by GitBeholderWeb.Plugs.ServerTiming),
 * transport and JSON parsing; records React render cost per column via
 * <Profiler>; records long tasks (main thread blocked > 50 ms, the
 * moments the UI freezes); and, via the Long Animation Frames API,
 * attributes each frozen frame to the scripts that ran in it and to
 * style/layout work.
 *
 * In the webview DevTools console: `__gbPerf.report()` prints the summary,
 * `__gbPerf.reset()` clears it before measuring a specific interaction.
 */

const enabled = import.meta.env.DEV;

interface RequestSample {
  route: string;
  totalMs: number;
  serverMs: number | null;
  transportMs: number | null;
  parseMs: number;
}

interface RenderSample {
  id: string;
  phase: string;
  actualMs: number;
}

interface LongTaskSample {
  durationMs: number;
  startTime: number;
}

// Long Animation Frames entries — not in TypeScript's DOM lib yet.
interface ScriptTiming {
  duration: number;
  invoker: string;
  invokerType: string;
  sourceURL: string;
  sourceFunctionName: string;
  sourceCharPosition: number;
  forcedStyleAndLayoutDuration: number;
}

interface LongAnimationFrame extends PerformanceEntry {
  blockingDuration: number;
  styleAndLayoutStart: number;
  scripts: ScriptTiming[];
}

interface FrameSample {
  durationMs: number;
  blockingMs: number;
  scriptMs: number;
  styleAndLayoutMs: number;
}

interface ScriptSample {
  cause: string;
  durationMs: number;
  forcedLayoutMs: number;
}

const requests: RequestSample[] = [];
const renders: RenderSample[] = [];
const longTasks: LongTaskSample[] = [];
const frames: FrameSample[] = [];
const scripts: ScriptSample[] = [];

// Collapses ids and hashes so samples of the same endpoint group together.
function toRoute(method: string, path: string): string {
  const route = path
    .split("?")[0]
    .replace(/^\/api\/v1\/workspaces\/\d+\/repositories\/\d+/, "")
    .replace(/\/workspaces\/\d+/, "/workspaces/:id")
    .replace(/\/commits\/[0-9a-f]{7,40}/, "/commits/:hash");
  return `${method} ${route || "/"}`;
}

function parseServerTiming(header: string | null): number | null {
  const match = header?.match(/dur=([\d.]+)/);
  return match ? Number(match[1]) : null;
}

/** Called by api-client after each successful request. */
export function recordRequest(
  method: string,
  path: string,
  startedAt: number,
  headersAt: number,
  parsedAt: number,
  serverTimingHeader: string | null,
) {
  if (!enabled) return;
  const serverMs = parseServerTiming(serverTimingHeader);
  const waitingMs = headersAt - startedAt;
  requests.push({
    route: toRoute(method, path),
    totalMs: parsedAt - startedAt,
    serverMs,
    transportMs: serverMs === null ? null : Math.max(0, waitingMs - serverMs),
    parseMs: parsedAt - headersAt,
  });
}

export const onRender: ProfilerOnRenderCallback = (id, phase, actualDuration) => {
  if (!enabled) return;
  renders.push({ id, phase, actualMs: actualDuration });
};

if (enabled && typeof PerformanceObserver !== "undefined") {
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        longTasks.push({ durationMs: entry.duration, startTime: entry.startTime });
      }
    }).observe({ type: "longtask", buffered: true });
  } catch {
    // longtask unsupported in this engine; the report just omits it.
  }

  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as LongAnimationFrame[]) {
        const end = entry.startTime + entry.duration;
        frames.push({
          durationMs: entry.duration,
          blockingMs: entry.blockingDuration,
          scriptMs: sum(entry.scripts.map((script) => script.duration)),
          styleAndLayoutMs: entry.styleAndLayoutStart > 0 ? end - entry.styleAndLayoutStart : 0,
        });
        for (const script of entry.scripts) {
          scripts.push({
            cause: describeScript(script),
            durationMs: script.duration,
            forcedLayoutMs: script.forcedStyleAndLayoutDuration,
          });
        }
      }
    }).observe({ type: "long-animation-frame", buffered: true });
  } catch {
    // long-animation-frame unsupported; the report just omits it.
  }
}

// "event-listener click → handleClick @ ForceGraph.tsx:1234" — the file is
// the Vite-served module path, minus query strings like ?t= / ?v=.
function describeScript(script: ScriptTiming): string {
  const file = script.sourceURL.split("?")[0].split("/").slice(-2).join("/") || "(unknown)";
  const fn = script.sourceFunctionName || "(anonymous)";
  return `${script.invokerType} ${script.invoker} → ${fn} @ ${file}:${script.sourceCharPosition}`;
}

function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

const round = (n: number) => Math.round(n * 10) / 10;

function groupBy<T>(items: T[], key: (item: T) => string): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const k = key(item);
    groups.set(k, [...(groups.get(k) ?? []), item]);
  }
  return groups;
}

function report() {
  const requestRows = [...groupBy(requests, (r) => r.route)].map(([route, samples]) => {
    const server = samples.flatMap((s) => (s.serverMs === null ? [] : [s.serverMs]));
    const total = samples.map((s) => s.totalMs);
    return {
      route,
      calls: samples.length,
      "total ms (med)": round(median(total)),
      "backend ms (med)": round(median(server)),
      "transport ms (med)": round(median(samples.flatMap((s) => (s.transportMs === null ? [] : [s.transportMs])))),
      "parse ms (med)": round(median(samples.map((s) => s.parseMs))),
      "backend %": total.length ? Math.round((sum(server) / sum(total)) * 100) : 0,
    };
  });

  const renderRows = [...groupBy(renders, (r) => r.id)].map(([id, samples]) => ({
    column: id,
    commits: samples.length,
    "render ms (med)": round(median(samples.map((s) => s.actualMs))),
    "render ms (max)": round(Math.max(...samples.map((s) => s.actualMs))),
    "render ms (sum)": round(sum(samples.map((s) => s.actualMs))),
  }));

  const longTaskMs = longTasks.map((t) => t.durationMs);
  const backendMs = sum(requests.flatMap((r) => (r.serverMs === null ? [] : [r.serverMs])));
  const fetchMs = sum(requests.map((r) => r.totalMs));
  const renderMs = sum(renders.map((r) => r.actualMs));

  console.log("%cAPI requests", "font-weight:bold");
  console.table(requestRows);
  console.log("%cReact renders (dev build: slower than production)", "font-weight:bold");
  console.table(renderRows);
  console.log("%cLong tasks (UI frozen > 50 ms)", "font-weight:bold");
  console.table({
    count: longTasks.length,
    "max ms": round(Math.max(0, ...longTaskMs)),
    "sum ms": round(sum(longTaskMs)),
    "> 100 ms": longTaskMs.filter((d) => d > 100).length,
  });
  if (frames.length > 0) {
    console.log("%cFrozen frames (Long Animation Frames > 50 ms)", "font-weight:bold");
    console.table({
      count: frames.length,
      "max ms": round(Math.max(...frames.map((f) => f.durationMs))),
      "sum ms": round(sum(frames.map((f) => f.durationMs))),
      "blocking ms (sum)": round(sum(frames.map((f) => f.blockingMs))),
      "script ms (sum)": round(sum(frames.map((f) => f.scriptMs))),
      "style + layout ms (sum)": round(sum(frames.map((f) => f.styleAndLayoutMs))),
    });

    const causeRows = [...groupBy(scripts, (s) => s.cause)]
      .map(([cause, samples]) => ({
        cause,
        times: samples.length,
        "total ms": round(sum(samples.map((s) => s.durationMs))),
        "max ms": round(Math.max(...samples.map((s) => s.durationMs))),
        "forced layout ms": round(sum(samples.map((s) => s.forcedLayoutMs))),
      }))
      .sort((a, b) => b["total ms"] - a["total ms"])
      .slice(0, 15);

    console.log("%cTop causes of frozen frames", "font-weight:bold");
    console.table(causeRows);
  } else {
    console.log("Long Animation Frames API unavailable: no per-script attribution.");
  }

  console.log("%cWhere the time went", "font-weight:bold");
  console.table({
    "backend ms": round(backendMs),
    "transport + parse ms": round(fetchMs - backendMs),
    "React render ms": round(renderMs),
    "backend share %": fetchMs + renderMs ? Math.round((backendMs / (fetchMs + renderMs)) * 100) : 0,
  });
}

function reset() {
  requests.length = 0;
  renders.length = 0;
  longTasks.length = 0;
  frames.length = 0;
  scripts.length = 0;
}

if (enabled) {
  (window as unknown as { __gbPerf: object }).__gbPerf = {
    report,
    reset,
    requests,
    renders,
    longTasks,
    frames,
    scripts,
  };
}
