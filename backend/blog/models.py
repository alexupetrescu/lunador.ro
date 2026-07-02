from django.conf import settings
from django.contrib.postgres.indexes import GinIndex
from django.contrib.postgres.search import SearchVector, SearchVectorField
from django.db import models
from django.utils import timezone

from core.models import Publishable, PublishedQuerySet

from .content import estimate_reading_time, extract_text


class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    parent = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="children",
    )
    description = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = "categories"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Tag(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Post(Publishable):
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)

    # content
    body = models.JSONField(default=dict)  # Tiptap document
    body_text = models.TextField(blank=True)  # denormalized plain text
    schema_version = models.PositiveSmallIntegerField(default=1)
    excerpt = models.TextField(blank=True)  # manual; fallback body_text[:N]
    reading_time = models.PositiveIntegerField(default=0)  # minutes, computed on save

    featured_image = models.ForeignKey(
        "media_library.MediaAsset",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
    )
    category = models.ForeignKey(
        Category, null=True, blank=True, on_delete=models.SET_NULL
    )
    tags = models.ManyToManyField(Tag, blank=True)

    # SEO extras beyond Publishable — nullable overrides with fallbacks
    og_image = models.ForeignKey(
        "media_library.MediaAsset",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
    )
    canonical_url = models.URLField(blank=True)
    noindex = models.BooleanField(default=False)

    search_vector = SearchVectorField(null=True)

    objects = PublishedQuerySet.as_manager()

    class Meta:
        ordering = ["-published_at", "-created_at"]
        indexes = [
            models.Index(fields=["status", "-published_at"]),
            GinIndex(fields=["search_vector"]),
        ]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        # Derive plain text + reading time from the JSON tree before persisting.
        self.body_text = extract_text(self.body)
        self.reading_time = estimate_reading_time(self.body_text)

        was_published = False
        old_slug = None
        if self.pk:
            previous = (
                Post.objects.filter(pk=self.pk)
                .values("status", "slug")
                .first()
            )
            if previous:
                was_published = previous["status"] == self.Status.PUBLISHED
                old_slug = previous["slug"]

        if self.status == self.Status.PUBLISHED and not self.published_at:
            self.published_at = timezone.now()

        super().save(*args, **kwargs)

        # Full-text index: title + body_text (never the raw JSON).
        Post.objects.filter(pk=self.pk).update(
            search_vector=SearchVector("title", weight="A")
            + SearchVector("body_text", weight="B")
        )

        # Slug changed on a post that was already published -> keep the old URL alive.
        if old_slug and old_slug != self.slug and was_published:
            SlugRedirect.objects.update_or_create(
                old_slug=old_slug, defaults={"post": self}
            )

    def snapshot_revision(self, user=None):
        return PostRevision.objects.create(
            post=self, title=self.title, body=self.body, saved_by=user
        )


class PostRevision(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="revisions")
    body = models.JSONField()
    title = models.CharField(max_length=255)
    saved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} @ {self.created_at:%Y-%m-%d %H:%M}"


class SlugRedirect(models.Model):
    old_slug = models.SlugField(max_length=255, unique=True)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.old_slug} -> {self.post.slug}"
