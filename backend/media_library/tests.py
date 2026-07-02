import tempfile
from io import BytesIO

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from PIL import Image
from rest_framework.test import APIClient

from .models import MediaAsset


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


def make_png(width=8, height=6, color=(100, 50, 200)):
    buf = BytesIO()
    Image.new("RGB", (width, height), color).save(buf, format="PNG")
    buf.seek(0)
    return SimpleUploadedFile("sample.png", buf.read(), content_type="image/png")


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class MediaApiUploadTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="editor",
            password="pass12345",
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_multipart_upload_creates_asset(self):
        res = self.client.post(
            "/api/media/assets/",
            {"file": make_png()},
            format="multipart",
        )
        self.assertEqual(res.status_code, 201, res.content)
        self.assertEqual(res.data["kind"], MediaAsset.Kind.IMAGE)
        self.assertEqual(MediaAsset.objects.count(), 1)

    def test_upload_requires_authentication(self):
        anon = APIClient()
        res = anon.post(
            "/api/media/assets/",
            {"file": make_png()},
            format="multipart",
        )
        self.assertEqual(res.status_code, 403)

    def test_upload_without_file_returns_400(self):
        res = self.client.post("/api/media/assets/", {}, format="multipart")
        self.assertEqual(res.status_code, 400)
        self.assertIn("file", res.data)
