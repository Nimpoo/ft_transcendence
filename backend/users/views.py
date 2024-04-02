from django.forms import model_to_dict
from django.http import HttpRequest, JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.http import require_GET, require_POST
from django.utils.decorators import method_decorator
from django.views import View
from django.db.models import Q

import requests
import json
import jwt
import pyotp

from backend import settings
from users.models import User
from utils.decorators import need_user
from random_username.generate import generate_username


class Index(View):

    def get(self, request: HttpRequest):  # Get X users
        # todo: make parameters adjustable by the client
        page = 0
        page_size = 5
        # todo: add more params like: sort, range, filter
        return JsonResponse(
            list(User.objects.values("id", "login", "display_name", "created_at"))[
                page * page_size : page * page_size + page_size
            ],
            safe=False,
        )

    def post(self, request: HttpRequest):  # Create user
        if len(request.body) == 0:
            return JsonResponse(
                {"error": "Bad Request", "message": "Missing body."}, status=400
            )

        try:
            body_payload = json.loads(request.body.decode("utf-8"))
        except json.JSONDecodeError:
            return JsonResponse(
                {"error": "Bad Request", "message": "Body must be JSON."}, status=400
            )

        token = body_payload.get("token")

        if token is None:
            return JsonResponse(
                {"error": "Bad Request", "message": "Missing required fields."},
                status=400,
            )

        response = requests.get(
            "https://api.intra.42.fr/v2/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        if response.status_code != 200:
            print({"status": response.status_code, "token": token})
            return JsonResponse(
                {"error": "Forbidden", "message": "The given token is not valid."},
                status=403,
            )

        try:
            data = response.json()
        except ValueError:
            return JsonResponse(
                {"error": "Gone", "message": "Something went wrong, try again later."},
                status=410,
            )

        fortytwo_id = data.get("id")
        if fortytwo_id is None:
            return JsonResponse(
                {"error": "WTF??", "message": "no id were given in fortytwo response"},
                status=403,
            )

        user, created = User.objects.get_or_create(
            login=data.get("login") or generate_username()[0], fortytwo_id=fortytwo_id
        )

        if created:
            user.display_name = user.login
            user.save()

        if user.dfa_secret:
            dfa = body_payload.get("dfa")
            if dfa is None:
                return JsonResponse(
                    {"error": "dfa", "message": "DFA required for this account."},
                    status=406,
                )

            if not pyotp.TOTP(user.dfa_secret).verify(dfa):
                return JsonResponse(
                    {"error": "dfa", "message": "Digits not correct."}, status=401
                )

        return JsonResponse(
            {
                "access_token": jwt.encode(
                    model_to_dict(
                        user, fields=["id", "login", "display_name", "created_at"]
                    ),
                    settings.JWT_SECRET,
                )
            }
        )


@require_GET
def get_user(request: HttpRequest) -> JsonResponse:
    query_id, query_login = request.GET.get("id"), request.GET.get("login")

    if query_id is not None:
        if query_login is not None:
            query = {"id": query_id, "login": query_login}
        else:
            query = {"id": query_id}
    elif query_login is not None:
        query = {"login": query_login}

    return JsonResponse(
        model_to_dict(
            get_object_or_404(User, **query),
            fields=["id", "login", "display_name", "created_at"],
        )
    )


@require_GET
def search(request: HttpRequest) -> JsonResponse:
    query = request.GET.get("q")
    results = User.objects.filter(
        Q(login__contains=query) | Q(display_name__contains=query)
    ).values()  # todo: make blocked status on fr
    return JsonResponse(list(results), safe=False)


@require_GET
@need_user
def me(request: HttpRequest, user: User) -> JsonResponse:
    return JsonResponse(model_to_dict(user, exclude=["friends", "blocked"]))


@require_POST
@need_user
def change_display_name(request: HttpRequest, user: User) -> JsonResponse:
    if len(request.body) == 0:
        return JsonResponse(
            {"error": "Bad Request", "message": "Missing body."}, status=400
        )

    try:
        body_payload = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return JsonResponse(
            {"error": "Bad Request", "message": "Body must be JSON."}, status=400
        )

    display_name = body_payload.get("display_name")

    if display_name is None:
        return JsonResponse(
            {"error": "Bad Request", "message": "Missing 'display_name' field."},
            status=400,
        )

    if not 4 <= len(display_name) <= 30:
        return JsonResponse(
            {
                "error": "Bad Request",
                "message": "display name have to be between 4 and 30 characters.",
            },
            status=400,
        )

    user.display_name = display_name
    user.save()

    return JsonResponse(model_to_dict(user, exclude=["friends", "blocked"]))


class DFA(View):

    @method_decorator((need_user), name="dispatch")
    def get(
        self, request: HttpRequest, user: User
    ) -> JsonResponse:  # todo return qr code
        return JsonResponse({"coucou": "ethienne"})

    @method_decorator((need_user), name="dispatch")
    def post(self, request: HttpRequest, user: User) -> JsonResponse:

        if user.dfa_secret is not None:
            return JsonResponse(
                {"error": "Forbidden", "message": "You have already enabled dfa."},
                status=403,
            )

        user.dfa_secret = pyotp.random_base32()
        user.save()

        return JsonResponse({"dfa_secret": user.dfa_secret})

    @method_decorator((need_user), name="dispatch")
    def delete(self, request: HttpRequest, user: User) -> JsonResponse:

        if user.dfa_secret is None:
            return JsonResponse(
                {"error": "Forbidden", "message": "You have already disabled dfa."},
                status=403,
            )

        user.dfa_secret = None
        user.save()

        return JsonResponse({"message": "dfa disabled"})
