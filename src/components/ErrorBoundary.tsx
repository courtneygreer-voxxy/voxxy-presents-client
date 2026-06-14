import React, { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import ReportBug from './ReportBug'
import { getMessage } from '@/errors/catalog'

interface Props {
  children: ReactNode
  fallbackUI?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  showBugReport: boolean
}

/**
 * Error Boundary Component
 * Catches unhandled React errors and prevents full app crashes
 * Shows user-friendly error page with retry and bug report options
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showBugReport: false,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    })

    // Could also send to error logging service here
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showBugReport: false,
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallbackUI) {
        return this.props.fallbackUI
      }

      // Default error UI
      return (
        <div className="min-h-screen voxxy-gradient-page-cool flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <div className="bg-background/5 border border-red-500/30 rounded-lg p-8">
              {/* Icon */}
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl font-bold text-foreground text-center mb-2">
                {getMessage('global.boundaryTitle')}
              </h1>

              {/* Description */}
              <p className="text-foreground/70 text-center mb-6">
                {getMessage('global.boundaryDescription')}
              </p>

              {/* Error Details (Collapsible in dev mode) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-6 bg-black/30 border border-border rounded-lg p-4">
                  <summary className="text-sm text-foreground/80 cursor-pointer hover:text-foreground mb-2">
                    Error Details (Development Only)
                  </summary>
                  <div className="text-xs text-red-300 font-mono overflow-auto max-h-48">
                    <p className="font-bold mb-1">{this.state.error.name}:</p>
                    <p className="mb-2">{this.state.error.message}</p>
                    {this.state.error.stack && (
                      <pre className="text-[10px] text-foreground/50 whitespace-pre-wrap">
                        {this.state.error.stack}
                      </pre>
                    )}
                  </div>
                </details>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <button
                  onClick={this.handleReload}
                  className="flex-1 px-6 py-3 rounded-lg voxxy-btn-cta font-medium transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh Page
                </button>

                <button
                  onClick={this.handleGoHome}
                  className="flex-1 px-6 py-3 rounded-lg bg-background/10 hover:bg-background/20 border border-border text-foreground font-medium transition-all flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </button>
              </div>

              {/* Report Bug Button */}
              <button
                onClick={() => this.setState({ showBugReport: true })}
                className="w-full px-6 py-3 rounded-lg bg-background/5 hover:bg-background/10 border border-border text-foreground/70 hover:text-foreground text-sm font-medium transition-all"
              >
                Report This Error
              </button>

              {/* Support Info */}
              <p className="text-center text-xs text-foreground/50 mt-6">
                If this problem persists, contact us at{' '}
                <a
                  href="mailto:team@heyvoxxy.com"
                  className="text-primary hover:text-primary/70 underline transition-colors"
                >
                  team@heyvoxxy.com
                </a>
              </p>
            </div>
          </div>

          {/* Bug Report Modal */}
          <ReportBug
            isOpen={this.state.showBugReport}
            onClose={() => this.setState({ showBugReport: false })}
            errorContext={{
              errorMessage: this.state.error?.message || 'Unknown error',
              componentName: 'ErrorBoundary',
              timestamp: new Date().toISOString(),
              stack: this.state.error?.stack || undefined,
              componentStack: this.state.errorInfo?.componentStack || undefined,
            }}
            autoShow={false}
          />
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
