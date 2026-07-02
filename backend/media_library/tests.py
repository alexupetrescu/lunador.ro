import tempfile
from io import BytesIO

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from PIL import Image

from .models import MediaAsset


def make_png(width=12, height=9, color=(120, 30, 200)):
    buf = BytesIO()
    Image.new("RGB", (width, height), color).save(buf, format="PNG")
    buf.seek(0)
    return SimpleUploadedFile("sample.png", buf.read(), content_type="image/png")


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class MediaMetadataTests(TestCase):
    def test_image_metadata_extracted_on_upload(self):
        asset = MediaAsset.objects.create(file=make_png(width=12, height=9))
        asset.refresh_from_db()
        self.assertEqual(asset.kind, MediaAsset.Kind.IMAGE)
        self.assertEqual(asset.width, 12)
        self.assertEqual(asset.height, 9)
        self.assertTrue(asset.blurhash)

    def test_non_image_kind_detection(self):
        upload = SimpleUploadedFile(
            "notes.txt", b"hello world", content_type="text/plain"
        )
        asset = MediaAsset.objects.create(file=upload)
        asset.refresh_from_db()
        self.assertEqual(asset.kind, MediaAsset.Kind.FILE)
        self.assertIsNone(asset.width)
