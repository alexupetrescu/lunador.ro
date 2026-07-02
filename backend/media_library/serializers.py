from django.conf import settings
from rest_framework import serializers

from .models import MediaAsset, MediaTag


def media_file_url(obj):
    """Public URL for an asset's file.

    Returns a relative /media/... path by default so the frontend serves it
    same-origin (see next.config.ts rewrite). Never uses the request host,
    which is an internal address (e.g. 127.0.0.1:8010) behind the proxy.
    """
    if not obj.file:
        return None
    url = obj.file.url
    base = getattr(settings, "PUBLIC_SITE_URL", "")
    if base:
        return f"{base.rstrip('/')}{url}"
    return url


class MediaTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = MediaTag
        fields = ["id", "name", "slug"]


class MediaAssetSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()
    tags = MediaTagSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        write_only=True,
        required=False,
        queryset=MediaTag.objects.all(),
        source="tags",
    )
    uploaded_by_detail = serializers.SerializerMethodField()

    class Meta:
        model = MediaAsset
        fields = [
            "id",
            "kind",
            "file",
            "url",
            "title",
            "alt_text",
            "caption",
            "credit",
            "width",
            "height",
            "blurhash",
            "focal_x",
            "focal_y",
            "duration",
            "poster",
            "tags",
            "tag_ids",
            "uploaded_by",
            "uploaded_by_detail",
            "created_at",
        ]
        read_only_fields = [
            "kind",
            "width",
            "height",
            "blurhash",
            "duration",
            "uploaded_by",
            "created_at",
        ]
        extra_kwargs = {"file": {"write_only": True}}

    def get_url(self, obj):
        return media_file_url(obj)

    def get_uploaded_by_detail(self, obj):
        user = obj.uploaded_by
        if not user:
            return None
        return {"id": user.id, "name": user.get_full_name() or user.get_username()}


class MediaAssetHydratedSerializer(serializers.ModelSerializer):
    """Compact shape used when hydrating content blocks in another app's payload.

    Deliberately excludes upload/write machinery — this is read-only, resolved
    from an ``assetId`` in a Tiptap document.
    """

    url = serializers.SerializerMethodField()

    class Meta:
        model = MediaAsset
        fields = [
            "id",
            "kind",
            "url",
            "alt_text",
            "caption",
            "credit",
            "width",
            "height",
            "blurhash",
            "focal_x",
            "focal_y",
            "duration",
        ]

    def get_url(self, obj):
        return media_file_url(obj)
