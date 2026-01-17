import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTrip } from '../../context/TripContext'

function Header() {
    const location = useLocation()
    const { tripData } = useTrip()
    const hasTripData = !!tripData

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14 sm:h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 bg-primary-600 rounded-lg flex items-center justify-center shadow-sm">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                        </div>
                        <div className="hidden xs:block">
                            <h1 className="text-base sm:text-lg font-bold text-slate-900">ELD Trip Planner</h1>
                            <p className="text-[10px] sm:text-xs text-slate-500 -mt-0.5 hidden sm:block">HOS-Compliant Route Planning</p>
                        </div>
                    </Link>

                    {/* Navigation */}
                    <nav className="flex items-center gap-1">
                        <NavLink to="/" active={location.pathname === '/'}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span className="hidden sm:inline">Plan Trip</span>
                        </NavLink>
                        <NavLink
                            to="/route"
                            active={location.pathname === '/route'}
                            disabled={!hasTripData}
                            tooltip={!hasTripData ? "Plan a trip first" : null}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            <span className="hidden sm:inline">Route</span>
                        </NavLink>
                        <NavLink
                            to="/logs"
                            active={location.pathname === '/logs'}
                            disabled={!hasTripData}
                            tooltip={!hasTripData ? "Plan a trip first" : null}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="hidden sm:inline">Logs</span>
                        </NavLink>
                    </nav>
                </div>
            </div>
        </header>
    )
}

function NavLink({ to, active, disabled, tooltip, children }) {
    const [showTooltip, setShowTooltip] = useState(false)

    if (disabled) {
        return (
            <div
                className="relative group"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
            >
                <span
                    onClick={() => setShowTooltip(prev => !prev)}
                    onBlur={() => setShowTooltip(false)}
                    tabIndex={0}
                    className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 rounded-lg text-sm font-medium
                        text-slate-300 cursor-not-allowed select-none"
                >
                    {children}
                    {/* Lock icon for mobile clarity */}
                    <svg className="w-3 h-3 sm:hidden opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </span>
                {tooltip && showTooltip && (
                    <div
                        className="absolute top-full right-0 mt-2 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-lg
                            whitespace-nowrap z-50 shadow-lg"
                    >
                        {tooltip}
                        <div className="absolute -top-1 right-4 w-2 h-2 bg-slate-800 rotate-45" />
                    </div>
                )}
            </div>
        )
    }

    return (
        <Link
            to={to}
            className={`
                flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 rounded-lg text-sm font-medium
                transition-all duration-200
                ${active
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }
            `}
        >
            {children}
        </Link>
    )
}

export default Header
