from rest_framework.routers import DefaultRouter

from .views import MediaAssetViewSet, MediaTagViewSet

router = DefaultRouter()
router.register("assets", MediaAssetViewSet, basename="mediaasset")
router.register("tags", MediaTagViewSet, basename="mediatag")

urlpatterns = router.urls
