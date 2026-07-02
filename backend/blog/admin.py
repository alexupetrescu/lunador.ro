from django.contrib import admin

from .models import Category, Post, PostRevision, SlugRedirect, Tag


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "parent")
    list_filter = ("parent",)
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name",)


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name",)


class PostRevisionInline(admin.TabularInline):
    model = PostRevision
    extra = 0
    fields = ("title", "saved_by", "created_at")
    readonly_fields = ("title", "saved_by", "created_at")
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ("title", "status", "category", "author", "published_at", "reading_time")
    list_filter = ("status", "category", "tags")
    search_fields = ("title", "body_text")
    prepopulated_fields = {"slug": ("title",)}
    date_hierarchy = "published_at"
    autocomplete_fields = ("category", "featured_image", "og_image")
    filter_horizontal = ("tags",)
    readonly_fields = ("body_text", "reading_time", "created_at", "updated_at")
    inlines = [PostRevisionInline]

    def save_model(self, request, obj, form, change):
        if not obj.author_id:
            obj.author = request.user
        super().save_model(request, obj, form, change)


@admin.register(SlugRedirect)
class SlugRedirectAdmin(admin.ModelAdmin):
    list_display = ("old_slug", "post")
    search_fields = ("old_slug",)
