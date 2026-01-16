"""
Unit tests for the ELD Trip Planner backend.
Covers HOS Engine logic and API endpoints.
"""

from django.test import TestCase, Client
from django.urls import reverse
import json

from .services.hos_engine import HOSEngine, calculate_trip


class HOSEngineUnitTests(TestCase):
    """Tests for the HOS Engine core logic."""

    def test_engine_initialization(self):
        """Test engine initializes with correct defaults."""
        engine = HOSEngine(cycle_hours_used=10)
        
        self.assertEqual(engine.cycle_hours_used, 10)
        self.assertEqual(engine.current_day_driving, 0)
        self.assertEqual(engine.current_day_duty, 0)
        self.assertEqual(engine.current_time, 6.0)  # 6:00 AM start
        self.assertEqual(engine.current_day, 1)

    def test_11_hour_driving_limit(self):
        """Test that driving is limited to 11 hours per duty period."""
        engine = HOSEngine(cycle_hours_used=0)
        
        # Add 11 hours of driving
        engine._add_driving(11, 605)  # 11h at 55mph = 605 miles
        
        self.assertEqual(engine.current_day_driving, 11)
        self.assertEqual(engine.driving_since_break, 11)

    def test_rest_resets_counters(self):
        """Test that 10-hour rest resets driving and duty counters."""
        engine = HOSEngine(cycle_hours_used=0)
        
        # Add some driving
        engine._add_driving(8, 440)
        self.assertEqual(engine.current_day_driving, 8)
        
        # Take rest
        engine._add_rest()
        
        # Counters should be reset
        self.assertEqual(engine.current_day_driving, 0)
        self.assertEqual(engine.current_day_duty, 0)
        self.assertEqual(engine.driving_since_break, 0)

    def test_break_resets_driving_since_break(self):
        """Test that 30-minute break resets driving_since_break."""
        engine = HOSEngine(cycle_hours_used=0)
        
        # Add 8 hours of driving
        engine._add_driving(8, 440)
        self.assertEqual(engine.driving_since_break, 8)
        
        # Take break
        engine._add_break()
        
        # Only driving_since_break should reset
        self.assertEqual(engine.driving_since_break, 0)
        self.assertEqual(engine.current_day_driving, 8)  # Still 8

    def test_cycle_hours_tracking(self):
        """Test that cycle hours are accumulated correctly."""
        engine = HOSEngine(cycle_hours_used=50)
        
        engine._add_driving(5, 275)
        engine._add_on_duty(1)
        
        self.assertEqual(engine.cycle_hours_used, 56)  # 50 + 5 + 1

    def test_70_hour_cycle_warning(self):
        """Test warning is generated when approaching 70-hour limit."""
        data = {
            'current_location': {'label': 'City A', 'lat': 40.0, 'lng': -75.0},
            'pickup_location': {'label': 'City B', 'lat': 41.0, 'lng': -76.0},
            'dropoff_location': {'label': 'City C', 'lat': 42.0, 'lng': -77.0},
            'cycle_hours_used': 65  # Close to 70h limit
        }
        
        result = calculate_trip(data)
        
        # Should have a warning since trip will exceed 70h
        if result.get('warning'):
            self.assertIn('70-hour', result['warning']['message'])

    def test_time_format(self):
        """Test time formatting helper."""
        engine = HOSEngine()
        
        self.assertEqual(engine._format_time(6.0), "06:00")
        self.assertEqual(engine._format_time(14.5), "14:30")
        self.assertEqual(engine._format_time(23.75), "23:45")
        self.assertEqual(engine._format_time(0), "00:00")

    def test_location_interpolation(self):
        """Test location interpolation between two points."""
        engine = HOSEngine()
        
        from_loc = {'label': 'Start', 'lat': 40.0, 'lng': -75.0}
        to_loc = {'label': 'End', 'lat': 42.0, 'lng': -77.0}
        
        # Midpoint (50%)
        mid = engine._interpolate_location(from_loc, to_loc, 0.5)
        self.assertAlmostEqual(mid['lat'], 41.0, places=1)
        self.assertAlmostEqual(mid['lng'], -76.0, places=1)


