from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.static import serve

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("core.urls")),
    path("api/media/", include("media_library.urls")),
    path("api/blog/", include("blog.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
else:
    # In production nginx serves /media/ for public traffic, but the Next.js
    # image optimizer fetches originals through the Next rewrite straight to
    # Gunicorn (never via nginx), so Django must serve media here too.
    # Otherwise /_next/image returns 400 "not a valid image" for every asset.
    urlpatterns += [
        re_path(
            r"^media/(?P<path>.*)$",
            serve,
            {"document_root": settings.MEDIA_ROOT},
        ),
    ]
