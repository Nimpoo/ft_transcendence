from django.urls import path

from friends import views


urlpatterns = [
  # / - GET    - get friends list
  # / - POST   - add/accept friend {user_id: 2}
  # / - DELETE - delete/reject/cancel friend
  path('', views.Friend.as_view()),

  # /requests - GET - get friend request(s) [user_id]
	path('requests/', views.get_friend_request)
]
