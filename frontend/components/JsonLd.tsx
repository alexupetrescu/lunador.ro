interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

/** Renders a JSON-LD <script>. Server-safe; content is trusted (built by us). */
export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
