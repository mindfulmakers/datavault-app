from rest_framework import serializers

from .models import ChatMessage, LocationPoint


class LocationPointSerializer(serializers.ModelSerializer):
    class Meta:
        model = LocationPoint
        fields = ["id", "label", "latitude", "longitude", "recorded_at"]


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ["id", "role", "content", "created_at"]


class ChatMessageCreateSerializer(serializers.Serializer):
    content = serializers.CharField(max_length=4_000)


class LocationRangeQuerySerializer(serializers.Serializer):
    start = serializers.DateTimeField()
    end = serializers.DateTimeField()
