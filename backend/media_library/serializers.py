from rest_framework import serializers

from .models import MediaAsset, MediaTag


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
        if not obj.file:
            return None
        url = obj.file.url
        request = self.context.get("request")
        if request is not None:
            return request.build_absolute_uri(url)
        return url


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
        if not obj.file:
            return None
        request = self.context.get("request")
        return request.build_absolute_uri(obj.file.url) if request else obj.file.url
