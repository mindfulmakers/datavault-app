from __future__ import annotations

from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .agent_runner import run_location_chat_agent
from .models import ChatMessage, LocationPoint
from .serializers import (
    ChatMessageCreateSerializer,
    ChatMessageSerializer,
    LocationPointSerializer,
    LocationRangeQuerySerializer,
)


class LocationHistoryListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = LocationPointSerializer
    queryset = LocationPoint.objects.all()


class LocationHistoryRangeView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        serializer = LocationRangeQuerySerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        start = serializer.validated_data["start"]
        end = serializer.validated_data["end"]
        queryset = LocationPoint.objects.filter(
            recorded_at__gte=start,
            recorded_at__lte=end,
        )
        return Response(LocationPointSerializer(queryset, many=True).data)


class ChatMessageListCreateView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        messages = ChatMessage.objects.all()
        return Response(ChatMessageSerializer(messages, many=True).data)

    def post(self, request):
        serializer = ChatMessageCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        history = list(
            ChatMessage.objects.values("role", "content").order_by("created_at")
        )

        user_message = ChatMessage.objects.create(
            role=ChatMessage.Role.USER,
            content=serializer.validated_data["content"],
        )
        assistant_message = ChatMessage.objects.create(
            role=ChatMessage.Role.ASSISTANT,
            content=run_location_chat_agent(
                user_message=serializer.validated_data["content"],
                message_history=history,
            ),
        )
        response_payload = ChatMessageSerializer(
            [user_message, assistant_message],
            many=True,
        ).data
        return Response(response_payload, status=status.HTTP_201_CREATED)
