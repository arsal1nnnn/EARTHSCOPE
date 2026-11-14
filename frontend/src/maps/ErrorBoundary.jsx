import React from "react";

/**
 * ErrorBoundary for Map Components
 * Prevents any runtime or map initialization error from crashing the parent application.
 */
export default class MapErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("MapErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            height: this.props.height || "650px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#090d16",
            border: "1px solid #1e293b",
            borderRadius: "16px",
            color: "#f87171",
            padding: "24px",
            textAlign: "center",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>⚠️</div>
          <h3 style={{ fontSize: "16px", fontWeight: "bold", color: "#f1f5f9", marginBottom: "8px" }}>
            Geospatial Map Initialization Error
          </h3>
          <p style={{ fontSize: "13px", color: "#94a3b8", maxWidth: "480px", marginBottom: "16px" }}>
            {this.state.error?.message || "An unexpected error occurred while loading Leaflet map."}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              padding: "8px 16px",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Retry Loading Map
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
