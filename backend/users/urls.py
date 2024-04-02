from django.urls import include, path

from users import views


urlpatterns = [
  path('', views.Index.as_view(), name='index'),
  path('get/', views.get_user, name='get-user'),
  path('me/', views.me, name='me'),
  path('me/displayname/', views.change_display_name, name='update-display-name'),
  path('dfa/', views.DFA.as_view(), name='dfa'),
  path('search/', views.search, name='search-user'),
  path('friends/', include('friends.urls')),
]
