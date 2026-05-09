import { Link } from 'react-router-dom'

export default function HomePage() {
  const triggerUnhandledRejection = () => {
    Promise.reject(new Error('manual unhandled rejection from home page'))
  }

  const triggerAsyncRuntimeError = () => {
    setTimeout(() => {
      throw new Error('async runtime error from home page')
    }, 300)
  }

  const triggerHttp500 = async () => {
    await fetch('/api/mock-500')
  }

  const triggerNetworkError = async () => {
    await fetch('http://localhost:3999/not-found')
  }

  return (
    <main style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1>Frontend Monitor Playground</h1>

      <nav style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <Link to="/blank">Go to Blank Page</Link>
      </nav>

      <p>Use the buttons below to trigger monitor events.</p>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button onClick={triggerUnhandledRejection}>
          Trigger Unhandled Rejection
        </button>
        <button onClick={triggerAsyncRuntimeError}>
          Trigger Async Runtime Error
        </button>
        <button onClick={triggerHttp500}>Trigger HTTP 500</button>
        <button onClick={triggerNetworkError}>Trigger Network Error</button>
      </div>
    </main>
  )
}
