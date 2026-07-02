from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticatedOrReadOnly

from .models import MediaAsset, MediaTag
from .serializers import MediaAssetSerializer, MediaTagSerializer


class MediaTagViewSet(viewsets.ModelViewSet):
    queryset = MediaTag.objects.all()
    serializer_class = MediaTagSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = "slug"


class MediaAssetViewSet(viewsets.ModelViewSet):
    """CRUD for media. Reads are open; writes (upload, metadata edits) need auth.

    Metadata (kind/dimensions/blurhash) is derived by a ``post_save`` signal, so
    a plain multipart POST with just ``file`` is enough to create a usable asset.
    """

    queryset = MediaAsset.objects.all().prefetch_related("tags")
    serializer_class = MediaAssetSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    # Multipart/form for file uploads, JSON for metadata edits from the CRM.
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["kind", "tags"]
    search_fields = ["title", "alt_text", "caption", "credit"]
    ordering_fields = ["created_at", "title"]
    ordering = ["-created_at"]

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        instance = serializer.save(uploaded_by=user)
        instance.refresh_from_db()
        serializer.instance = instance
