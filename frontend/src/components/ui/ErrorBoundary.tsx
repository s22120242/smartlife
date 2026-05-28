import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[60vh] p-8">
          <div className="bg-surface rounded-2xl p-8 max-w-md w-full text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Algo salió mal</h2>
            <p className="text-gray-400 text-sm">
              {this.state.error?.message || 'Ocurrió un error inesperado'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
            >
              Recargar página
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
