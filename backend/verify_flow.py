"""End-to-end API smoke test against the running dev server (stdlib only)."""
import http.cookiejar
import json
import mimetypes
import os
import urllib.request

BASE = "http://127.0.0.1:8000"

jar = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))


def cookie(name):
    for c in jar:
        if c.name == name:
            return c.value
    return None


def req(path, method="GET", data=None, headers=None, is_json=True):
    url = BASE + path
    body = None
    hdrs = {"Referer": BASE}
    if headers:
        hdrs.update(headers)
    if data is not None and is_json:
        body = json.dumps(data).encode()
        hdrs["Content-Type"] = "application/json"
    elif data is not None:
        body = data
    r = urllib.request.Request(url, data=body, method=method, headers=hdrs)
    with opener.open(r) as resp:
        raw = resp.read().decode()
        return json.loads(raw) if raw else None


def multipart(path, file_path, headers=None):
    boundary = "----lunadorboundary1234"
    fname = os.path.basename(file_path)
    ctype = mimetypes.guess_type(fname)[0] or "application/octet-stream"
    with open(file_path, "rb") as f:
        content = f.read()
    parts = []
    parts.append(f"--{boundary}".encode())
    parts.append(
        f'Content-Disposition: form-data; name="file"; filename="{fname}"'.encode()
    )
    parts.append(f"Content-Type: {ctype}".encode())
    parts.append(b"")
    parts.append(content)
    parts.append(f"--{boundary}--".encode())
    parts.append(b"")
    body = b"\r\n".join(parts)
    hdrs = {"Content-Type": f"multipart/form-data; boundary={boundary}", "Referer": BASE}
    if headers:
        hdrs.update(headers)
    r = urllib.request.Request(BASE + path, data=body, method="POST", headers=hdrs)
    with opener.open(r) as resp:
        return json.loads(resp.read().decode())


# 1. CSRF + login
req("/api/auth/csrf/")
csrf = cookie("csrftoken")
me = req(
    "/api/auth/login/",
    "POST",
    {"username": "admin", "password": "admin12345"},
    {"X-CSRFToken": csrf},
)
print("login:", me["username"])

csrf = cookie("csrftoken")
h = {"X-CSRFToken": csrf}

# 2. upload media
media = multipart("/api/media/assets/", "test_upload.png", h)
print(
    f"media: id={media['id']} kind={media['kind']} "
    f"{media['width']}x{media['height']} blurhash={media['blurhash']!r}"
)

# 3. create post with a media block
body = {
    "type": "doc",
    "content": [
        {"type": "heading", "attrs": {"level": 2},
         "content": [{"type": "text", "text": "First light"}]},
        {"type": "paragraph",
         "content": [{"type": "text", "text": "An essay about the sky and the "
                     "meaning of a quiet night, written slowly."}]},
        {"type": "mediaBlock", "attrs": {"assetId": media["id"], "layout": "wide"}},
        {"type": "paragraph",
         "content": [{"type": "text", "text": "More words follow the image."}]},
    ],
}
post = req(
    "/api/blog/admin/posts/",
    "POST",
    {
        "title": "First Light",
        "slug": "first-light",
        "status": "draft",
        "body": body,
        "featured_image": media["id"],
        "seo_description": "A slow essay on first light.",
    },
    h,
)
print(
    f"post: slug={post['slug']} reading_time={post['reading_time']} "
    f"body_text={post['body_text'][:40]!r}"
)

# 4. publish
pub = req(f"/api/blog/admin/posts/{post['slug']}/publish/", "POST", None, h)
print(f"publish: status={pub['status']} at={pub['published_at']}")

# 5. public detail with hydrated media map
detail = req(f"/api/blog/posts/{post['slug']}/")
print(f"public: title={detail['title']} media_keys={list(detail['media'].keys())}")
asset = detail["media"][str(media["id"])]
print(f"hydrated asset: url={asset['url']} blurhash={asset['blurhash']!r}")

# 6. slug redirect: rename and confirm 301 lookup
req(
    f"/api/blog/admin/posts/{post['slug']}/",
    "PATCH",
    {"slug": "first-light-renamed"},
    h,
)
redirect = req("/api/blog/redirects/first-light/")
print(f"redirect: first-light -> {redirect['slug']}")
print("OK")
