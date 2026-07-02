import type { JSX, ReactNode } from "react";

import MediaImage from "@/components/MediaImage";
import type { MediaMap, TiptapMark, TiptapNode } from "@/lib/types";

interface RendererContext {
  media: MediaMap;
}

// Inline text + marks ----------------------------------------------------------

function applyMark(mark: TiptapMark, children: ReactNode, key: number): ReactNode {
  const attrs = mark.attrs ?? {};
  switch (mark.type) {
    case "bold":
      return <strong key={key}>{children}</strong>;
    case "italic":
      return <em key={key}>{children}</em>;
    case "strike":
      return <s key={key}>{children}</s>;
    case "code":
      return <code key={key}>{children}</code>;
    case "underline":
      return <u key={key}>{children}</u>;
    case "link": {
      const href = String(attrs.href ?? "#");
      const external = /^https?:\/\//.test(href);
      return (
        <a
          key={key}
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
        >
          {children}
        </a>
      );
    }
    default:
      return <span key={key}>{children}</span>;
  }
}

function renderText(node: TiptapNode, key: number): ReactNode {
  let content: ReactNode = node.text ?? "";
  const marks = node.marks ?? [];
  marks.forEach((mark, i) => {
    content = applyMark(mark, content, i);
  });
  return <span key={key} style={{ display: "contents" }}>{content}</span>;
}

// Block + node dispatch --------------------------------------------------------

function renderChildren(
  nodes: TiptapNode[] | undefined,
  ctx: RendererContext,
): ReactNode {
  if (!nodes) return null;
  return nodes.map((child, index) => renderNode(child, ctx, index));
}

function MediaBlock({ node, ctx }: { node: TiptapNode; ctx: RendererContext }) {
  const attrs = node.attrs ?? {};
  const assetId = attrs.assetId;
  const asset = assetId != null ? ctx.media[String(assetId)] : undefined;
  if (!asset) return null;

  const layout = String(attrs.layout ?? "default");
  const caption = asset.caption;
  return (
    <figure className={`media-block media-block--${layout}`}>
      <MediaImage asset={asset} />
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}

function GalleryBlock({ node, ctx }: { node: TiptapNode; ctx: RendererContext }) {
  const attrs = node.attrs ?? {};
  const ids = Array.isArray(attrs.assetIds) ? (attrs.assetIds as number[]) : [];
  const assets = ids
    .map((id) => ctx.media[String(id)])
    .filter((a): a is NonNullable<typeof a> => Boolean(a));
  if (!assets.length) return null;
  return (
    <figure className="gallery-block">
      <div className="gallery-block__grid">
        {assets.map((asset) => (
          <MediaImage
            key={asset.id}
            asset={asset}
            sizes="(max-width: 768px) 50vw, 360px"
          />
        ))}
      </div>
    </figure>
  );
}

function renderNode(
  node: TiptapNode,
  ctx: RendererContext,
  key: number,
): ReactNode {
  switch (node.type) {
    case "text":
      return renderText(node, key);
    case "paragraph":
      return <p key={key}>{renderChildren(node.content, ctx)}</p>;
    case "heading": {
      const level = Number(node.attrs?.level ?? 2);
      const Tag = `h${Math.min(Math.max(level, 1), 6)}` as keyof JSX.IntrinsicElements;
      return <Tag key={key}>{renderChildren(node.content, ctx)}</Tag>;
    }
    case "bulletList":
      return <ul key={key}>{renderChildren(node.content, ctx)}</ul>;
    case "orderedList":
      return <ol key={key}>{renderChildren(node.content, ctx)}</ol>;
    case "listItem":
      return <li key={key}>{renderChildren(node.content, ctx)}</li>;
    case "blockquote":
      return <blockquote key={key}>{renderChildren(node.content, ctx)}</blockquote>;
    case "codeBlock":
      return (
        <pre key={key}>
          <code>{renderChildren(node.content, ctx)}</code>
        </pre>
      );
    case "horizontalRule":
      return <hr key={key} />;
    case "hardBreak":
      return <br key={key} />;
    case "image": {
      // Plain Tiptap image (URL-based) — supported but discouraged.
      const src = String(node.attrs?.src ?? "");
      if (!src) return null;
      // eslint-disable-next-line @next/next/no-img-element
      return <img key={key} src={src} alt={String(node.attrs?.alt ?? "")} />;
    }
    case "mediaBlock":
      return <MediaBlock key={key} node={node} ctx={ctx} />;
    case "galleryBlock":
      return <GalleryBlock key={key} node={node} ctx={ctx} />;
    default:
      // Unknown node types render their children so content is never lost.
      return <div key={key}>{renderChildren(node.content, ctx)}</div>;
  }
}

interface BlockRendererProps {
  doc: { type: string; content?: TiptapNode[] } | null | undefined;
  media: MediaMap;
}

export default function BlockRenderer({ doc, media }: BlockRendererProps) {
  if (!doc || !doc.content) return null;
  const ctx: RendererContext = { media };
  return <>{renderChildren(doc.content, ctx)}</>;
}
