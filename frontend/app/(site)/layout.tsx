import PublicShell from "@/components/site/PublicShell";
import { listPosts } from "@/lib/server-api";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const latest = await listPosts({ page: 1 });
  const readingRoomHref = latest?.results[0]
    ? `/blog/${latest.results[0].slug}`
    : "/blog";

  return (
    <PublicShell readingRoomHref={readingRoomHref}>{children}</PublicShell>
  );
}
