"""Media metadata extraction: kind detection, image dimensions, blurhash.

Kept dependency-light and failure-tolerant — a broken/unsupported file should
never block the upload, it just leaves the derived fields empty.
"""
from __future__ import annotations

import mimetypes

from .models import MediaAsset

try:
    from PIL import Image
except ImportError:  # pragma: no cover - Pillow is a declared dependency
    Image = None

try:
    import blurhash as blurhash_lib
except ImportError:  # pragma: no cover - optional at runtime
    blurhash_lib = None


def detect_kind(asset: MediaAsset) -> str:
    guessed, _ = mimetypes.guess_type(asset.file.name)
    if guessed:
        if guessed.startswith("image/"):
            return MediaAsset.Kind.IMAGE
        if guessed.startswith("video/"):
            return MediaAsset.Kind.VIDEO
    return MediaAsset.Kind.FILE


def _blurhash_from_image(img) -> str:
    """Compute a compact blurhash from a PIL image.

    The pure-Python encoder wants a nested ``[row][col] -> (r, g, b)`` array, so
    we downscale hard first (blurhash detail is capped anyway) to keep the
    O(components x width x height) transform cheap.
    """
    thumb = img.copy()
    thumb.thumbnail((32, 32))
    width, height = thumb.size
    flat = list(thumb.getdata())
    pixels = [
        [flat[row * width + col] for col in range(width)] for row in range(height)
    ]
    return blurhash_lib.encode(pixels, components_x=4, components_y=3)


def _compute_image_metadata(asset: MediaAsset) -> dict:
    if Image is None:
        return {}
    data: dict = {}
    try:
        asset.file.open("rb")
        with Image.open(asset.file) as img:
            img = img.convert("RGB")
            data["width"], data["height"] = img.size
            if blurhash_lib is not None:
                data["blurhash"] = _blurhash_from_image(img)
    except Exception:
        return {}
    finally:
        try:
            asset.file.close()
        except Exception:
            pass
    return data


def extract_metadata(asset: MediaAsset) -> dict:
    """Return a dict of derived fields for the asset (does not save)."""
    fields: dict = {}
    if not asset.kind:
        fields["kind"] = detect_kind(asset)

    kind = fields.get("kind", asset.kind)
    if kind == MediaAsset.Kind.IMAGE:
        fields.update(_compute_image_metadata(asset))
    return fields


def apply_metadata(asset: MediaAsset) -> None:
    """Extract and persist derived metadata without re-triggering save signals."""
    fields = extract_metadata(asset)
    if fields:
        MediaAsset.objects.filter(pk=asset.pk).update(**fields)
        for key, value in fields.items():
            setattr(asset, key, value)
