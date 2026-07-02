from django.contrib import admin
from django.utils.html import format_html

from .models import MediaAsset, MediaTag


@admin.register(MediaTag)
class MediaTagAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name",)


@admin.register(MediaAsset)
class MediaAssetAdmin(admin.ModelAdmin):
    list_display = ("thumb", "title", "kind", "width", "height", "created_at")
    list_display_links = ("thumb", "title")
    list_filter = ("kind", "tags")
    search_fields = ("title", "alt_text", "caption", "credit")
    readonly_fields = ("width", "height", "blurhash", "duration", "created_at", "preview")
    filter_horizontal = ("tags",)
    autocomplete_fields = ("poster",)

    @admin.display(description="")
    def thumb(self, obj):
        if obj.kind == MediaAsset.Kind.IMAGE and obj.file:
            return format_html(
                '<img src="{}" style="height:40px;width:40px;object-fit:cover;'
                'border-radius:4px;" />',
                obj.file.url,
            )
        return format_html('<span style="opacity:.5;">{}</span>', obj.kind or "file")

    @admin.display(description="Preview")
    def preview(self, obj):
        if obj.kind == MediaAsset.Kind.IMAGE and obj.file:
            return format_html(
                '<img src="{}" style="max-height:280px;max-width:100%;" />', obj.file.url
            )
        if obj.file:
            return format_html('<a href="{}">{}</a>', obj.file.url, obj.file.name)
        return "—"

    def save_model(self, request, obj, form, change):
        if not obj.uploaded_by_id:
            obj.uploaded_by = request.user
        super().save_model(request, obj, form, change)
