from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response


@api_view(["GET"])
def health_check(request):
    return Response({"status": "ok", "project": "lunador"})


def _user_payload(user):
    return {
        "id": user.id,
        "username": user.get_username(),
        "name": user.get_full_name() or user.get_username(),
        "email": user.email,
        "is_staff": user.is_staff,
    }


@api_view(["GET"])
@permission_classes([AllowAny])
def csrf(request):
    """Prime the CSRF cookie so the SPA can send the token on mutations."""
    return Response({"csrfToken": get_token(request)})


@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get("username")
    password = request.data.get("password")
    user = authenticate(request, username=username, password=password)
    if user is None:
        return Response(
            {"detail": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED
        )
    login(request, user)
    return Response(_user_payload(user))


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    logout(request)
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    return Response(_user_payload(request.user))
