export default function Brand({ inverse = false, motion = false }) {
  const color = inverse ? "#fff" : "#000";
  return (
    <span
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        fontFamily: "Inter, sans-serif",
        color: color,
      }}
    >
      {/* ROUND LOGO - THIS SPINS */}
      <span
        style={{
          display: "flex",
          animation: motion ? "spin 2.5s linear infinite" : "none",
        }}
      >
        <svg
          width="36"
          height="36"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 75 25 A 42 42 0 1 0 75 75
               M 75 25 C 50 25, 28 32, 40 50 C 52 68, 75 60, 75 75"
            stroke={color}
            strokeWidth="11"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="78" cy="50" r="7" fill={color} />
        </svg>
      </span>

      {/* WORDS - THIS STAYS STILL */}
      <span style={{ display: "flex", fontSize: "22px", lineHeight: "1", letterSpacing: "-0.02em" }}>
        <strong style={{ fontWeight: "800" }}>Study</strong>
        <span style={{ fontWeight: "400" }}>Connect</span>
      </span>

      {/* SPIN ANIMATION - ONLY FOR ROUND PART */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </span>
  );
}