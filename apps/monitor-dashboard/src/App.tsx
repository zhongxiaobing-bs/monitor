import { Route, Routes } from 'react-router-dom'
import EventsPage from './pages/EventsPage'
import OverviewPage from './pages/OverviewPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<OverviewPage />} />
      <Route path="/events" element={<EventsPage />} />
    </Routes>
  )
}
