"""
Route calculation service.
Uses Haversine formula for distance estimation.
"""

import math
from typing import List, Dict, Any


def haversine_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """
    Calculate the great-circle distance between two points on Earth.
    Returns distance in miles.
    """
    R = 3958.8  # Earth's radius in miles
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lng = math.radians(lng2 - lng1)
    
    a = (math.sin(delta_lat / 2) ** 2 +
         math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lng / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c


def estimate_driving_time(distance_miles: float, avg_speed_mph: float = 55) -> float:
    """
    Estimate driving time in hours.
    Default average speed: 55 mph for trucks.
    """
    return distance_miles / avg_speed_mph


def calculate_route(
    current_location: Dict[str, Any],
    pickup_location: Dict[str, Any],
    dropoff_location: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Calculate route distances and driving times.
    
    Returns:
        {
            'legs': [
                {'from': {...}, 'to': {...}, 'distance': miles, 'duration': hours},
                ...
            ],
            'total_distance': miles,
            'total_driving_time': hours,
            'waypoints': [{'lat': ..., 'lng': ...}, ...]
        }
    """
    # Calculate leg 1: Current -> Pickup
    dist_to_pickup = haversine_distance(
        current_location['lat'], current_location['lng'],
        pickup_location['lat'], pickup_location['lng']
    )
    
    # Calculate leg 2: Pickup -> Dropoff
    dist_to_dropoff = haversine_distance(
        pickup_location['lat'], pickup_location['lng'],
        dropoff_location['lat'], dropoff_location['lng']
    )
    
    # Apply road factor (roads are ~1.3x straight-line distance)
    road_factor = 1.3
    dist_to_pickup *= road_factor
    dist_to_dropoff *= road_factor
    
    total_distance = dist_to_pickup + dist_to_dropoff
    
    legs = [
        {
            'from': current_location,
            'to': pickup_location,
            'distance': round(dist_to_pickup, 1),
            'duration': round(estimate_driving_time(dist_to_pickup), 2),
        },
        {
            'from': pickup_location,
            'to': dropoff_location,
            'distance': round(dist_to_dropoff, 1),
            'duration': round(estimate_driving_time(dist_to_dropoff), 2),
        }
    ]
    
    waypoints = [
        {'lat': current_location['lat'], 'lng': current_location['lng']},
        {'lat': pickup_location['lat'], 'lng': pickup_location['lng']},
        {'lat': dropoff_location['lat'], 'lng': dropoff_location['lng']},
    ]
    
    return {
        'legs': legs,
        'total_distance': round(total_distance, 1),
        'total_driving_time': round(estimate_driving_time(total_distance), 2),
        'waypoints': waypoints,
    }
