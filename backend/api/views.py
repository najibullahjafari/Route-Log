from rest_framework import status, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Trip
from .serializers import TripSerializer
from .services.hos import build_trip_plan


class TripViewSet(viewsets.ModelViewSet):
    serializer_class = TripSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Trip.objects.filter(created_by=self.request.user).order_by("-created_at")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        trip = serializer.save(created_by=request.user)

        try:
            plan = build_trip_plan(trip)
        except ValueError as exc:
            trip.delete()
            raise ValidationError(str(exc)) from exc

        Trip.objects.filter(pk=trip.pk).update(
            route_summary=plan["route_summary"],
            hos_logs=plan["hos_logs"],
            map_data=plan["map_data"],
        )
        trip.refresh_from_db()

        response_serializer = self.get_serializer(trip)
        headers = self.get_success_headers(response_serializer.data)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED, headers=headers)
