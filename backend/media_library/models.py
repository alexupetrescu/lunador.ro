from django.conf import settings
from django.db import models


class MediaTag(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class MediaAsset(models.Model):
    """A first-class media object. Content blocks reference these by ``id`` only,
    so fixing metadata (alt text, caption, credit) updates every place that uses
    the asset.
    """

    class Kind(models.TextChoices):
        IMAGE = "image", "Image"
        VIDEO = "video", "Video"
        FILE = "file", "File"

    kind = models.CharField(
        max_length=10,
        choices=Kind.choices,
        blank=True,
        default="",
    )
    file = models.FileField(upload_to="media/%Y/%m/")
    title = models.CharField(max_length=255, blank=True)
    alt_text = models.CharField(max_length=500, blank=True)
    caption = models.TextField(blank=True)
    credit = models.CharField(max_length=255, blank=True)

    # image metadata — computed on upload
    width = models.PositiveIntegerField(null=True, blank=True)
    height = models.PositiveIntegerField(null=True, blank=True)
    blurhash = models.CharField(max_length=64, blank=True)
    focal_x = models.FloatField(default=0.5)
    focal_y = models.FloatField(default=0.5)

    # video
    duration = models.FloatField(null=True, blank=True)
    poster = models.ForeignKey(
        "self", null=True, blank=True, on_delete=models.SET_NULL, related_name="+"
    )

    tags = models.ManyToManyField(MediaTag, blank=True)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title or self.file.name
