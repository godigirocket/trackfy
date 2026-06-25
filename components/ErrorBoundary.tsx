"use client";
import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  label?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error("[ErrorBoundary]", error);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center gap-3 p-8 rounded-lg border border-border bg-muted/30 text-center">
          <AlertTriangle className="w-6 h-6 text-yellow-500" />
          <div>
            <p className="text-sm font-medium">
              {this.props.label ?? "Erro ao carregar componente"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {this.state.error?.message ?? "Erro desconhecido"}
            </p>
          </div>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="btn-outline text-xs py-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Tentar novamente
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
