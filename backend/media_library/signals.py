from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import MediaAsset
from .services import apply_metadata


@receiver(post_save, sender=MediaAsset)
def populate_media_metadata(sender, instance: MediaAsset, created, **kwargs):
    """Fill in kind/dimensions/blurhash once, right after the file lands.

    Guarded so it only runs when derived data is actually missing, which keeps
    metadata edits (alt text, caption) from re-decoding the image every save.
    """
    needs_kind = not instance.kind
    needs_image_meta = (
        instance.kind == MediaAsset.Kind.IMAGE and not instance.width
    )
    if created or needs_kind or needs_image_meta:
        apply_metadata(instance)
