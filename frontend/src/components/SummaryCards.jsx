function SummaryCards({ tripData }) {
    const cards = [
        {
            label: 'Total Distance',
            value: `${tripData?.totalMiles?.toLocaleString() || 0}`,
            unit: 'miles',
            icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
            ),
            color: 'blue',
        },
        {
            label: 'Total Days',
            value: tripData?.totalDays || 0,
            unit: tripData?.totalDays === 1 ? 'day' : 'days',
            icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
            color: 'green',
        },
        {
            label: 'Driving Time',
            value: tripData?.totalDrivingHours || 0,
            unit: 'hours',
            icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            color: 'purple',
        },
        {
            label: 'Cycle Used',
            value: Math.round(tripData?.cycleHoursUsed || 0),
            unit: '/ 70h',
            icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
            ),
            color: 'amber',
        },
    ]

    const getColorClasses = (color) => {
        switch (color) {
            case 'blue': return 'bg-blue-50 text-blue-600 border-blue-100'
            case 'green': return 'bg-green-50 text-green-600 border-green-100'
            case 'purple': return 'bg-purple-50 text-purple-600 border-purple-100'
            case 'amber': return 'bg-amber-50 text-amber-600 border-amber-100'
            default: return 'bg-slate-50 text-slate-600 border-slate-100'
        }
    }

    const getIconBg = (color) => {
        switch (color) {
            case 'blue': return 'bg-blue-100 text-blue-600'
            case 'green': return 'bg-green-100 text-green-600'
            case 'purple': return 'bg-purple-100 text-purple-600'
            case 'amber': return 'bg-amber-100 text-amber-600'
            default: return 'bg-slate-100 text-slate-600'
        }
    }

    return (
        <div className="space-y-3">
            {/* Warning Banner */}
            {tripData?.warning && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                    <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                        <p className="font-semibold text-amber-800">70-Hour Cycle Limit Exceeded</p>
                        <p className="text-sm text-amber-700 mt-1">{tripData.warning.message}</p>
                        <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Recommendation: {tripData.warning.recommendation}
                        </p>
                    </div>
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {cards.map((card, index) => (
                    <div
                        key={index}
                        className={`${getColorClasses(card.color)} border rounded-lg p-3 sm:p-4`}
                    >
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className={`w-6 h-6 rounded flex items-center justify-center ${getIconBg(card.color)}`}>
                                {card.icon}
                            </span>
                            <span className="text-xs text-slate-600 font-medium">{card.label}</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl sm:text-2xl font-bold text-slate-900">{card.value}</span>
                            <span className="text-xs text-slate-500">{card.unit}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default SummaryCards
