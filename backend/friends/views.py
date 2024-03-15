from django.dispatch import receiver
from django.forms import model_to_dict
from django.http import HttpRequest, JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.http import require_POST, require_GET

from users.models import User
from friends.models import FriendRequest
from utils.decorators import jwt_verify, need_user

import json


@require_GET
def get_user_friends_list(request: HttpRequest, user_id: int) -> JsonResponse:
  user = get_object_or_404(User, pk=user_id)
  return JsonResponse(list(user.friends.values('id', 'login', 'created_at')), safe=False)

@require_GET
@need_user
def get_friend_request(request: HttpRequest, user: User) -> JsonResponse:
  query_id = request.GET.get('id')

  if (query_id is None):
    return JsonResponse({'error': 'Bad Request', 'message': 'Missing id.'}, status=400)

  try:
    return JsonResponse(model_to_dict(FriendRequest.objects.get(sender=user, receiver_id=query_id, status__in=[FriendRequest.STATUS_PENDING, FriendRequest.STATUS_ACCEPTED])))
  except FriendRequest.DoesNotExist:
    return JsonResponse(model_to_dict(get_object_or_404(FriendRequest, sender_id=query_id, receiver=user, status__in=[FriendRequest.STATUS_PENDING, FriendRequest.STATUS_ACCEPTED])))

@require_POST
@jwt_verify
def add_friend(request: HttpRequest) -> JsonResponse:
  if len(request.body) == 0:
    return JsonResponse({'error': 'Bad Request', 'message': 'Missing body.'}, status=400)

  try:
    body_payload = json.loads(request.body.decode('utf-8'))
  except json.JSONDecodeError:
    return JsonResponse({'error': 'Bad Request', 'message': 'Body must be JSON.'}, status=400)

  sender_id, receiver_id = request.payload.get('id'), body_payload.get('user_id')

  if None in [sender_id, receiver_id]:
    return JsonResponse({'error': 'Bad Request', 'message': 'Missing required fields.'}, status=400)

  sender_id, receiver_id = int(sender_id), int(receiver_id)

  if sender_id == receiver_id:
    return JsonResponse({'error': 'Bad Request', 'message': 'IDs are equal.'}, status=400)

  sender = get_object_or_404(User, pk=sender_id)
  receiver = get_object_or_404(User, pk=receiver_id)

  if sender.friends.contains(receiver):
    return JsonResponse({'error': 'Bad Request', 'message': 'Already friend.'}, status=400)

  try: # has receiver already sent friend request
    friend_request = FriendRequest.objects.get(sender=receiver, receiver=sender, status=FriendRequest.STATUS_PENDING)
  except FriendRequest.DoesNotExist: # else create it
    friend_request, created = FriendRequest.objects.get_or_create(sender=sender, receiver=receiver, status=FriendRequest.STATUS_PENDING)
    return JsonResponse(model_to_dict(friend_request))

  friend_request.status = FriendRequest.STATUS_ACCEPTED
  friend_request.save()

  sender.friends.add(receiver)
  print(friend_request)

  return JsonResponse(model_to_dict(friend_request))

@require_POST
@jwt_verify
def reject_friend(request: HttpRequest) -> JsonResponse:
  if len(request.body) == 0:
    return JsonResponse({'error': 'Bad Request', 'message': 'Missing body.'}, status=400)

  try:
    body_payload = json.loads(request.body.decode('utf-8'))
  except json.JSONDecodeError:
    return JsonResponse({'error': 'Bad Request', 'message': 'Body must be JSON.'}, status=400)

  sender_id, receiver_id = request.payload.get('id'), body_payload.get('user_id')

  if None in [sender_id, receiver_id]:
    return JsonResponse({'error': 'Bad Request', 'message': 'Missing required fields.'}, status=400)

  sender_id, receiver_id = int(sender_id), int(receiver_id)

  if sender_id == receiver_id:
    return JsonResponse({'error': 'Bad Request', 'message': 'IDs are equal.'}, status=400)

  sender = get_object_or_404(User, pk=sender_id)
  receiver = get_object_or_404(User, pk=receiver_id)

  friend_request = get_object_or_404(FriendRequest, sender=receiver, receiver=sender, status=FriendRequest.STATUS_PENDING)
  friend_request.status = FriendRequest.STATUS_REJECTED
  friend_request.save()

  print(friend_request)

  return JsonResponse(model_to_dict(friend_request))

@require_POST
@jwt_verify
def remove_friend(request: HttpRequest) -> JsonResponse:
  if len(request.body) == 0:
    return JsonResponse({'error': 'Bad Request', 'message': 'Missing body.'}, status=400)

  try:
    body_payload = json.loads(request.body.decode('utf-8'))
  except json.JSONDecodeError:
    return JsonResponse({'error': 'Bad Request', 'message': 'Body must be JSON.'}, status=400)

  sender_id, receiver_id = request.payload.get('id'), body_payload.get('user_id')

  if None in [sender_id, receiver_id]:
    return JsonResponse({'error': 'Bad Request', 'message': 'Missing required fields.'}, status=400)

  sender_id, receiver_id = int(sender_id), int(receiver_id)

  if sender_id == receiver_id:
    return JsonResponse({'error': 'Bad Request', 'message': 'IDs are equal.'}, status=400)

  sender = get_object_or_404(User, pk=sender_id)
  receiver = get_object_or_404(User, pk=receiver_id)

  if not sender.friends.contains(receiver):
    return JsonResponse({'error': 'Bad Request', 'message': 'Not friend.'}, status=400)

  try:
    friend_request = FriendRequest.objects.get(sender=sender, receiver=receiver, status__in=[FriendRequest.STATUS_PENDING, FriendRequest.STATUS_ACCEPTED])
  except FriendRequest.DoesNotExist:
    friend_request = get_object_or_404(FriendRequest, sender=receiver, receiver=sender, status__in=[FriendRequest.STATUS_PENDING, FriendRequest.STATUS_ACCEPTED])

  friend_request.status = FriendRequest.STATUS_REMOVED
  friend_request.save()

  sender.friends.remove(receiver)

  return JsonResponse(list(sender.friends.values()), safe=False)
