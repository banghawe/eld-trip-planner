"""
Trip API URLs.
"""

from django.urls import path
from .views import PlanTripView, HealthCheckView

urlpatterns = [
    path('health', HealthCheckView.as_view(), name='health'),
    path('plan-trip', PlanTripView.as_view(), name='plan-trip'),
]
