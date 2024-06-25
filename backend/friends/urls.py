from django.urls import path

from friends import views


urlpatterns = [
  # / - GET    - get friends list
  # / - POST   - add/accept friend {user_id: 2}
  # / - DELETE - delete/reject/cancel friend
  path('', views.Friend.as_view()),

  # /requests - GET - get friend request(s) [user_id]
	path('sentrequests/', views.get_sent_friend_request),
	path('receivedrequests/', views.get_received_friend_request)
]
