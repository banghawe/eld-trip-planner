import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTrip } from '../context/TripContext'
import RouteMap from '../components/RouteMap'
import StopTimeline from '../components/StopTimeline'
import DayTabs from '../components/DayTabs'
import SummaryCards from '../components/SummaryCards'

function RouteSchedule() {
    const navigate = useNavigate()
    const { tripData, currentDay, setCurrentDay, isLoading } = useTrip()

    // Redirect to home if no trip data
    useEffect(() => {
        if (!tripData && !isLoading) {
            navigate('/')
        }
    }, [tripData, isLoading, navigate])

    if (isLoading) {
        return <LoadingSkeleton />
    }

    if (!tripData) {
        return null
    }

    const currentDayData = tripData.days[currentDay]

    return (
        <div className="min-h-[calc(100vh-3.5rem)] py-4 sm:py-6 px-4 sm:px-6 lg:px-8 bg-slate-50">
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Link
                            to="/"
                            className="p-2 -ml-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <div>
                            <h1 className="text-lg sm:text-xl font-bold text-slate-900">{tripData.name || 'Your Trip'}</h1>
                            <p className="text-xs sm:text-sm text-slate-500">
                                {tripData.origin?.name} → {tripData.pickup?.name} → {tripData.dropoff?.name}
                            </p>
                        </div>
                    </div>
                    <Link to="/logs" className="btn-primary inline-flex items-center">
                        <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>View Daily Logs</span>
                    </Link>
                </div>

                {/* Summary Cards */}
                <SummaryCards tripData={tripData} />

                {/* Day Tabs */}
                {tripData.days.length > 1 && (
                    <DayTabs
                        days={tripData.days}
                        currentDay={currentDay}
                        onDayChange={setCurrentDay}
                    />
                )}

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Map */}
                    <div className="lg:col-span-2">
                        <div className="card overflow-hidden">
                            <div className="p-3 sm:p-4 border-b border-slate-100">
                                <h2 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                                    <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                    </svg>
                                    Route Map
                                </h2>
                            </div>
                            <RouteMap
                                stops={currentDayData?.stops || []}
                                waypoints={tripData.route?.waypoints || []}
                                className="h-[280px] sm:h-[350px] lg:h-[400px]"
                            />
                        </div>
                    </div>

                    {/* Timeline Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="card p-3 sm:p-4">
                            <h2 className="font-semibold text-slate-900 text-sm mb-3 flex items-center gap-2">
                                <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Day {currentDayData?.day || 1} Schedule
                            </h2>
                            <div className="max-h-[300px] lg:max-h-[380px] overflow-y-auto pr-1">
                                <StopTimeline stops={currentDayData?.stops || []} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Day Summary */}
                {currentDayData?.log && (
                    <div className="card p-4 sm:p-5">
                        <h3 className="font-semibold text-slate-900 text-sm mb-3">Day {currentDayData.day} HOS Summary</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-100">
                                <p className="text-xl font-bold text-green-600">{currentDayData.log.totals.offDuty}h</p>
                                <p className="text-xs text-slate-600">Off Duty</p>
                            </div>
                            <div className="text-center p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                                <p className="text-xl font-bold text-indigo-600">{currentDayData.log.totals.sleeperBerth}h</p>
                                <p className="text-xs text-slate-600">Sleeper Berth</p>
                            </div>
                            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                                <p className="text-xl font-bold text-blue-600">{currentDayData.log.totals.driving}h</p>
                                <p className="text-xs text-slate-600">Driving</p>
                            </div>
                            <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-100">
                                <p className="text-xl font-bold text-orange-600">{currentDayData.log.totals.onDuty}h</p>
                                <p className="text-xs text-slate-600">On Duty</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function LoadingSkeleton() {
    return (
        <div className="min-h-[calc(100vh-3.5rem)] py-6 px-4 sm:px-6 lg:px-8 bg-slate-50">
            <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
                <div className="flex justify-between items-center">
                    <div>
                        <div className="h-6 w-40 bg-slate-200 rounded-lg"></div>
                        <div className="h-4 w-56 bg-slate-200 rounded-lg mt-2"></div>
                    </div>
                    <div className="h-10 w-36 bg-slate-200 rounded-lg"></div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-20 bg-white rounded-lg border border-slate-200"></div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 h-[400px] bg-white rounded-xl border border-slate-200"></div>
                    <div className="h-[400px] bg-white rounded-xl border border-slate-200"></div>
                </div>
            </div>
        </div>
    )
}

export default RouteSchedule
