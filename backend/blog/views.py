from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Category, Post, SlugRedirect, Tag
from .serializers import (
    CategorySerializer,
    PostAuthoringSerializer,
    PostDetailSerializer,
    PostListSerializer,
    PostRevisionSerializer,
    TagSerializer,
)


class CategoryViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = "slug"


class TagViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    lookup_field = "slug"


class PublicPostViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    """Read-only, public-safe posts (only content that is live right now)."""

    lookup_field = "slug"
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = {"category__slug": ["exact"], "tags__slug": ["exact"]}
    search_fields = ["title", "body_text"]

    def get_queryset(self):
        return (
            Post.objects.live()
            .select_related("category", "featured_image", "og_image", "author")
            .prefetch_related("tags")
        )

    def get_serializer_class(self):
        if self.action == "retrieve":
            return PostDetailSerializer
        return PostListSerializer


class SlugRedirectView(APIView):
    """Resolve an old slug to the current post slug for 301s on the frontend."""

    def get(self, request, old_slug):
        redirect = get_object_or_404(SlugRedirect, old_slug=old_slug)
        return Response({"old_slug": old_slug, "slug": redirect.post.slug})


class AdminPostViewSet(viewsets.ModelViewSet):
    """Full CRUD for authoring, including drafts. Session-authenticated."""

    serializer_class = PostAuthoringSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "slug"
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "category__slug"]
    search_fields = ["title", "body_text"]
    ordering_fields = ["updated_at", "published_at", "title"]
    ordering = ["-updated_at"]

    def get_queryset(self):
        return (
            Post.objects.all()
            .select_related("category", "featured_image", "og_image", "author")
            .prefetch_related("tags")
        )

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=True, methods=["post"])
    def publish(self, request, slug=None):
        post = self.get_object()
        post.status = Post.Status.PUBLISHED
        if not post.published_at:
            post.published_at = timezone.now()
        post.save()
        post.snapshot_revision(user=request.user)
        return Response(self.get_serializer(post).data)

    @action(detail=True, methods=["post"])
    def unpublish(self, request, slug=None):
        post = self.get_object()
        post.status = Post.Status.DRAFT
        post.save()
        return Response(self.get_serializer(post).data)

    @action(detail=True, methods=["get", "post"])
    def revisions(self, request, slug=None):
        post = self.get_object()
        if request.method == "POST":
            revision = post.snapshot_revision(user=request.user)
            return Response(
                PostRevisionSerializer(revision).data, status=status.HTTP_201_CREATED
            )
        return Response(
            PostRevisionSerializer(post.revisions.all(), many=True).data
        )
