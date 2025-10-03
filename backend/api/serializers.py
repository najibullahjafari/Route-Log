from rest_framework import serializers
from .models import Trip


class TripSerializer(serializers.ModelSerializer):
    created_by = serializers.SerializerMethodField()

    class Meta:
        model = Trip
        fields = [
            "id",
            "created_by",
            "current_location",
            "pickup_location",
            "dropoff_location",
            "current_cycle_used",
            "route_summary",
            "hos_logs",
            "map_data",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_by",
            "route_summary",
            "hos_logs",
            "map_data",
            "created_at",
            "updated_at",
        ]

    def get_created_by(self, obj):
        return obj.created_by.username if obj.created_by else None
