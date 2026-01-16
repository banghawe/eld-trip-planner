"""
Hours of Service (HOS) Compliance Engine.

Implements FMCSA rules for property-carrying drivers:
- 11-hour driving limit
- 14-hour duty window
- 30-minute break after 8 hours driving
- 10 consecutive hours off-duty reset
- 70 hours / 8 days cycle
"""

from typing import Dict, List, Any
from datetime import datetime, timedelta
from .route_service import calculate_route


# HOS Constants (FMCSA regulations)
MAX_DRIVING_HOURS = 11.0
MAX_DUTY_WINDOW = 14.0
BREAK_REQUIRED_AFTER = 8.0
BREAK_DURATION = 0.5  # 30 minutes
OFF_DUTY_RESET = 10.0
MAX_CYCLE_HOURS = 70.0
FUEL_INTERVAL_MILES = 1000
PICKUP_DURATION = 1.0  # 1 hour on-duty
DROPOFF_DURATION = 1.0  # 1 hour on-duty
AVG_SPEED_MPH = 55


class HOSEngine:
    """
    Calculates HOS-compliant trip schedules.
    """
    
    def __init__(self, cycle_hours_used: float = 0):
        self.cycle_hours_used = cycle_hours_used
        self.current_day_driving = 0
        self.current_day_duty = 0
        self.driving_since_break = 0
        self.current_time = 6.0  # Start at 6:00 AM
        self.current_day = 1
        self.current_mileage = 0
        # Track all activities: [(day, start_time, end_time, type), ...]
        self.activities = []
        
    def calculate_trip(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main entry point: calculate full trip schedule.
        """
        current_loc = data['current_location']
        pickup_loc = data['pickup_location']
        dropoff_loc = data['dropoff_location']
        self.cycle_hours_used = data['cycle_hours_used']
        
        # Calculate route
        route = calculate_route(current_loc, pickup_loc, dropoff_loc)
        
        # Build schedule
        days = self._build_schedule(
            current_loc, pickup_loc, dropoff_loc, route
        )
        
        # Calculate totals
        total_driving = sum(
            day['log']['totals']['driving'] for day in days
        )
        total_on_duty = sum(
            day['log']['totals']['onDuty'] for day in days
        )
        total_duty_hours = total_driving + total_on_duty
        
        # Calculate final cycle hours and check for warning
        final_cycle = data['cycle_hours_used'] + total_duty_hours
        cycle_warning = None
        
        if final_cycle > MAX_CYCLE_HOURS:
            excess = round(final_cycle - MAX_CYCLE_HOURS, 1)
            cycle_warning = {
                'type': 'cycle_exceeded',
                'message': f'This trip exceeds the 70-hour cycle limit by {excess} hours. Consider taking a 34-hour restart before starting.',
                'excessHours': excess,
                'recommendation': '34-hour restart required'
            }
        
        result = {
            'name': f"{current_loc['label']} → {dropoff_loc['label']}",
            'origin': current_loc,
            'pickup': pickup_loc,
            'dropoff': dropoff_loc,
            'cycleHoursUsed': min(round(final_cycle), 70),
            'cycleHoursActual': round(final_cycle, 1),
            'totalMiles': round(route['total_distance']),
            'totalDays': len(days),
            'totalDrivingHours': round(total_driving, 1),
            'totalOnDutyHours': round(total_on_duty, 1),
            'days': days,
            'route': {'waypoints': route['waypoints']},
        }
        
        if cycle_warning:
            result['warning'] = cycle_warning
        
        return result
    
    def _build_schedule(
        self,
        current_loc: Dict,
        pickup_loc: Dict,
        dropoff_loc: Dict,
        route: Dict
    ) -> List[Dict]:
        """Build day-by-day schedule with stops."""
        days = []
        stops = []
        
        # Record off-duty time before start (00:00 to 06:00)
        if self.current_time > 0:
            self.activities.append({
                'day': self.current_day,
                'start': 0,
                'end': self.current_time,
                'type': 'offDuty'
            })
        
        # Start
        stops.append(self._create_stop('start', current_loc, self.current_time, 0))
        
        # Drive to pickup
        leg1 = route['legs'][0]
        stops.extend(self._schedule_driving(
            leg1['distance'],
            current_loc,
            pickup_loc
        ))
        
        # Pickup (1 hour on-duty)
        stops.append(self._create_stop('pickup', pickup_loc, self.current_time, PICKUP_DURATION))
        self._add_on_duty(PICKUP_DURATION)
        
        # Drive to dropoff
        leg2 = route['legs'][1]
        stops.extend(self._schedule_driving(
            leg2['distance'],
            pickup_loc,
            dropoff_loc
        ))
        
        # Dropoff (1 hour on-duty)
        stops.append(self._create_stop('dropoff', dropoff_loc, self.current_time, DROPOFF_DURATION))
        self._add_on_duty(DROPOFF_DURATION)
        
        # End - record off-duty for rest of day
        stops.append(self._create_stop('end', dropoff_loc, self.current_time, 0))
        if self.current_time < 24:
            self.activities.append({
                'day': self.current_day,
                'start': self.current_time,
                'end': 24,
                'type': 'offDuty'
            })
        
        # Group stops by day, using activities for log generation
        days = self._group_stops_by_day(stops, self.activities)
        
        return days
    
    def _schedule_driving(
        self,
        distance: float,
        from_loc: Dict,
        to_loc: Dict
    ) -> List[Dict]:
        """Schedule a driving segment with required breaks and rests."""
        stops = []
        remaining_distance = distance
        
        while remaining_distance > 0:
            # Check if we can drive
            available_driving = min(
                MAX_DRIVING_HOURS - self.current_day_driving,
                MAX_DUTY_WINDOW - self.current_day_duty,
                BREAK_REQUIRED_AFTER - self.driving_since_break
            )
            
            # Need rest?
            if available_driving <= 0:
                # 10-hour rest
                rest_loc = self._interpolate_location(
                    from_loc, to_loc, 
                    1 - (remaining_distance / distance) if distance > 0 else 0
                )
                stops.append(self._create_stop('rest', rest_loc, self.current_time, OFF_DUTY_RESET))
                self._add_rest()
                continue
            
            # Need break?
            if self.driving_since_break >= BREAK_REQUIRED_AFTER:
                break_loc = self._interpolate_location(
                    from_loc, to_loc,
                    1 - (remaining_distance / distance) if distance > 0 else 0
                )
                stops.append(self._create_stop('break', break_loc, self.current_time, BREAK_DURATION))
                self._add_break()
                continue
            
            # Calculate drive segment
            max_drive_time = min(available_driving, remaining_distance / AVG_SPEED_MPH)
            drive_distance = max_drive_time * AVG_SPEED_MPH
            
            # Check for fuel stop
            if self.current_mileage + drive_distance > (
                (self.current_mileage // FUEL_INTERVAL_MILES + 1) * FUEL_INTERVAL_MILES
            ):
                miles_to_fuel = (
                    (self.current_mileage // FUEL_INTERVAL_MILES + 1) * FUEL_INTERVAL_MILES
                ) - self.current_mileage
                
                if miles_to_fuel < drive_distance and miles_to_fuel > 0:
                    # Drive to fuel stop first
                    fuel_time = miles_to_fuel / AVG_SPEED_MPH
                    fuel_loc = self._interpolate_location(
                        from_loc, to_loc,
                        1 - ((remaining_distance - miles_to_fuel) / distance) if distance > 0 else 0
                    )
                    
                    # Add driving segment to fuel
                    self._add_driving(fuel_time, miles_to_fuel)
                    remaining_distance -= miles_to_fuel
                    
                    # Fuel stop
                    stops.append(self._create_stop('fuel', fuel_loc, self.current_time, 0.5))
                    self._add_on_duty(0.5)
                    continue
            
            # Normal driving segment
            self._add_driving(max_drive_time, drive_distance)
            remaining_distance -= drive_distance
        
        return stops
    
    def _interpolate_location(
        self,
        from_loc: Dict,
        to_loc: Dict,
        progress: float
    ) -> Dict:
        """Interpolate location between two points."""
        return {
            'label': f"Mile {self.current_mileage:.0f}",
            'lat': from_loc['lat'] + (to_loc['lat'] - from_loc['lat']) * progress,
            'lng': from_loc['lng'] + (to_loc['lng'] - from_loc['lng']) * progress,
        }
    
    def _create_stop(
        self,
        stop_type: str,
        location: Dict,
        time: float,
        duration: float
    ) -> Dict:
        """Create a stop entry."""
        return {
            'type': stop_type,
            'location': location['label'],
            'time': self._format_time(time),
            'duration': duration,
            'lat': location['lat'],
            'lng': location['lng'],
            'mileage': round(self.current_mileage),
            'day': self.current_day,
        }
    
    def _format_time(self, hours: float) -> str:
        """Format time as HH:MM."""
        h = int(hours) % 24
        m = int((hours % 1) * 60)
        return f"{h:02d}:{m:02d}"
    
    def _record_activity(self, activity_type: str, duration: float):
        """Record an activity, handling day crossings."""
        start_day = self.current_day
        start_time = self.current_time
        
        remaining = duration
        current_day = start_day
        current_time = start_time
        
        while remaining > 0:
            time_until_midnight = 24 - current_time
            segment_duration = min(remaining, time_until_midnight)
            
            end_time = current_time + segment_duration
            self.activities.append({
                'day': current_day,
                'start': current_time,
                'end': end_time if end_time < 24 else 24,
                'type': activity_type
            })
            
            remaining -= segment_duration
            if remaining > 0:
                current_day += 1
                current_time = 0
            else:
                current_time = end_time
    
    def _add_driving(self, hours: float, miles: float):
        """Record driving time."""
        self._record_activity('driving', hours)
        
        self.current_day_driving += hours
        self.current_day_duty += hours
        self.driving_since_break += hours
        self.current_time += hours
        self.current_mileage += miles
        self.cycle_hours_used += hours
        
        # Check for day rollover
        while self.current_time >= 24:
            self.current_time -= 24
            self.current_day += 1
    
    def _add_on_duty(self, hours: float):
        """Record on-duty (not driving) time."""
        self._record_activity('onDuty', hours)
        
        self.current_day_duty += hours
        self.current_time += hours
        self.cycle_hours_used += hours
        
        while self.current_time >= 24:
            self.current_time -= 24
            self.current_day += 1
    
    def _add_break(self):
        """Process 30-minute break."""
        self._record_activity('onDuty', BREAK_DURATION)
        
        self.current_time += BREAK_DURATION
        self.driving_since_break = 0
        
        while self.current_time >= 24:
            self.current_time -= 24
            self.current_day += 1
    
    def _add_rest(self):
        """Process 10-hour rest period."""
        self._record_activity('sleeperBerth', OFF_DUTY_RESET)
        
        self.current_time += OFF_DUTY_RESET
        self.current_day_driving = 0
        self.current_day_duty = 0
        self.driving_since_break = 0
        
        while self.current_time >= 24:
            self.current_time -= 24
            self.current_day += 1
    
    def _group_stops_by_day(self, stops: List[Dict], activities: List[Dict]) -> List[Dict]:
        """Group stops by day and generate log data from activities."""
        from datetime import date, timedelta
        
        # Group stops by day
        days_dict = {}
        base_date = date.today()
        
        for stop in stops:
            day_num = stop['day']
            if day_num not in days_dict:
                days_dict[day_num] = {
                    'day': day_num,
                    'date': (base_date + timedelta(days=day_num - 1)).isoformat(),
                    'stops': [],
                }
            days_dict[day_num]['stops'].append(stop)
        
        # Create day entries for any days that only have activities (no stops)
        for activity in activities:
            day_num = activity['day']
            if day_num not in days_dict:
                days_dict[day_num] = {
                    'day': day_num,
                    'date': (base_date + timedelta(days=day_num - 1)).isoformat(),
                    'stops': [],
                }
        
        # Generate log data for each day from activities
        days = []
        for day_num in sorted(days_dict.keys()):
            day_data = days_dict[day_num]
            day_data['log'] = self._generate_day_log_from_activities(day_num, activities)
            days.append(day_data)
        
        return days
    
    def _generate_day_log_from_activities(self, day_num: int, activities: List[Dict]) -> Dict:
        """Generate 24-hour log data from explicit activities."""
        log = {
            'offDuty': [],
            'sleeperBerth': [],
            'driving': [],
            'onDuty': [],
            'totals': {'offDuty': 0, 'sleeperBerth': 0, 'driving': 0, 'onDuty': 0}
        }
        
        # Filter activities for this day and sort by start time
        day_activities = [a for a in activities if a['day'] == day_num]
        day_activities.sort(key=lambda x: x['start'])
        
        if not day_activities:
            # No activities this day - all off-duty
            log['offDuty'].append({'start': 0, 'end': 24})
            log['totals']['offDuty'] = 24
            return log
        
        # Merge adjacent activities of the same type
        merged = []
        for activity in day_activities:
            if merged and merged[-1]['type'] == activity['type'] and abs(merged[-1]['end'] - activity['start']) < 0.01:
                merged[-1]['end'] = activity['end']
            else:
                merged.append(dict(activity))
        
        # Add activities to log
        for activity in merged:
            start = round(activity['start'], 2)
            end = round(activity['end'], 2)
            duration = end - start
            
            if duration <= 0:
                continue
            
            if activity['type'] == 'offDuty':
                log['offDuty'].append({'start': start, 'end': end})
                log['totals']['offDuty'] += duration
            elif activity['type'] == 'sleeperBerth':
                log['sleeperBerth'].append({'start': start, 'end': end})
                log['totals']['sleeperBerth'] += duration
            elif activity['type'] == 'driving':
                log['driving'].append({'start': start, 'end': end})
                log['totals']['driving'] += duration
            elif activity['type'] == 'onDuty':
                log['onDuty'].append({'start': start, 'end': end})
                log['totals']['onDuty'] += duration
        
        # Check if we need to fill gaps (should be rare with explicit tracking)
        total = sum(log['totals'].values())
        if abs(total - 24) > 0.1:
            # Find gaps and fill with off-duty
            covered = [(a['start'], a['end']) for a in merged]
            covered.sort()
            
            current = 0
            for start, end in covered:
                if start > current + 0.01:
                    gap = start - current
                    log['offDuty'].append({'start': round(current, 2), 'end': round(start, 2)})
                    log['totals']['offDuty'] += gap
                current = max(current, end)
            
            if current < 23.99:
                gap = 24 - current
                log['offDuty'].append({'start': round(current, 2), 'end': 24})
                log['totals']['offDuty'] += gap
        
        # Round totals
        for key in log['totals']:
            log['totals'][key] = round(log['totals'][key], 1)
        
        return log


def calculate_trip(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Main entry point for trip calculation.
    """
    engine = HOSEngine(data['cycle_hours_used'])
    return engine.calculate_trip(data)

