from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AdminPostViewSet,
    CategoryViewSet,
    PublicPostViewSet,
    SlugRedirectView,
    TagViewSet,
)

public_router = DefaultRouter()
public_router.register("posts", PublicPostViewSet, basename="post")
public_router.register("categories", CategoryViewSet, basename="category")
public_router.register("tags", TagViewSet, basename="tag")

admin_router = DefaultRouter()
admin_router.register("posts", AdminPostViewSet, basename="admin-post")

urlpatterns = [
    path("redirects/<slug:old_slug>/", SlugRedirectView.as_view(), name="slug-redirect"),
    path("", include(public_router.urls)),
    path("admin/", include(admin_router.urls)),
]
