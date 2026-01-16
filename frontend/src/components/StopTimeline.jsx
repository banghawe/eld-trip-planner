function StopTimeline({ stops = [] }) {
    const getStopIcon = (type) => {
        switch (type) {
            case 'start':
                return (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                )
            case 'pickup':
                return (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                )
            case 'dropoff':
                return (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                    </svg>
                )
            case 'driving':
                return (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                )
            case 'break':
                return (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                )
            case 'rest':
                return (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                )
            case 'fuel':
                return (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                )
            case 'end':
                return (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                )
            default:
                return (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                )
        }
    }

    const getStopStyles = (type) => {
        switch (type) {
            case 'start': return { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' }
            case 'pickup': return { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' }
            case 'dropoff': return { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200' }
            case 'driving': return { bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-200' }
            case 'break': return { bg: 'bg-amber-100', text: 'text-amber-600', border: 'border-amber-200' }
            case 'rest': return { bg: 'bg-indigo-100', text: 'text-indigo-600', border: 'border-indigo-200' }
            case 'fuel': return { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' }
            case 'end': return { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-200' }
            default: return { bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-200' }
        }
    }

    const formatDuration = (hours) => {
        if (hours < 1) {
            return `${Math.round(hours * 60)}min`
        }
        const h = Math.floor(hours)
        const m = Math.round((hours - h) * 60)
        return m > 0 ? `${h}h ${m}m` : `${h}h`
    }

    return (
        <div className="space-y-0">
            {stops.map((stop, index) => {
                const styles = getStopStyles(stop.type)

                return (
                    <div key={index} className="relative flex gap-3">
                        {/* Timeline line */}
                        {index < stops.length - 1 && (
                            <div className="absolute left-[17px] top-9 bottom-0 w-0.5 bg-slate-200"></div>
                        )}

                        {/* Icon */}
                        <div className={`relative z-10 w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${styles.bg} ${styles.text} border ${styles.border}`}>
                            {getStopIcon(stop.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pb-4 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <p className="font-medium text-slate-900 text-sm truncate">
                                        {stop.type === 'driving' ? (
                                            <span className="text-slate-700">
                                                {stop.from} → {stop.to}
                                            </span>
                                        ) : (
                                            stop.location
                                        )}
                                    </p>
                                    <p className="text-xs text-slate-500 capitalize">{stop.type}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-sm font-medium text-slate-700">
                                        {stop.type === 'driving' ? stop.startTime : stop.time}
                                    </p>
                                    {stop.duration > 0 && (
                                        <p className="text-xs text-slate-400">{formatDuration(stop.duration)}</p>
                                    )}
                                </div>
                            </div>

                            {/* Additional info */}
                            {stop.miles && (
                                <p className="text-xs text-slate-400 mt-0.5">{stop.miles} miles</p>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default StopTimeline