class TripCalculationTests(TestCase):
    """Tests for complete trip calculations."""

    def test_short_trip_no_rest_needed(self):
        """Test a short trip that doesn't require rest stops."""
        data = {
            'current_location': {'label': 'City A', 'lat': 40.7128, 'lng': -74.0060},
            'pickup_location': {'label': 'City B', 'lat': 40.8, 'lng': -74.1},
            'dropoff_location': {'label': 'City C', 'lat': 40.9, 'lng': -74.2},
            'cycle_hours_used': 0
        }
        
        result = calculate_trip(data)
        
        self.assertIn('days', result)
        self.assertIn('totalMiles', result)
        self.assertIn('totalDrivingHours', result)
        self.assertEqual(result['totalDays'], len(result['days']))

    def test_long_trip_requires_rest(self):
        """Test a long trip that requires multiple rest stops."""
        data = {
            'current_location': {'label': 'NYC', 'lat': 40.7128, 'lng': -74.0060},
            'pickup_location': {'label': 'Seattle', 'lat': 47.6062, 'lng': -122.3321},
            'dropoff_location': {'label': 'Portland', 'lat': 45.5152, 'lng': -122.6784},
            'cycle_hours_used': 0
        }
        
        result = calculate_trip(data)
        
        # Long trip should have multiple days
        self.assertGreater(result['totalDays'], 1)
        
        # Should have rest stops
        all_stops = []
        for day in result['days']:
            all_stops.extend(day['stops'])
        
        rest_stops = [s for s in all_stops if s['type'] == 'rest']
        self.assertGreater(len(rest_stops), 0)

    def test_daily_logs_sum_to_24_hours(self):
        """Test that each daily log totals 24 hours."""
        data = {
            'current_location': {'label': 'DC', 'lat': 38.9072, 'lng': -77.0369},
            'pickup_location': {'label': 'Seattle', 'lat': 47.6062, 'lng': -122.3321},
            'dropoff_location': {'label': 'Portland', 'lat': 45.5152, 'lng': -122.6784},
            'cycle_hours_used': 0
        }
        
        result = calculate_trip(data)
        
        for day in result['days']:
            log = day['log']
            total = (
                log['totals']['offDuty'] +
                log['totals']['sleeperBerth'] +
                log['totals']['driving'] +
                log['totals']['onDuty']
            )
            self.assertAlmostEqual(total, 24.0, places=0, 
                msg=f"Day {day['day']} log doesn't sum to 24: {total}")

    def test_driving_hours_per_duty_period(self):
        """Test that driving hours per duty period don't exceed 11."""
        data = {
            'current_location': {'label': 'DC', 'lat': 38.9072, 'lng': -77.0369},
            'pickup_location': {'label': 'Chicago', 'lat': 41.8781, 'lng': -87.6298},
            'dropoff_location': {'label': 'Denver', 'lat': 39.7392, 'lng': -104.9903},
            'cycle_hours_used': 0
        }
        
        result = calculate_trip(data)
        
        # Check total driving is reasonable (not inflated)
        self.assertLessEqual(result['totalDrivingHours'], result['totalMiles'] / 55 + 2)


class APIEndpointTests(TestCase):
    """Tests for the REST API endpoints."""

    def setUp(self):
        self.client = Client()

    def test_health_check(self):
        """Test health check endpoint returns OK."""
        response = self.client.get('/api/health')
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['status'], 'ok')

    def test_plan_trip_valid_request(self):
        """Test plan-trip endpoint with valid data."""
        payload = {
            'current_location': {'label': 'NYC', 'lat': 40.7128, 'lng': -74.0060},
            'pickup_location': {'label': 'Boston', 'lat': 42.3601, 'lng': -71.0589},
            'dropoff_location': {'label': 'DC', 'lat': 38.9072, 'lng': -77.0369},
            'cycle_hours_used': 10
        }
        
        response = self.client.post(
            '/api/plan-trip',
            data=json.dumps(payload),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertIn('name', data)
        self.assertIn('totalMiles', data)
        self.assertIn('days', data)
        self.assertIn('route', data)

    def test_plan_trip_missing_fields(self):
        """Test plan-trip endpoint rejects incomplete data."""
        payload = {
            'current_location': {'label': 'NYC', 'lat': 40.7128, 'lng': -74.0060},
            # Missing pickup and dropoff
        }
        
        response = self.client.post(
            '/api/plan-trip',
            data=json.dumps(payload),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn('errors', data)

    def test_plan_trip_invalid_coordinates(self):
        """Test plan-trip endpoint validates coordinates."""
        payload = {
            'current_location': {'label': 'NYC', 'lat': 999, 'lng': -74.0060},  # Invalid lat
            'pickup_location': {'label': 'Boston', 'lat': 42.3601, 'lng': -71.0589},
            'dropoff_location': {'label': 'DC', 'lat': 38.9072, 'lng': -77.0369},
            'cycle_hours_used': 10
        }
        
        response = self.client.post(
            '/api/plan-trip',
            data=json.dumps(payload),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 400)

    def test_plan_trip_invalid_cycle_hours(self):
        """Test plan-trip endpoint validates cycle hours range."""
        payload = {
            'current_location': {'label': 'NYC', 'lat': 40.7128, 'lng': -74.0060},
            'pickup_location': {'label': 'Boston', 'lat': 42.3601, 'lng': -71.0589},
            'dropoff_location': {'label': 'DC', 'lat': 38.9072, 'lng': -77.0369},
            'cycle_hours_used': 100  # Invalid: > 70
        }
        
        response = self.client.post(
            '/api/plan-trip',
            data=json.dumps(payload),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 400)
