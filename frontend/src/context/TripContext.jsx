import { createContext, useContext, useState, useCallback } from 'react'
import { mockTrips } from '../data/mockTrips'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

const TripContext = createContext(null)

export function TripProvider({ children }) {
    const [tripData, setTripData] = useState(null)
    const [currentDay, setCurrentDay] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)

    const planTrip = useCallback(async (formData) => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(`${API_URL}/plan-trip`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to plan trip')
            }

            const schedule = await response.json()
            setTripData(schedule)
            setCurrentDay(0)
            setIsLoading(false)
            return true // Success
        } catch (err) {
            console.error('Trip planning error:', err)

            // User-friendly error messages
            let message = 'An unexpected error occurred. Please try again.'

            if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
                message = 'Unable to connect to server. Please check your internet connection or try again later.'
            } else if (err.message.includes('timeout')) {
                message = 'Request timed out. The server may be busy, please try again.'
            } else if (err.message) {
                message = err.message
            }

            setError(message)
            setIsLoading(false)
            return false // Failure
        }
    }, [])

    const loadDemoTrip = useCallback((tripId) => {
        setIsLoading(true)
        setError(null)

        setTimeout(() => {
            const demoTrip = mockTrips[tripId]
            if (demoTrip) {
                setTripData(demoTrip)
                setCurrentDay(0)
            }
            setIsLoading(false)
        }, 500)
    }, [])

    const clearTrip = useCallback(() => {
        setTripData(null)
        setCurrentDay(0)
        setError(null)
    }, [])

    const clearError = useCallback(() => {
        setError(null)
    }, [])

    const value = {
        tripData,
        currentDay,
        isLoading,
        error,
        setCurrentDay,
        planTrip,
        loadDemoTrip,
        clearTrip,
        clearError,
    }

    return (
        <TripContext.Provider value={value}>
            {children}
        </TripContext.Provider>
    )
}

export function useTrip() {
    const context = useContext(TripContext)
    if (!context) {
        throw new Error('useTrip must be used within a TripProvider')
    }
    return context
}
