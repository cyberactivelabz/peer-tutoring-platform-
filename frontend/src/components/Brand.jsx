export default function Brand({ inverse = false }) {
  const mainColor = inverse ? "#fff" : "#000";
  return (
    <span style={{ display: "flex", alignItems: "center", gap: "16px" }}>
      <svg width="48" height="48" viewBox="0 0 100 100" fill="none">
        <path
          d="M 68 18 A 42 42 0 1 0 68 82 
             M 68 18 C 48 18, 22 26, 38 50 C 54 74, 68 68, 68 82"
          stroke={mainColor}
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="80" cy="52" r="8" fill={mainColor} />
      </svg>
      <span style={{ display: "flex", color: mainColor, fontFamily: "Inter, sans-serif", fontSize: "26px" }}>
        <span style={{ fontWeight: "800" }}>Study</span>
        <span style={{ fontWeight: "400" }}>Connect</span>
      </span>
    </span>
  );
}