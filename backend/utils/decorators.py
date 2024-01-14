from django.http import HttpRequest, JsonResponse

import jwt

from backend import settings


def jwt_verify(view):
  def wrapper(request: HttpRequest, *args, **kwargs):
    authorization = request.headers.get('Authorization')

    if authorization is None:
      return JsonResponse({ 'error': 'Unauthorized', 'message': 'Authorization header is missing.' }, status=401)

    token_type, token = authorization.split()
    print('Authorization:', token_type, token)

    try:
      payload = jwt.decode(token, settings.JWT_SECRET, algorithms=['HS256'])
    except jwt.PyJWTError:
      return JsonResponse({ 'error': 'Invalid JWT', 'message': 'The provided JWT is not valid.' }, status=401)

    request.payload = payload
    return view(request, *args, **kwargs)

  return wrapper

def apiKey_verify(view):
  def wrapper(request: HttpRequest, *args, **kwargs):
    api_key = request.headers.get('X-API-KEY')
    print('X-API-KEY:', api_key)
    if api_key != settings.API_KEY:
      return JsonResponse({ 'error': 'Invalid API key', 'message': 'The provided API key is not valid.' }, status=401)
    return view(request, *args, **kwargs)

  return wrapper
