from django.db import models
from django.utils import timezone


class PublishedQuerySet(models.QuerySet):
    """Reusable queryset for any concrete model inheriting ``Publishable``.

    ``live()`` returns only content that is public right now: a SCHEDULED post
    with a future ``published_at`` simply doesn't match, so scheduling needs no
    cron job to flip statuses.
    """

    def live(self):
        return self.filter(
            status__in=[
                Publishable.Status.PUBLISHED,
                Publishable.Status.SCHEDULED,
            ],
            published_at__lte=timezone.now(),
        )


class Publishable(models.Model):
    """Abstract publishing envelope shared by Post, Lesson, Recipe, ...

    Intentionally minimal: any field added here triggers a migration in every
    inheriting app. Hoist fields up only when they're genuinely universal.
    """

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"
        SCHEDULED = "scheduled", "Scheduled"
        ARCHIVED = "archived", "Archived"

    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    status = models.CharField(
        max_length=10, choices=Status.choices, default=Status.DRAFT
    )
    seo_title = models.CharField(max_length=70, blank=True)
    seo_description = models.CharField(max_length=160, blank=True)
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

    def __str__(self):
        return self.title
