from asgiref.sync import sync_to_async
import jwt

from backend import settings
from users.models import User


class QueryAuthMiddleware:

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        query_params = scope["query_string"].decode().split("&")
        tokens = [param for param in query_params if param.startswith("token=")]

        if tokens.__len__() <= 0:
            return await self.app(scope, receive, send)

        token = tokens[0][6:]

        try:
            payload = await sync_to_async(jwt.decode)(
                token, settings.JWT_SECRET, algorithms=["HS256"], verify=True
            )
        except jwt.DecodeError:
            return await self.app(scope, receive, send)

        try:
            scope["user"] = await sync_to_async(User.objects.get)(pk=payload.get("id"))
            scope["user_id"] = payload.get("id")
        except User.DoesNotExist:
            return await self.app(scope, receive, send)

        return await self.app(scope, receive, send)
