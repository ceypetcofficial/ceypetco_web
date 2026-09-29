import { Component } from "react";

export default class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("App crashed while rendering", error, info);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <div
        style={{
          margin: "0",
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "14px",
          padding: "40px 24px",
          textAlign: "center",
          fontFamily: "inherit",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "24px" }}>This page failed to render</h1>
        <p style={{ margin: 0, maxWidth: "520px", opacity: 0.75 }}>
          Reload the page to continue. If the problem keeps happening, the content of
          this page may need to be republished.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            border: 0,
            borderRadius: "999px",
            padding: "11px 22px",
            background: "#d71920",
            color: "#fff",
            font: "700 14px inherit",
            cursor: "pointer",
          }}
        >
          Reload page
        </button>
      </div>
    );
  }
}
