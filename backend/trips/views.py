"""
Trip planning API views.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .serializers import PlanTripRequestSerializer
from .services.hos_engine import calculate_trip


class PlanTripView(APIView):
    """
    POST /api/plan-trip
    
    Calculate an HOS-compliant trip schedule.
    """
    
    def post(self, request):
        serializer = PlanTripRequestSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {"errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            result = calculate_trip(serializer.validated_data)
            return Response(result, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class HealthCheckView(APIView):
    """
    GET /api/health
    
    Simple health check endpoint.
    """
    
    def get(self, request):
        return Response({"status": "ok"}, status=status.HTTP_200_OK)
