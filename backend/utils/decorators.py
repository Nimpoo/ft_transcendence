from django.http import HttpRequest, JsonResponse
from django.shortcuts import get_object_or_404

from django.conf import settings
from users.models import User

import jwt


def jwt_verify(view):
    def wrapper(request: HttpRequest, *args, **kwargs):
        authorization = request.headers.get("Authorization")

        if authorization is None:
            return JsonResponse(
                {
                    "error": "Unauthorized",
                    "message": "Authorization header is missing.",
                },
                status=401,
            )

        if not authorization.startswith("Bearer "):
            return JsonResponse(
                {
                    "error": "Forbidden",
                    "message": "Only 'Bearer' authorization type is accepted.",
                },
                status=401,
            )

        token = authorization[7:].strip()

        try:
            payload = jwt.decode(
                token, settings.JWT_SECRET, algorithms=["HS256"], verify=True
            )
        except jwt.PyJWTError:
            return JsonResponse(
                {"error": "Invalid JWT", "message": "The provided JWT is not valid."},
                status=401,
            )

        request.payload = payload
        return view(request, *args, **kwargs)

    return wrapper


def need_user(view):
    @jwt_verify
    def wrapper(request: HttpRequest, *args, **kwargs):
        return view(
            request,
            get_object_or_404(User, id=request.payload.get("id")),
            *args,
            **kwargs
        )

    return wrapper
