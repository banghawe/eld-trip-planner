"""
Location and Trip serializers with validation.
"""

from rest_framework import serializers


class LocationSerializer(serializers.Serializer):
    """Validates a location with label and coordinates."""
    label = serializers.CharField(max_length=200)
    lat = serializers.FloatField(min_value=-90, max_value=90)
    lng = serializers.FloatField(min_value=-180, max_value=180)


class PlanTripRequestSerializer(serializers.Serializer):
    """Validates the plan-trip request payload."""
    current_location = LocationSerializer()
    pickup_location = LocationSerializer()
    dropoff_location = LocationSerializer()
    cycle_hours_used = serializers.IntegerField(min_value=0, max_value=70)
