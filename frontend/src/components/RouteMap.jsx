import { useEffect } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Custom marker icons with better colors for light theme
const createIcon = (color, borderColor = 'white') => {
    return L.divIcon({
        className: 'custom-marker',
        html: `
      <div style="
        width: 28px;
        height: 28px;
        background: ${color};
        border: 3px solid ${borderColor};
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
      "></div>
    `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
    })
}

const markerColors = {
    start: '#2563eb',    // blue
    pickup: '#16a34a',   // green
    dropoff: '#ea580c',  // orange
    fuel: '#9333ea',     // purple
    break: '#ca8a04',    // amber
    rest: '#4f46e5',     // indigo
    end: '#dc2626',      // red
}

function RouteMap({ stops = [], waypoints = [], className = '' }) {
    // Calculate bounds for the map
    const allPoints = stops
        .filter(s => s.lat && s.lng)
        .map(s => [s.lat, s.lng])

    const center = allPoints.length > 0
        ? [
            allPoints.reduce((sum, p) => sum + p[0], 0) / allPoints.length,
            allPoints.reduce((sum, p) => sum + p[1], 0) / allPoints.length
        ]
        : [39.8283, -98.5795] // Center of US

    const routeWaypoints = waypoints.length > 0
        ? waypoints.map(w => [w.lat, w.lng])
        : allPoints

    return (
        <div className={`relative rounded-xl overflow-hidden border border-slate-200 ${className}`}>
            <MapContainer
                center={center}
                zoom={5}
                className="w-full h-full"
                style={{ minHeight: '300px' }}
                zoomControl={true}
            >
                {/* Using a lighter, cleaner map style */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Route line */}
                {routeWaypoints.length > 1 && (
                    <Polyline
                        positions={routeWaypoints}
                        pathOptions={{
                            color: '#2563eb',
                            weight: 4,
                            opacity: 0.8,
                        }}
                    />
                )}

                {/* Stop markers */}
                {stops
                    .filter(stop => stop.lat && stop.lng && stop.type !== 'driving')
                    .map((stop, index) => (
                        <Marker
                            key={index}
                            position={[stop.lat, stop.lng]}
                            icon={createIcon(markerColors[stop.type] || '#64748b')}
                        >
                            <Popup>
                                <div className="min-w-[160px]">
                                    <p className="font-bold text-slate-900 capitalize text-sm">{stop.type}</p>
                                    <p className="text-slate-700 text-sm">{stop.location}</p>
                                    {stop.time && <p className="text-slate-500 text-xs mt-1">{stop.time}</p>}
                                    {stop.mileage !== undefined && (
                                        <p className="text-slate-400 text-xs">Mile {stop.mileage.toLocaleString()}</p>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    ))}
            </MapContainer>

            {/* Map Legend */}
            <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-lg p-2.5 text-xs shadow-lg border border-slate-200 z-[1000]">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ background: markerColors.start }}></div>
                        <span className="text-slate-600">Start</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ background: markerColors.pickup }}></div>
                        <span className="text-slate-600">Pickup</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ background: markerColors.dropoff }}></div>
                        <span className="text-slate-600">Dropoff</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ background: markerColors.rest }}></div>
                        <span className="text-slate-600">Rest</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ background: markerColors.fuel }}></div>
                        <span className="text-slate-600">Fuel</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ background: markerColors.break }}></div>
                        <span className="text-slate-600">Break</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RouteMap
