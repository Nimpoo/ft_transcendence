from django.forms import model_to_dict
from django.http import HttpRequest, JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.http import require_GET
from django.views import View

import requests
import json
import jwt

from backend import settings
from users.models import User
from utils.decorators import need_user
from random_username.generate import generate_username


class Index(View):

  def get(self, request: HttpRequest): # Get X users
    # todo: make parameters adjustable by the client
    page = 0
    page_size = 5
    # todo: add more params like: sort, range, filter
    return JsonResponse(list(User.objects.values())[page*page_size:page*page_size+page_size], safe=False)

  def post(self, request: HttpRequest): # Create user
    if len(request.body) == 0:
      return JsonResponse({'error': 'Bad Request', 'message': 'Missing body.'}, status=400)

    try:
      body_payload = json.loads(request.body.decode('utf-8'))
    except json.JSONDecodeError:
      return JsonResponse({'error': 'Bad Request', 'message': 'Body must be JSON.'}, status=400)

    token = body_payload.get('token')

    if token is None:
      return JsonResponse({'error': 'Bad Request', 'message': 'Missing required fields.'}, status=400)

    response = requests.get('https://api.intra.42.fr/v2/me', headers={'Authorization': f'Bearer {token}'})
    if response.status_code != 200:
      print({ 'status': response.status_code, "token": token })
      return JsonResponse({'error': 'Forbidden', 'message': 'The given token is not valid.'}, status=403)

    try:
      data = response.json()
    except ValueError:
      return JsonResponse({'error': 'Gone', 'message': 'Something went wrong, try again later.'}, status=410)

    fortytwo_id = data.get('id')
    if fortytwo_id is None:
      return JsonResponse({'error': 'WTF??', 'message': 'no id were given in fortytwo response'}, status=403)

    user, create = User.objects.get_or_create(nickname=data.get('login') or generate_username()[0], fortytwo_id=fortytwo_id)

    return JsonResponse({'access_token': jwt.encode(model_to_dict(user, exclude=['friends', 'blocked']), settings.JWT_SECRET)})

@require_GET
def get_user(request: HttpRequest, user_id: int) -> JsonResponse:
  user = get_object_or_404(User, pk=user_id)
  return JsonResponse(model_to_dict(user))

@require_GET
@need_user
def me(request: HttpRequest, user: User) -> JsonResponse:
  return JsonResponse(model_to_dict(user))
