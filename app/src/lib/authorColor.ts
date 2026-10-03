// Author colors from the categorical tokens (--color-author-1..6). The
// index comes from a hash of the name, so any author gets a stable color
// — the same in the commit list and the commit panel — without
// hard-coding names.
const AUTHOR_COLORS = [
  "bg-author-1/20 text-author-1",
  "bg-author-2/20 text-author-2",
  "bg-author-3/20 text-author-3",
  "bg-author-4/20 text-author-4",
  "bg-author-5/20 text-author-5",
  "bg-author-6/20 text-author-6",
];

export function authorColor(author: string) {
  let hash = 0;
  for (const char of author) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return AUTHOR_COLORS[Math.abs(hash) % AUTHOR_COLORS.length];
}

export function authorInitials(author: string) {
  return author.replace(/[^a-zA-Z]/g, "").slice(0, 2).toUpperCase();
}
