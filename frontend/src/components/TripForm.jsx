import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTrip } from '../context/TripContext'

const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY

// Debounce helper
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value)

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay)
        return () => clearTimeout(handler)
    }, [value, delay])

    return debouncedValue
}

// Search locations using OpenRouteService
async function searchLocations(query) {
    if (!query || query.length < 3) return { results: [], error: null }

    try {
        const res = await fetch(
            `https://api.openrouteservice.org/geocode/autocomplete?` +
            `api_key=${ORS_API_KEY}&text=${encodeURIComponent(query)}&boundary.country=US&size=5`
        )

        if (res.status === 429) {
            return { results: [], error: 'Location search quota exceeded. Please try again later.' }
        }

        if (!res.ok) {
            return { results: [], error: 'Location search failed. Please try again.' }
        }

        const data = await res.json()

        return {
            results: data.features.map(f => ({
                label: f.properties.label,
                lat: f.geometry.coordinates[1],
                lng: f.geometry.coordinates[0],
            })),
            error: null
        }
    } catch (error) {
        console.error('Geocoding error:', error)
        return { results: [], error: 'Network error. Check your connection.' }
    }
}

function TripForm() {
    const navigate = useNavigate()
    const { planTrip, isLoading, error: tripError, clearError } = useTrip()
    const [geocodeError, setGeocodeError] = useState(null)

    const [formData, setFormData] = useState({
        currentLocation: null,
        pickupLocation: null,
        dropoffLocation: null,
        cycleHoursUsed: 20,
    })

    const [searchInputs, setSearchInputs] = useState({
        currentLocation: '',
        pickupLocation: '',
        dropoffLocation: '',
    })

    const [activeField, setActiveField] = useState(null)
    const [suggestions, setSuggestions] = useState([])
    const [isSearching, setIsSearching] = useState(false)
    const [cycleInputValue, setCycleInputValue] = useState('20')

    // Debounce search input
    const debouncedQuery = useDebounce(
        activeField ? searchInputs[activeField] : '',
        300
    )

    // Search when debounced query changes
    useEffect(() => {
        if (!activeField || !debouncedQuery || debouncedQuery.length < 3) {
            setSuggestions([])
            return
        }

        setIsSearching(true)
        setGeocodeError(null)
        searchLocations(debouncedQuery)
            .then(({ results, error }) => {
                setSuggestions(results)
                if (error) setGeocodeError(error)
                setIsSearching(false)
            })
            .catch(() => {
                setSuggestions([])
                setGeocodeError('Location search failed.')
                setIsSearching(false)
            })
    }, [debouncedQuery, activeField])

    const handleInputChange = (field, value) => {
        setSearchInputs(prev => ({ ...prev, [field]: value }))
        // Clear selection if user is typing
        if (formData[field]) {
            setFormData(prev => ({ ...prev, [field]: null }))
        }
    }

    const handleSliderChange = (value) => {
        const numValue = parseInt(value, 10)
        setFormData(prev => ({ ...prev, cycleHoursUsed: numValue }))
        setCycleInputValue(String(numValue))
    }

    const handleCycleInputChange = (e) => {
        const rawValue = e.target.value
        setCycleInputValue(rawValue)

        // Only update the actual value if it's a valid number
        const numValue = parseInt(rawValue, 10)
        if (!isNaN(numValue)) {
            setFormData(prev => ({ ...prev, cycleHoursUsed: Math.min(70, Math.max(0, numValue)) }))
        }
    }

    const handleCycleInputBlur = () => {
        // On blur, clamp and sync the display value
        const numValue = Math.min(70, Math.max(0, parseInt(cycleInputValue, 10) || 0))
        setFormData(prev => ({ ...prev, cycleHoursUsed: numValue }))
        setCycleInputValue(String(numValue))
    }

    const handleFocus = (field) => {
        setActiveField(field)
    }

    const handleBlur = () => {
        // Delay to allow click on suggestion
        setTimeout(() => {
            setActiveField(null)
            setSuggestions([])
        }, 200)
    }

    const selectLocation = (field, location) => {
        setFormData(prev => ({ ...prev, [field]: location }))
        setSearchInputs(prev => ({ ...prev, [field]: location.label }))
        setSuggestions([])
        setActiveField(null)
        setGeocodeError(null) // Clear geocode error on selection
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!isValid) return

        // Call the API
        const success = await planTrip({
            current_location: formData.currentLocation,
            pickup_location: formData.pickupLocation,
            dropoff_location: formData.dropoffLocation,
            cycle_hours_used: formData.cycleHoursUsed,
        })

        // Navigate only if successful
        if (success) {
            navigate('/route')
        }
    }

    const isValid =
        formData.currentLocation &&
        formData.pickupLocation &&
        formData.dropoffLocation

    // Combined error message
    const errorMessage = tripError || geocodeError

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Banner */}
            {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <p className="text-red-700 font-medium">Error</p>
                        <p className="text-red-600 text-sm">{errorMessage}</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => { setGeocodeError(null); clearError(); }}
                        className="ml-auto text-red-400 hover:text-red-600"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Current Location */}
            <LocationInput
                label="Current Location"
                step={1}
                color="primary"
                icon={
                    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                }
                value={searchInputs.currentLocation}
                onChange={(v) => handleInputChange('currentLocation', v)}
                onFocus={() => handleFocus('currentLocation')}
                onBlur={handleBlur}
                isActive={activeField === 'currentLocation'}
                isSelected={!!formData.currentLocation}
                suggestions={activeField === 'currentLocation' ? suggestions : []}
                isSearching={isSearching && activeField === 'currentLocation'}
                onSelect={(loc) => selectLocation('currentLocation', loc)}
                placeholder="Search city, e.g. Seattle, WA"
            />

            {/* Pickup Location */}
            <LocationInput
                label="Pickup Location"
                step={2}
                color="green"
                icon={
                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                }
                value={searchInputs.pickupLocation}
                onChange={(v) => handleInputChange('pickupLocation', v)}
                onFocus={() => handleFocus('pickupLocation')}
                onBlur={handleBlur}
                isActive={activeField === 'pickupLocation'}
                isSelected={!!formData.pickupLocation}
                suggestions={activeField === 'pickupLocation' ? suggestions : []}
                isSearching={isSearching && activeField === 'pickupLocation'}
                onSelect={(loc) => selectLocation('pickupLocation', loc)}
                placeholder="Search city, e.g. Portland, OR"
            />

            {/* Dropoff Location */}
            <LocationInput
                label="Dropoff Location"
                step={3}
                color="orange"
                icon={
                    <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                    </svg>
                }
                value={searchInputs.dropoffLocation}
                onChange={(v) => handleInputChange('dropoffLocation', v)}
                onFocus={() => handleFocus('dropoffLocation')}
                onBlur={handleBlur}
                isActive={activeField === 'dropoffLocation'}
                isSelected={!!formData.dropoffLocation}
                suggestions={activeField === 'dropoffLocation' ? suggestions : []}
                isSearching={isSearching && activeField === 'dropoffLocation'}
                onSelect={(loc) => selectLocation('dropoffLocation', loc)}
                placeholder="Search city, e.g. Phoenix, AZ"
            />

            {/* Cycle Hours Used */}
            <div>
                <label className="label">
                    <span className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-xs font-bold">4</span>
                        Cycle Hours Used
                        <span className="relative group">
                            <svg className="w-4 h-4 text-slate-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="absolute right-0 sm:left-0 bottom-full mb-2 w-56 sm:w-64 p-3 bg-slate-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-30 shadow-lg">
                                <strong>70-Hour / 8-Day Rule:</strong>
                                <p className="mt-1">You cannot drive after being on duty 70 hours in any 8 consecutive days. A 34-hour restart resets this limit.</p>
                            </div>
                        </span>
                    </span>
                </label>
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <input
                            type="range"
                            min="0"
                            max="70"
                            value={formData.cycleHoursUsed}
                            onChange={(e) => handleSliderChange(e.target.value)}
                            className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={cycleInputValue}
                            onChange={handleCycleInputChange}
                            onBlur={handleCycleInputBlur}
                            className="w-16 text-center px-2 py-1.5 border border-slate-200 rounded-lg text-purple-700 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    {/* Availability indicator */}
                    <div className={`flex items-center justify-between p-2 rounded-lg ${formData.cycleHoursUsed >= 70 ? 'bg-red-50 border border-red-200' :
                        formData.cycleHoursUsed >= 60 ? 'bg-amber-50 border border-amber-200' :
                            'bg-green-50 border border-green-200'
                        }`}>
                        <span className={`text-sm font-medium ${formData.cycleHoursUsed >= 70 ? 'text-red-700' :
                            formData.cycleHoursUsed >= 60 ? 'text-amber-700' :
                                'text-green-700'
                            }`}>
                            {formData.cycleHoursUsed >= 70 ? (
                                <span className="flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    34-hour restart required
                                </span>
                            ) : formData.cycleHoursUsed >= 60 ? (
                                <span className="flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Low hours remaining
                                </span>
                            ) : (
                                <span className="flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Good to drive
                                </span>
                            )}
                        </span>
                        <span className={`text-sm font-bold ${formData.cycleHoursUsed >= 70 ? 'text-red-600' :
                            formData.cycleHoursUsed >= 60 ? 'text-amber-600' :
                                'text-green-600'
                            }`}>
                            {70 - formData.cycleHoursUsed}h available
                        </span>
                    </div>
                </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
                <button
                    type="submit"
                    disabled={!isValid || isLoading}
                    className="btn-primary w-full text-base py-3"
                >
                    {isLoading ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Planning Route...
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            Plan Trip
                        </span>
                    )}
                </button>
            </div>
        </form>
    )
}

