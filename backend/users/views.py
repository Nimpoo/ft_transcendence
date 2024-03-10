from django.http import JsonResponse, HttpRequest
from django.views.decorators.http import require_POST
from .models import User
import jwt
import requests
import os

# Constants for provider names and URLs
PROVIDER_URLS = {
  '42-school': 'https://api.intra.42.fr/v2/me',
  'github': 'https://api.github.com/user',
  'discord': 'https://discord.com/api/users/@me',
}

@require_POST
def connect(request: HttpRequest) -> JsonResponse:
  # Is jwt valid
  try:
    data = jwt.decode(request.body, os.environ['JWT_SECRET'], algorithms=['HS256'])
  except jwt.DecodeError:
    return JsonResponse({'error': 'Forbidden', 'message': 'The given JWT is not valid.'}, status=403)

  # Check for required fields in the decoded JWT payload
  token, provider, provider_id = data.get('access_token'), data.get('provider'), data.get('providerAccountId')
  if None in [token, provider, provider_id]:
    return JsonResponse({'error': 'Bad Request', 'message': 'Missing required fields.'}, status=400)

  # Validate provider and get URL
  provider_url = PROVIDER_URLS.get(provider)
  if not provider_url:
    return JsonResponse({'error': 'Forbidden', 'message': 'The given provider is not valid.'}, status=403)

  # Validate token and get user data
  response = requests.get(provider_url, headers={'Authorization': f'Bearer {token}'})
  if response.status_code != 200:
    return JsonResponse({'error': 'Forbidden', 'message': 'The given token is not valid.'}, status=403)

  try:
    data = response.json()
  except ValueError:
    return JsonResponse({'error': 'Gone', 'message': 'Something went wrong, try again later.'}, status=410)

  # Check if the given ID is valid
  if str(data.get('id')) != provider_id:
    return JsonResponse({'error': 'Forbidden', 'message': 'Given ID not valid.'}, status=403)

  # Get or create user object
  if provider == '42-school':
    field_name = 'fortytwo_id'
  elif provider == 'github':
    field_name = 'github_id'
  elif provider == 'discord':
    field_name = 'discord_id'
  else:
    return JsonResponse({'error': 'Forbidden', 'message': 'Invalid provider.'}, status=403)

  try:
    user = User.objects.get(**{field_name: provider_id})
  except User.DoesNotExist:
    user = User(**{field_name: provider_id})
    user.save()

  # Send back the nickname
  return JsonResponse({'nickname': user.nickname})
