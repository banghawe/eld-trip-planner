import { Routes, Route } from 'react-router-dom'
import { TripProvider } from './context/TripContext'
import Header from './components/layout/Header'
import TripPlanner from './pages/TripPlanner'
import RouteSchedule from './pages/RouteSchedule'
import DailyLogs from './pages/DailyLogs'

function App() {
    return (
        <TripProvider>
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                    <Routes>
                        <Route path="/" element={<TripPlanner />} />
                        <Route path="/route" element={<RouteSchedule />} />
                        <Route path="/logs" element={<DailyLogs />} />
                    </Routes>
                </main>
            </div>
        </TripProvider>
    )
}

export default App
