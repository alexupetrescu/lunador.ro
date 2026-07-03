import { listAllPublishedPosts } from "@/lib/server-api";
import { absoluteUrl, siteConfig } from "@/lib/site";

export const revalidate = 3600;

// Site-level llms.txt: a markdown index that gives LLM crawlers an unambiguous,
// JS-free map of the published writing. body_text already exists, so this is
// nearly free.
export async function GET() {
  const posts = await listAllPublishedPosts();

  const lines: string[] = [
    `# ${siteConfig.name}`,
    "",
    `> ${siteConfig.description}`,
    "",
    "## Scrieri",
    "",
  ];

  for (const post of posts) {
    const url = absoluteUrl(`/blog/${post.slug}`);
    const summary = post.excerpt ? `: ${post.excerpt}` : "";
    lines.push(`- [${post.title}](${url})${summary}`);
  }

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
