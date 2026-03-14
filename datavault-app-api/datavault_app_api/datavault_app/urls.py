from __future__ import annotations

from django.urls import path

from . import views

# All URLs will be prefixed with api/datavault_app
urlpatterns = [
    path("location-history/", views.LocationHistoryListView.as_view()),
    path("location-history/range/", views.LocationHistoryRangeView.as_view()),
    path("chat/messages/", views.ChatMessageListCreateView.as_view()),
]
