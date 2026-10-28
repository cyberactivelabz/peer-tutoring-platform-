export default function Brand({ inverse = false }) {
  const color = inverse ? "#fff" : "#fff"; // White on dark bg, will be black on light if you want change to "#000"
  // If you want it black on light bg and white on dark bg, use:
  // const color = inverse ? "#fff" : "#000";
  
  return (
    <span style={{ display: "flex", alignItems: "center", gap: "16px" }}>
      {/* ICON - EXACT LIKE YOUR IMAGE - C+S+DOT */}
      <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Main C+S shape - one thick shape */}
        <path
          d="M 68 18 A 42 42 0 1 0 68 82 
             M 68 18 C 48 18, 22 26, 38 50 C 54 74, 68 68, 68 82"
          stroke="white"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* The dot on the right */}
        <circle cx="80" cy="52" r="8" fill="white" />
      </svg>

      {/* WORDS - Study BOLD, Connect REG