function LocationInput({
    label, step, color, icon, value, onChange, onFocus, onBlur,
    isActive, isSelected, suggestions, isSearching, onSelect, placeholder
}) {
    const colorClasses = {
        primary: 'bg-primary-100 text-primary-600',
        green: 'bg-green-100 text-green-600',
        orange: 'bg-orange-100 text-orange-600',
    }

    return (
        <div>
            <label className="label">
                <span className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${colorClasses[color]}`}>
                        {step}
                    </span>
                    {label}
                </span>
            </label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {icon}
                </div>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    className={`input pl-10 ${isSelected ? 'border-green-400 bg-green-50/50' : ''}`}
                    autoComplete="off"
                />
                {isSelected && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                )}

                {/* Suggestions Dropdown */}
                {isActive && (suggestions.length > 0 || isSearching) && (
                    <ul className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                        {isSearching ? (
                            <li className="px-4 py-3 text-sm text-slate-500 flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Searching...
                            </li>
                        ) : (
                            suggestions.map((loc, index) => (
                                <li key={index}>
                                    <button
                                        type="button"
                                        onClick={() => onSelect(loc)}
                                        className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-primary-50 hover:text-primary-700 flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        </svg>
                                        {loc.label}
                                    </button>
                                </li>
                            ))
                        )}
                    </ul>
                )}
            </div>
        </div>
    )
}

export default TripForm
