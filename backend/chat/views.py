from django.shortcuts import render

from django.views.decorators.http import require_POST, require_GET
from django.shortcuts import get_object_or_404
from django.http import HttpRequest, JsonResponse

from users.models import User
from utils.decorators import jwt_verify

import json

@require_GET
def get_user_blocked_list(request: HttpRequest, user_id: int) -> JsonResponse:
    user = get_object_or_404(User, pk=user_id)
    return JsonResponse(list(user.blocked.values()), safe=False)

@require_POST
@jwt_verify
def block(request: HttpRequest) -> JsonResponse:
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

    if sender.blocked.contains(receiver):
        return JsonResponse({'error': 'Bad Request', 'message': 'Already blocked.'}, status=400)
    
    sender.blocked.add(receiver)
    if sender.friends.contains(receiver):
        sender.friends.remove(receiver)
    print(receiver.login, 'is blocked')
    
    return JsonResponse(list(sender.blocked.values()), safe=False)
    
@require_POST
@jwt_verify
def unblock(request: HttpRequest) -> JsonResponse:
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

    if not sender.blocked.contains(receiver):
        return JsonResponse({'error': 'Bad Request', 'message': 'Already unblocked.'}, status=400)
    
    sender.blocked.remove(receiver)
    print(receiver.login, 'is unblocked')
    
    return JsonResponse(list(sender.blocked.values()), safe=False)