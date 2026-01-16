// Demo trip data with pre-calculated HOS-compliant schedules

export const mockTrips = {
    short: {
        id: 'short',
        name: 'Short Haul Demo',
        origin: {
            name: 'Los Angeles, CA',
            lat: 34.0522,
            lng: -118.2437
        },
        pickup: {
            name: 'Barstow, CA',
            lat: 34.8958,
            lng: -117.0173
        },
        dropoff: {
            name: 'Las Vegas, NV',
            lat: 36.1699,
            lng: -115.1398
        },
        cycleHoursUsed: 20,
        totalMiles: 270,
        totalDays: 1,
        totalDrivingHours: 4.5,
        days: [
            {
                day: 1,
                date: '2026-01-16',
                stops: [
                    {
                        type: 'start',
                        location: 'Los Angeles, CA',
                        time: '06:00',
                        duration: 0,
                        lat: 34.0522,
                        lng: -118.2437,
                        mileage: 0
                    },
                    {
                        type: 'driving',
                        from: 'Los Angeles, CA',
                        to: 'Barstow, CA',
                        startTime: '06:00',
                        endTime: '08:00',
                        duration: 2,
                        miles: 120
                    },
                    {
                        type: 'pickup',
                        location: 'Barstow, CA',
                        time: '08:00',
                        duration: 1,
                        lat: 34.8958,
                        lng: -117.0173,
                        mileage: 120
                    },
                    {
                        type: 'driving',
                        from: 'Barstow, CA',
                        to: 'Las Vegas, NV',
                        startTime: '09:00',
                        endTime: '11:30',
                        duration: 2.5,
                        miles: 150
                    },
                    {
                        type: 'dropoff',
                        location: 'Las Vegas, NV',
                        time: '11:30',
                        duration: 1,
                        lat: 36.1699,
                        lng: -115.1398,
                        mileage: 270
                    },
                    {
                        type: 'end',
                        location: 'Las Vegas, NV',
                        time: '12:30',
                        duration: 0,
                        lat: 36.1699,
                        lng: -115.1398,
                        mileage: 270
                    },
                ],
                log: {
                    offDuty: [
                        { start: 0, end: 6 },
                        { start: 12.5, end: 24 }
                    ],
                    sleeperBerth: [],
                    driving: [
                        { start: 6, end: 8 },
                        { start: 9, end: 11.5 }
                    ],
                    onDuty: [
                        { start: 8, end: 9 },
                        { start: 11.5, end: 12.5 }
                    ],
                    totals: {
                        offDuty: 17.5,
                        sleeperBerth: 0,
                        driving: 4.5,
                        onDuty: 2
                    }
                }
            }
        ],
        route: {
            waypoints: [
                { lat: 34.0522, lng: -118.2437 },
                { lat: 34.4208, lng: -117.6815 },
                { lat: 34.8958, lng: -117.0173 },
                { lat: 35.2519, lng: -116.1622 },
                { lat: 35.6108, lng: -115.5889 },
                { lat: 36.1699, lng: -115.1398 },
            ]
        }
    },

    long: {
        id: 'long',
        name: 'Long Haul Demo',
        origin: {
            name: 'Seattle, WA',
            lat: 47.6062,
            lng: -122.3321
        },
        pickup: {
            name: 'Portland, OR',
            lat: 45.5152,
            lng: -122.6784
        },
        dropoff: {
            name: 'Phoenix, AZ',
            lat: 33.4484,
            lng: -112.0740
        },
        cycleHoursUsed: 10,
        totalMiles: 1450,
        totalDays: 3,
        totalDrivingHours: 24,
        days: [
            {
                day: 1,
                date: '2026-01-16',
                stops: [
                    {
                        type: 'start',
                        location: 'Seattle, WA',
                        time: '06:00',
                        duration: 0,
                        lat: 47.6062,
                        lng: -122.3321,
                        mileage: 0
                    },
                    {
                        type: 'driving',
                        from: 'Seattle, WA',
                        to: 'Portland, OR',
                        startTime: '06:00',
                        endTime: '09:00',
                        duration: 3,
                        miles: 175
                    },
                    {
                        type: 'pickup',
                        location: 'Portland, OR',
                        time: '09:00',
                        duration: 1,
                        lat: 45.5152,
                        lng: -122.6784,
                        mileage: 175
                    },
                    {
                        type: 'driving',
                        from: 'Portland, OR',
                        to: 'Medford, OR',
                        startTime: '10:00',
                        endTime: '15:00',
                        duration: 5,
                        miles: 275
                    },
                    {
                        type: 'break',
                        location: 'Medford, OR',
                        time: '15:00',
                        duration: 0.5,
                        lat: 42.3265,
                        lng: -122.8756,
                        mileage: 450
                    },
                    {
                        type: 'driving',
                        from: 'Medford, OR',
                        to: 'Redding, CA',
                        startTime: '15:30',
                        endTime: '18:30',
                        duration: 3,
                        miles: 150
                    },
                    {
                        type: 'rest',
                        location: 'Redding, CA',
                        time: '18:30',
                        duration: 10,
                        lat: 40.5865,
                        lng: -122.3917,
                        mileage: 600
                    },
                ],
                log: {
                    offDuty: [
                        { start: 0, end: 6 }
                    ],
                    sleeperBerth: [
                        { start: 18.5, end: 24 }
                    ],
                    driving: [
                        { start: 6, end: 9 },
                        { start: 10, end: 15 },
                        { start: 15.5, end: 18.5 }
                    ],
                    onDuty: [
                        { start: 9, end: 10 },
                        { start: 15, end: 15.5 }
                    ],
                    totals: {
                        offDuty: 6,
                        sleeperBerth: 5.5,
                        driving: 11,
                        onDuty: 1.5
                    }
                }
            },
            {
                day: 2,
                date: '2026-01-17',
                stops: [
                    {
                        type: 'start',
                        location: 'Redding, CA',
                        time: '04:30',
                        duration: 0,
                        lat: 40.5865,
                        lng: -122.3917,
                        mileage: 600
                    },
                    {
                        type: 'driving',
                        from: 'Redding, CA',
                        to: 'Sacramento, CA',
                        startTime: '04:30',
                        endTime: '07:30',
                        duration: 3,
                        miles: 160
                    },
                    {
                        type: 'fuel',
                        location: 'Sacramento, CA',
                        time: '07:30',
                        duration: 0.5,
                        lat: 38.5816,
                        lng: -121.4944,
                        mileage: 760
                    },
                    {
                        type: 'driving',
                        from: 'Sacramento, CA',
                        to: 'Bakersfield, CA',
                        startTime: '08:00',
                        endTime: '12:30',
                        duration: 4.5,
                        miles: 280
                    },
                    {
                        type: 'break',
                        location: 'Bakersfield, CA',
                        time: '12:30',
                        duration: 0.5,
                        lat: 35.3733,
                        lng: -119.0187,
                        mileage: 1040
                    },
                    {
                        type: 'driving',
                        from: 'Bakersfield, CA',
                        to: 'Barstow, CA',
                        startTime: '13:00',
                        endTime: '16:00',
                        duration: 3,
                        miles: 150
                    },
                    {
                        type: 'rest',
                        location: 'Barstow, CA',
                        time: '16:00',
                        duration: 10,
                        lat: 34.8958,
                        lng: -117.0173,
                        mileage: 1190
                    },
                ],
                log: {
                    offDuty: [],
                    sleeperBerth: [
                        { start: 0, end: 4.5 },
                        { start: 16, end: 24 }
                    ],
                    driving: [
                        { start: 4.5, end: 7.5 },
                        { start: 8, end: 12.5 },
                        { start: 13, end: 16 }
                    ],
                    onDuty: [
                        { start: 7.5, end: 8 },
                        { start: 12.5, end: 13 }
                    ],
                    totals: {
                        offDuty: 0,
                        sleeperBerth: 12.5,
                        driving: 10.5,
                        onDuty: 1
                    }
                }
            },
            {
                day: 3,
                date: '2026-01-18',
                stops: [
                    {
                        type: 'start',
                        location: 'Barstow, CA',
                        time: '02:00',
                        duration: 0,
                        lat: 34.8958,
                        lng: -117.0173,
                        mileage: 1190
                    },
                    {
                        type: 'driving',
                        from: 'Barstow, CA',
                        to: 'Kingman, AZ',
                        startTime: '02:00',
                        endTime: '04:30',
                        duration: 2.5,
                        miles: 150
                    },
                    {
                        type: 'fuel',
                        location: 'Kingman, AZ',
                        time: '04:30',
                        duration: 0.5,
                        lat: 35.1894,
                        lng: -114.0530,
                        mileage: 1340
                    },
                    {
                        type: 'driving',
                        from: 'Kingman, AZ',
                        to: 'Phoenix, AZ',
                        startTime: '05:00',
                        endTime: '08:00',
                        duration: 3,
                        miles: 180
                    },
                    {
                        type: 'dropoff',
                        location: 'Phoenix, AZ',
                        time: '08:00',
                        duration: 1,
                        lat: 33.4484,
                        lng: -112.0740,
                        mileage: 1450
                    },
                    {
                        type: 'end',
                        location: 'Phoenix, AZ',
                        time: '09:00',
                        duration: 0,
                        lat: 33.4484,
                        lng: -112.0740,
                        mileage: 1450
                    },
                ],
                log: {
                    offDuty: [
                        { start: 9, end: 24 }
                    ],
                    sleeperBerth: [
                        { start: 0, end: 2 }
                    ],
                    driving: [
                        { start: 2, end: 4.5 },
                        { start: 5, end: 8 }
                    ],
                    onDuty: [
                        { start: 4.5, end: 5 },
                        { start: 8, end: 9 }
                    ],
                    totals: {
                        offDuty: 15,
                        sleeperBerth: 2,
                        driving: 5.5,
                        onDuty: 1.5
                    }
                }
            }
        ],
        route: {
            waypoints: [
                { lat: 47.6062, lng: -122.3321 },
                { lat: 45.5152, lng: -122.6784 },
                { lat: 42.3265, lng: -122.8756 },
                { lat: 40.5865, lng: -122.3917 },
                { lat: 38.5816, lng: -121.4944 },
                { lat: 35.3733, lng: -119.0187 },
                { lat: 34.8958, lng: -117.0173 },
                { lat: 35.1894, lng: -114.0530 },
                { lat: 33.4484, lng: -112.0740 },
            ]
        }
    }
}

// Calculate schedule from form data (placeholder for backend integration)
export function calculateSchedule(formData) {
    // This will be replaced by actual backend API call
    // For now, return the long demo trip as a placeholder
    return {
        ...mockTrips.long,
        origin: { name: formData.currentLocation, lat: 47.6062, lng: -122.3321 },
        pickup: { name: formData.pickupLocation, lat: 45.5152, lng: -122.6784 },
        dropoff: { name: formData.dropoffLocation, lat: 33.4484, lng: -112.0740 },
        cycleHoursUsed: formData.cycleHoursUsed
    }
}
