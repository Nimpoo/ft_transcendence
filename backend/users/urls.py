from django.urls import include, path

from users import views


urlpatterns = [
    path("", views.Index.as_view(), name="index"),
    path("get/", views.get_user, name="get-user"),
    path("me/", views.Me.as_view(), name="me"),
    path("dfa/", views.DFA.as_view(), name="dfa"),
    path("search/", views.search, name="search-user"),
    path("online/", views.get_online_users, name="get-online-users"),
    path("friends/", include("friends.urls")),
]
