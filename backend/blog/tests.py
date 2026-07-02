from datetime import timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from .models import Post, SlugRedirect

User = get_user_model()


def make_doc(*paragraphs, heading=None):
    content = []
    if heading:
        content.append(
            {"type": "heading", "attrs": {"level": 2},
             "content": [{"type": "text", "text": heading}]}
        )
    for text in paragraphs:
        content.append(
            {"type": "paragraph", "content": [{"type": "text", "text": text}]}
        )
    return {"type": "doc", "content": content}


class DerivationTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user("author", password="pw")

    def test_body_text_and_reading_time(self):
        words = " ".join(["word"] * 440)  # ~2 minutes at 220 wpm
        post = Post.objects.create(
            title="Derived",
            slug="derived",
            author=self.user,
            body=make_doc(words, heading="Heading"),
        )
        self.assertIn("Heading", post.body_text)
        self.assertIn("word", post.body_text)
        self.assertEqual(post.reading_time, 2)

    def test_empty_body(self):
        post = Post.objects.create(
            title="Empty", slug="empty", author=self.user, body={}
        )
        self.assertEqual(post.body_text, "")
        self.assertEqual(post.reading_time, 0)


class LiveQuerySetTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user("author", password="pw")
        now = timezone.now()

        def mk(slug, status, when):
            return Post.objects.create(
                title=slug, slug=slug, author=cls.user, status=status,
                published_at=when, body=make_doc("hi"),
            )

        cls.published = mk("pub", Post.Status.PUBLISHED, now - timedelta(hours=1))
        cls.scheduled_past = mk("sched-past", Post.Status.SCHEDULED, now - timedelta(minutes=5))
        cls.scheduled_future = mk("sched-future", Post.Status.SCHEDULED, now + timedelta(days=1))
        cls.draft = mk("draft", Post.Status.DRAFT, None)

    def test_live_includes_published_and_due_scheduled(self):
        live_slugs = set(Post.objects.live().values_list("slug", flat=True))
        self.assertIn("pub", live_slugs)
        self.assertIn("sched-past", live_slugs)

    def test_live_excludes_future_and_draft(self):
        live_slugs = set(Post.objects.live().values_list("slug", flat=True))
        self.assertNotIn("sched-future", live_slugs)
        self.assertNotIn("draft", live_slugs)


class SlugRedirectTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user("author", password="pw")

    def test_redirect_written_on_published_rename(self):
        post = Post.objects.create(
            title="Original", slug="original", author=self.user,
            status=Post.Status.PUBLISHED, published_at=timezone.now(),
            body=make_doc("body"),
        )
        post.slug = "renamed"
        post.save()
        self.assertTrue(SlugRedirect.objects.filter(old_slug="original", post=post).exists())

    def test_no_redirect_for_draft_rename(self):
        post = Post.objects.create(
            title="Draft", slug="draft-a", author=self.user, body=make_doc("body"),
        )
        post.slug = "draft-b"
        post.save()
        self.assertFalse(SlugRedirect.objects.filter(old_slug="draft-a").exists())


class SearchApiTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user("author", password="pw")
        now = timezone.now()
        Post.objects.create(
            title="Astronomy at dusk", slug="astronomy", author=cls.user,
            status=Post.Status.PUBLISHED, published_at=now,
            body=make_doc("Observing distant nebulae through a telescope."),
        )
        Post.objects.create(
            title="Baking sourdough", slug="sourdough", author=cls.user,
            status=Post.Status.PUBLISHED, published_at=now,
            body=make_doc("A slow ferment with rye flour and patience."),
        )

    def test_full_text_search_matches_body(self):
        res = self.client.get("/api/blog/posts/", {"search": "telescope"})
        self.assertEqual(res.status_code, 200)
        slugs = [p["slug"] for p in res.json()["results"]]
        self.assertEqual(slugs, ["astronomy"])

    def test_full_text_search_matches_title(self):
        res = self.client.get("/api/blog/posts/", {"search": "sourdough"})
        slugs = [p["slug"] for p in res.json()["results"]]
        self.assertEqual(slugs, ["sourdough"])


class RevisionRestoreTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user("author", password="pw", is_staff=True)
        self.client = APIClient()
        self.client.force_authenticate(self.user)
        self.post = Post.objects.create(
            title="V1", slug="versioned", author=self.user, body=make_doc("first body"),
        )

    def test_restore_reverts_title_and_body(self):
        # Publish snapshots the current (V1) state.
        self.client.post(f"/api/blog/admin/posts/{self.post.slug}/publish/")
        revision_id = self.post.revisions.first().id

        # Edit to V2.
        self.post.title = "V2"
        self.post.body = make_doc("second body")
        self.post.save()

        res = self.client.post(
            f"/api/blog/admin/posts/{self.post.slug}/revisions/{revision_id}/restore/"
        )
        self.assertEqual(res.status_code, 200)
        self.post.refresh_from_db()
        self.assertEqual(self.post.title, "V1")
        self.assertIn("first body", self.post.body_text)

    def test_schedule_action_sets_status(self):
        when = (timezone.now() + timedelta(days=2)).isoformat()
        res = self.client.post(
            f"/api/blog/admin/posts/{self.post.slug}/schedule/",
            {"published_at": when},
            format="json",
        )
        self.assertEqual(res.status_code, 200)
        self.post.refresh_from_db()
        self.assertEqual(self.post.status, Post.Status.SCHEDULED)
        self.assertIsNotNone(self.post.published_at)
