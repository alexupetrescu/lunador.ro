from rest_framework import serializers

from media_library.models import MediaAsset
from media_library.serializers import MediaAssetHydratedSerializer

from .content import collect_asset_ids
from .models import Category, Post, PostRevision, Tag

EXCERPT_FALLBACK_LENGTH = 200


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug", "parent", "description"]


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ["id", "name", "slug"]


class _SeoMixin(serializers.Serializer):
    """Resolves the override-with-fallback SEO fields in one place."""

    seo = serializers.SerializerMethodField()

    def get_seo(self, obj):
        excerpt = obj.excerpt or (obj.body_text or "")[:EXCERPT_FALLBACK_LENGTH]
        return {
            "title": obj.seo_title or obj.title,
            "description": obj.seo_description or excerpt,
            "canonical_url": obj.canonical_url,
            "noindex": obj.noindex,
        }


class PostListSerializer(_SeoMixin, serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    featured_image = MediaAssetHydratedSerializer(read_only=True)
    excerpt = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            "id",
            "title",
            "slug",
            "status",
            "excerpt",
            "reading_time",
            "published_at",
            "updated_at",
            "featured_image",
            "category",
            "tags",
            "seo",
        ]

    def get_excerpt(self, obj):
        return obj.excerpt or (obj.body_text or "")[:EXCERPT_FALLBACK_LENGTH]


class PostDetailSerializer(PostListSerializer):
    """Adds the full body plus a hydrated ``media`` map so the frontend renders
    media blocks without a per-asset request waterfall.
    """

    og_image = MediaAssetHydratedSerializer(read_only=True)
    media = serializers.SerializerMethodField()
    author = serializers.SerializerMethodField()

    class Meta(PostListSerializer.Meta):
        fields = PostListSerializer.Meta.fields + [
            "body",
            "body_text",
            "schema_version",
            "author",
            "og_image",
            "created_at",
            "media",
        ]

    def get_author(self, obj):
        user = obj.author
        return {
            "id": user.id,
            "name": user.get_full_name() or user.get_username(),
        }

    def get_media(self, obj):
        asset_ids = collect_asset_ids(obj.body)
        if not asset_ids:
            return {}
        assets = MediaAsset.objects.filter(id__in=asset_ids)
        serializer = MediaAssetHydratedSerializer(
            assets, many=True, context=self.context
        )
        return {str(item["id"]): item for item in serializer.data}


class PostAuthoringSerializer(serializers.ModelSerializer):
    """Full read/write shape for the admin editor. Exposes drafts and every
    field; ``author`` is set from the request in the view.
    """

    tag_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        write_only=True,
        required=False,
        queryset=Tag.objects.all(),
        source="tags",
    )
    tags = TagSerializer(many=True, read_only=True)
    featured_image_detail = MediaAssetHydratedSerializer(
        source="featured_image", read_only=True
    )
    og_image_detail = MediaAssetHydratedSerializer(source="og_image", read_only=True)
    media = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            "id",
            "title",
            "slug",
            "status",
            "body",
            "body_text",
            "excerpt",
            "reading_time",
            "schema_version",
            "featured_image",
            "featured_image_detail",
            "og_image",
            "og_image_detail",
            "category",
            "tags",
            "tag_ids",
            "seo_title",
            "seo_description",
            "canonical_url",
            "noindex",
            "published_at",
            "created_at",
            "updated_at",
            "media",
        ]
        read_only_fields = ["body_text", "reading_time", "created_at", "updated_at"]

    def get_media(self, obj):
        asset_ids = collect_asset_ids(obj.body)
        if not asset_ids:
            return {}
        assets = MediaAsset.objects.filter(id__in=asset_ids)
        serializer = MediaAssetHydratedSerializer(
            assets, many=True, context=self.context
        )
        return {str(item["id"]): item for item in serializer.data}


class PostRevisionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostRevision
        fields = ["id", "title", "body", "saved_by", "created_at"]
