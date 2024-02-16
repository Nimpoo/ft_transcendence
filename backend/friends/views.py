from django.forms import model_to_dict
from django.http import HttpRequest, JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.http import require_POST, require_GET

from users.models import User
from friends.models import FriendRequest
from utils.decorators import jwt_verify

import json


@require_GET
def get_user_friends_list(request: HttpRequest, user_id: int) -> JsonResponse:
  user = get_object_or_404(User, pk=user_id)
  return JsonResponse(list(user.friends.values()), safe=False)

@require_POST
@jwt_verify
def add_friend(request: HttpRequest) -> JsonResponse:
  body_payload = json.loads(request.body.decode('utf-8'))
  sender_id, receiver_id = int(request.payload.get('id')), int(body_payload['user_id'])

  if None in [sender_id, receiver_id]:
    return JsonResponse({'error': 'Bad Request', 'message': 'Missing required fields.'}, status=400)

  if sender_id == receiver_id:
    return JsonResponse({'error': 'Bad Request', 'message': 'IDs are equal.'}, status=400)

  sender = get_object_or_404(User, pk=sender_id)
  receiver = get_object_or_404(User, pk=receiver_id)

  if sender.friends.contains(receiver):
    return JsonResponse({'error': 'Bad Request', 'message': 'Already friend.'}, status=400)

  try: # has receiver already sent friend request
    friend_request = FriendRequest.objects.get(sender=receiver, receiver=sender, status='pending')
  except FriendRequest.DoesNotExist: # else create it
    friend_request, created = FriendRequest.objects.get_or_create(sender=sender, receiver=receiver, status='pending')
    return JsonResponse(model_to_dict(friend_request))

  friend_request.status = 'accepted'
  friend_request.save()

  sender.friends.add(receiver)
  print(friend_request)

  return JsonResponse(model_to_dict(friend_request))

@require_POST
@jwt_verify
def reject_friend(request: HttpRequest) -> JsonResponse:
  body_payload = json.loads(request.body.decode('utf-8'))
  sender_id, receiver_id = int(request.payload.get('id')), int(body_payload['user_id'])

  if None in [sender_id, receiver_id]:
    return JsonResponse({'error': 'Bad Request', 'message': 'Missing required fields.'}, status=400)

  if sender_id == receiver_id:
    return JsonResponse({'error': 'Bad Request', 'message': 'IDs are equal.'}, status=400)

  sender = get_object_or_404(User, pk=sender_id)
  receiver = get_object_or_404(User, pk=receiver_id)

  friend_request = get_object_or_404(FriendRequest, sender=receiver, receiver=sender, status='pending')
  friend_request.status = 'rejected'
  friend_request.save()

  print(friend_request)

  return JsonResponse(model_to_dict(friend_request))

@require_POST
@jwt_verify
def remove_friend(request: HttpRequest) -> JsonResponse:
  body_payload = json.loads(request.body.decode('utf-8'))
  sender_id, receiver_id = int(request.payload.get('id')), int(body_payload['user_id'])

  if None in [sender_id, receiver_id]:
    return JsonResponse({'error': 'Bad Request', 'message': 'Missing required fields.'}, status=400)

  if sender_id == receiver_id:
    return JsonResponse({'error': 'Bad Request', 'message': 'IDs are equal.'}, status=400)

  sender = get_object_or_404(User, pk=sender_id)
  receiver = get_object_or_404(User, pk=receiver_id)

  if not sender.friends.contains(receiver):
    return JsonResponse({'error': 'Bad Request', 'message': 'Not friend.'}, status=400)

  sender.friends.remove(receiver)

  return JsonResponse(list(sender.friends.values()), safe=False)
