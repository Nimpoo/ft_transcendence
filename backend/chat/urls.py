from django.urls import path

from chat import views


urlpatterns = [
    path("getconv/", views.get_conv, name="get_conv"),
    path("getconvs/", views.get_all_convs, name="get_all_conv"),
    path("block/", views.Block.as_view(), name="block"),
]
