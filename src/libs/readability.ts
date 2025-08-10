import { extract, toMarkdown } from "@mizchi/readability";

export async function extractContentByReadability(url: string) {
  const html = await fetch(url).then((res) => res.text());
  const extracted = extract(html, {
    charThreshold: 100,
  });

  const parsed = toMarkdown(extracted.root);
  return parsed;
}
