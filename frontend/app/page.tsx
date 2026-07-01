export default function Home() {
  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 80,
          mixBlendMode: "multiply",
          opacity: 0.05,
          backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22180%22 height=%22180%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>')`,
          backgroundSize: "180px",
        }}
      />

      <div
        style={{
          fontFamily: "var(--font-newsreader), Georgia, serif",
          color: "#2a2520",
          background: "#f3efe4",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "48px 28px",
          position: "relative",
          zIndex: 1,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "760px",
            height: "760px",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            opacity: 0.5,
          }}
        >
          <svg
            viewBox="0 0 760 760"
            style={{ width: "100%", height: "100%", display: "block" }}
          >
            <circle
              cx="380"
              cy="380"
              r="150"
              fill="none"
              stroke="#d9cfba"
              strokeWidth="1"
            />
            <circle
              cx="380"
              cy="380"
              r="250"
              fill="none"
              stroke="#d9cfba"
              strokeWidth="1"
              strokeDasharray="2 6"
            />
            <circle
              cx="380"
              cy="380"
              r="350"
              fill="none"
              stroke="#e3dac6"
              strokeWidth="1"
            />
            <circle
              cx="120"
              cy="160"
              r="1.6"
              fill="#2a2520"
              style={{ animation: "tw 4s infinite" }}
            />
            <circle
              cx="640"
              cy="220"
              r="1.4"
              fill="#2a2520"
              style={{ animation: "tw 5.5s infinite .6s" }}
            />
            <circle
              cx="600"
              cy="600"
              r="1.6"
              fill="#2a2520"
              style={{ animation: "tw 3.6s infinite 1s" }}
            />
            <circle
              cx="160"
              cy="600"
              r="1.3"
              fill="#2a2520"
              style={{ animation: "tw 4.8s infinite .3s" }}
            />
            <circle
              cx="690"
              cy="430"
              r="1.2"
              fill="#2a2520"
              style={{ animation: "tw 6s infinite .9s" }}
            />
            <circle
              cx="90"
              cy="400"
              r="1.3"
              fill="#2a2520"
              style={{ animation: "tw 5s infinite" }}
            />
          </svg>
        </div>

        <div style={{ position: "relative", zIndex: 2, maxWidth: "680px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "14px",
              marginBottom: "42px",
            }}
          >
            <svg width="44" height="44" viewBox="0 0 40 40" style={{ display: "block" }}>
              <circle
                cx="20"
                cy="20"
                r="18.5"
                fill="none"
                stroke="#9c7a3f"
                strokeWidth="1"
              />
              <circle
                cx="20"
                cy="20"
                r="13"
                fill="none"
                stroke="#c8b894"
                strokeWidth="1"
                strokeDasharray="2 3"
              />
              <circle cx="20" cy="20" r="3.4" fill="#9c7a3f" />
              <circle cx="33" cy="20" r="2.1" fill="#2a2520" />
            </svg>
            <div style={{ fontSize: "24px", letterSpacing: ".01em" }}>
              lunador<span style={{ color: "#9c7a3f" }}>.ro</span>
            </div>
          </div>

          <div
            style={{
              fontFamily: "var(--font-spline-mono), monospace",
              fontSize: "11px",
              letterSpacing: ".26em",
              textTransform: "uppercase",
              color: "#9c7a3f",
              marginBottom: "30px",
            }}
          >
            Lighting the lamp · opening soon
          </div>

          <h1
            style={{
              fontSize: "52px",
              lineHeight: 1.16,
              fontWeight: 400,
              letterSpacing: "-.02em",
              margin: 0,
              textWrap: "balance",
            }}
          >
            A lighthouse for the
            <br />
            <em>late-night mind</em>…
          </h1>

          <div
            style={{
              width: "60px",
              height: "1px",
              background: "#c8b894",
              margin: "40px auto",
            }}
          />

          <p
            style={{
              fontSize: "18px",
              lineHeight: 1.65,
              color: "#6b6053",
              margin: "0 auto",
              maxWidth: "30em",
              textWrap: "pretty",
            }}
          >
            Slow essays on the meaning of a life and the physics of the sky it
            happens under. We are wiring the lamp now — please check back
            shortly.
          </p>

          <div
            style={{
              fontFamily: "var(--font-spline-mono), monospace",
              fontSize: "10.5px",
              letterSpacing: ".16em",
              textTransform: "uppercase",
              color: "#a89a7c",
              marginTop: "48px",
            }}
          >
            47.16°N 27.58°E · iași, romania
          </div>
        </div>
      </div>
    </>
  );
}
