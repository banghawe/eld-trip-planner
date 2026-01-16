import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTrip } from '../context/TripContext'
import LogSheetCanvas from '../components/LogSheetCanvas'

function DailyLogs() {
  const navigate = useNavigate()
  const { tripData, currentDay, setCurrentDay, isLoading } = useTrip()
  const printRef = useRef(null)

  // Redirect to home if no trip data
  useEffect(() => {
    if (!tripData && !isLoading) {
      navigate('/')
    }
  }, [tripData, isLoading, navigate])

  const handlePrint = () => {
    window.print()
  }

  if (isLoading || !tripData) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-500 border-t-transparent"></div>
      </div>
    )
  }

  const currentDayData = tripData.days[currentDay]
  const totalDays = tripData.days.length

  const goToPrevDay = () => {
    if (currentDay > 0) setCurrentDay(currentDay - 1)
  }

  const goToNextDay = () => {
    if (currentDay < totalDays - 1) setCurrentDay(currentDay + 1)
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] py-4 sm:py-6 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6" ref={printRef}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to="/route"
              className="p-2 -ml-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors no-print"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">Driver Daily Logs</h1>
              <p className="text-xs sm:text-sm text-slate-500">{tripData.name || 'Your Trip'}</p>
            </div>
          </div>
          <button
            onClick={handlePrint}
            className="btn-primary text-sm no-print"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
        </div>

        {/* Day Navigation */}
        <div className="flex items-center justify-center gap-3 no-print">
          <button
            onClick={goToPrevDay}
            disabled={currentDay === 0}
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-center px-4">
            <span className="text-lg font-bold text-slate-900">
              Day {currentDayData?.day} of {totalDays}
            </span>
            <p className="text-xs text-slate-500">{currentDayData?.date}</p>
          </div>
          <button
            onClick={goToNextDay}
            disabled={currentDay === totalDays - 1}
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Log Sheet */}
        <div className="card p-4 sm:p-5">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Driver's Daily Log</h2>
              <p className="text-xs text-slate-500">24-Hour Period • Property-Carrying Vehicle</p>
            </div>
          </div>

          <LogSheetCanvas
            log={currentDayData?.log}
            day={currentDayData?.day}
            date={currentDayData?.date}
            stops={currentDayData?.stops || []}
            totalMiles={currentDayData?.stops?.slice(-1)[0]?.mileage || 0}
          />
        </div>

        {/* Day Quick Navigation */}
        {totalDays > 1 && (
          <div className="flex justify-center no-print">
            <div className="flex items-center gap-2">
              {tripData.days.map((day, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentDay(index)}
                  className={`w-9 h-9 flex items-center justify-center rounded-full font-medium text-sm transition-all border ${currentDay === index
                    ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                >
                  {day.day}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Signature Section */}
        <div className="card p-4 sm:p-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-slate-700 text-sm mb-2">Driver's Signature</h3>
              <div className="h-14 bg-slate-50 border border-slate-200 border-dashed rounded-lg flex items-center justify-center text-slate-400 text-xs">
                Sign here
              </div>
            </div>
            <div>
              <h3 className="font-medium text-slate-700 text-sm mb-2">Co-Driver's Signature</h3>
              <div className="h-14 bg-slate-50 border border-slate-200 border-dashed rounded-lg flex items-center justify-center text-slate-400 text-xs">
                Sign here (if applicable)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DailyLogs
