import { NextRequest, NextResponse } from "next/server";

const DJANGO =
  process.env.DJANGO_API_PROXY_TARGET ||
  process.env.DJANGO_INTERNAL_API_URL ||
  "http://127.0.0.1:8000";

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
]);

function djangoUrl(path: string[], search: string): string {
  const segments = path.join("/");
  return `${DJANGO}/api/${segments}/${search}`;
}

async function proxy(request: NextRequest, path: string[]) {
  const incoming = request.nextUrl;
  const target = djangoUrl(path, incoming.search);

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.set("x-forwarded-host", incoming.host);
  headers.set("x-forwarded-proto", incoming.protocol.replace(":", ""));

  const init: RequestInit & { duplex?: "half" } = {
    method: request.method,
    headers,
    redirect: "follow",
  };
  if (request.method !== "GET" && request.method !== "HEAD") {
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("multipart/form-data") && request.body) {
      // Stream multipart bodies — buffering can strip boundaries in dev.
      init.body = request.body;
      init.duplex = "half";
    } else {
      init.body = await request.arrayBuffer();
    }
  }

  const upstream = await fetch(target, init);
  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (HOP_BY_HOP.has(lower) || lower === "location") return;
    responseHeaders.append(key, value);
  });
  responseHeaders.set("cache-control", "no-store");

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

type RouteContext = { params: Promise<{ path?: string[] }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { path = [] } = await context.params;
  return proxy(request, path);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { path = [] } = await context.params;
  return proxy(request, path);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { path = [] } = await context.params;
  return proxy(request, path);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { path = [] } = await context.params;
  return proxy(request, path);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { path = [] } = await context.params;
  return proxy(request, path);
}

export async function OPTIONS(request: NextRequest, context: RouteContext) {
  const { path = [] } = await context.params;
  return proxy(request, path);
}
