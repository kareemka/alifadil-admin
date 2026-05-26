export function slugify(text: string): string {
  return text
    .trim()
    .normalize('NFKC')
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}\-]/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}
