import React, { Component, type ErrorInfo } from 'react'
import type { MonitorErrorBoundaryProps } from './types'

interface MonitorErrorBoundaryState {
  hasError: boolean
}

export class MonitorErrorBoundary extends Component<
  MonitorErrorBoundaryProps,
  MonitorErrorBoundaryState
> {
  state: MonitorErrorBoundaryState = {
    hasError: false
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.monitor.captureException(error, {
      componentStack: info.componentStack
    })
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null
    }

    return this.props.children
  }
}
