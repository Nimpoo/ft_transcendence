from django.http import HttpRequest, JsonResponse
from django.shortcuts import get_object_or_404


import jwt

from backend import settings
from users.models import User


def jwt_verify(view):
  def wrapper(request: HttpRequest, *args, **kwargs):
    authorization = request.headers.get('Authorization')

    if authorization is None:
      return JsonResponse({ 'error': 'Unauthorized', 'message': 'Authorization header is missing.' }, status=401)

    token_type, token = authorization.split()

    try:
      payload = jwt.decode(token, settings.JWT_SECRET, algorithms=['HS256'], verify=True)
    except jwt.PyJWTError:
      return JsonResponse({ 'error': 'Invalid JWT', 'message': 'The provided JWT is not valid.' }, status=401)

    request.payload = payload
    return view(request, *args, **kwargs)

  return wrapper

def need_user(view):
  @jwt_verify
  def wrapper(request: HttpRequest, *args, **kwargs):
    return view(request, get_object_or_404(User, pk=request.payload.get('id')), *args, **kwargs)

  return wrapper
