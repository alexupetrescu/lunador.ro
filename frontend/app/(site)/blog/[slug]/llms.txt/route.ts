import { getPost } from "@/lib/server-api";
import { absoluteUrl, siteConfig } from "@/lib/site";

export const revalidate = 60;

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) {
    return new Response("Not found", { status: 404 });
  }

  const parts = [
    `# ${post.title}`,
    "",
    `Source: ${absoluteUrl(`/blog/${post.slug}`)}`,
    `Site: ${siteConfig.name}`,
    post.published_at ? `Published: ${post.published_at}` : "",
    "",
    post.body_text || "",
    "",
  ];

  return new Response(parts.filter((l) => l !== null).join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
