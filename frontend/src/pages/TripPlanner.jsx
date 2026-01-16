import { useNavigate } from 'react-router-dom'
import { useTrip } from '../context/TripContext'
import TripForm from '../components/TripForm'

function TripPlanner() {
    const navigate = useNavigate()
    const { loadDemoTrip, isLoading } = useTrip()

    const handleDemoTrip = (tripId) => {
        loadDemoTrip(tripId)
        navigate('/route')
    }

    return (
        <div className="min-h-[calc(100vh-3.5rem)] py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Hero Section */}
                <div className="text-center mb-8 sm:mb-10">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-2 sm:mb-3">
                        Plan Your <span className="text-primary-600">HOS-Compliant</span> Trip
                    </h1>
                    <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
                        Enter your route details and get an automatic schedule with rest stops, fuel breaks, and driver daily logs.
                    </p>
                </div>

                <div className="grid lg:grid-cols-5 gap-6">
                    {/* Main Form Card */}
                    <div className="lg:col-span-3">
                        <div className="card p-5 sm:p-6">
                            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
                                <div className="w-9 h-9 bg-primary-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900">Trip Details</h2>
                                    <p className="text-xs text-slate-500">Fill in your route information</p>
                                </div>
                            </div>
                            <TripForm />
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-2 space-y-5">
                        {/* Demo Trips Card */}
                        <div className="card p-5">
                            <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Quick Demo Trips
                            </h3>
                            <div className="space-y-2">
                                <button
                                    onClick={() => handleDemoTrip('short')}
                                    disabled={isLoading}
                                    className="w-full group p-3 bg-slate-50 hover:bg-primary-50 border border-slate-200 hover:border-primary-200 rounded-lg transition-all duration-200 text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                            </svg>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-slate-900 group-hover:text-primary-700 text-sm">Short Haul</p>
                                            <p className="text-xs text-slate-500 truncate">LA → Barstow → Las Vegas • 270 mi</p>
                                        </div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => handleDemoTrip('long')}
                                    disabled={isLoading}
                                    className="w-full group p-3 bg-slate-50 hover:bg-primary-50 border border-slate-200 hover:border-primary-200 rounded-lg transition-all duration-200 text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                                            </svg>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-slate-900 group-hover:text-primary-700 text-sm">Long Haul</p>
                                            <p className="text-xs text-slate-500 truncate">Seattle → Portland → Phoenix • 1,450 mi</p>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* HOS Info Card */}
                        <div className="card p-5">
                            <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                FMCSA HOS Rules Applied
                            </h3>
                            <div className="space-y-2 text-xs">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                                    <span>11-hour driving limit</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600">
                                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                                    <span>14-hour on-duty window</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600">
                                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                                    <span>30-min break after 8h driving</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600">
                                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                                    <span>10 consecutive hours off-duty reset</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600">
                                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                                    <span>70-hour / 8-day rolling cycle</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600 pt-1 border-t border-slate-100 mt-2">
                                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                                    <span>Fuel stops every ~1,000 miles</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="mt-10 sm:mt-12 grid sm:grid-cols-3 gap-4">
                    <FeatureCard
                        icon={
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                        }
                        title="Smart Route Planning"
                        description="Automatic rest stops and fuel breaks"
                    />
                    <FeatureCard
                        icon={
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        }
                        title="HOS Compliant"
                        description="Follows FMCSA regulations"
                    />
                    <FeatureCard
                        icon={
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        }
                        title="Daily Logs"
                        description="Export ELD-style PDF logs"
                    />
                </div>
            </div>
        </div>
    )
}

function FeatureCard({ icon, title, description }) {
    return (
        <div className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-lg">
            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600 flex-shrink-0">
                {icon}
            </div>
            <div>
                <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
                <p className="text-xs text-slate-500">{description}</p>
            </div>
        </div>
    )
}

export default TripPlanner
