import { Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import BlankPage from './pages/BlankPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/blank" element={<BlankPage />} />
    </Routes>
  )
}
