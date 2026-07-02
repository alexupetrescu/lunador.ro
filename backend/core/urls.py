from django.urls import path

from .views import csrf, health_check, login_view, logout_view, me

urlpatterns = [
    path("health/", health_check),
    path("auth/csrf/", csrf),
    path("auth/login/", login_view),
    path("auth/logout/", logout_view),
    path("auth/me/", me),
]
