from django.forms import model_to_dict
from django.http import HttpRequest, JsonResponse
from django.utils.decorators import method_decorator
from django.views import View

import requests

from users.models import User
from utils.decorators import apiKey_verify, jwt_verify


PROVIDER_URLS = {
  'fortytwo': 'https://api.intra.42.fr/v2/me',
  'github': 'https://api.github.com/user',
  'discord': 'https://discord.com/api/users/@me',
}

class Index(View):

  def get(self, request: HttpRequest): # Get X users
    # todo: make parameters adjustable by the client
    page = 0
    page_size = 5
    # todo: add more params like: sort, range, filter
    return JsonResponse(list(User.objects.values())[page*page_size:page*page_size+page_size], safe=False)

  @method_decorator((apiKey_verify, jwt_verify), name='dispatch')
  def post(self, request: HttpRequest): # Create user
    token, provider, provider_id = request.payload.get('token'), request.payload.get('provider'), request.payload.get('providerId')
    print({'provider':provider, 'provider_id': provider_id})

    if None in [token, provider, provider_id]:
      return JsonResponse({'error': 'Bad Request', 'message': 'Missing required fields.'}, status=400)

    provider_url = PROVIDER_URLS.get(provider)
    if not provider_url:
      return JsonResponse({'error': 'Forbidden', 'message': 'The given provider is not valid.'}, status=403)

    response = requests.get(provider_url, headers={'Authorization': f'Bearer {token}'})
    if response.status_code != 200:
      return JsonResponse({'error': 'Forbidden', 'message': 'The given token is not valid.'}, status=403)

    try:
      data = response.json()
    except ValueError:
      return JsonResponse({'error': 'Gone', 'message': 'Something went wrong, try again later.'}, status=410)

    if str(data.get('id')) != provider_id:
      return JsonResponse({'error': 'Forbidden', 'message': 'Given ID not valid.'}, status=403)

    try:
      user = User.objects.get(**{f'{provider}_id': provider_id})
    except User.DoesNotExist:
      user = User(**{f'{provider}_id': provider_id})
      user.save()

    return JsonResponse(model_to_dict(user))
