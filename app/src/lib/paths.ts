export function splitPath(path: string) {
  const slash = path.lastIndexOf("/");
  return slash === -1
    ? { name: path, dir: "" }
    : { name: path.slice(slash + 1), dir: path.slice(0, slash) };
}
