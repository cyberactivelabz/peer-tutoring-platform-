export default function Brand({ inverse = false }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <svg width="42" height="42" viewBox="0 0 100 100" fill="white" xmlns="http://www.w3.org/2000/svg">
        {/* Outer C + inner S combined */}
        <path d="M 82 18.5 C 70 6 48 1 28 11 C 8 21 0 42 7 62 C 14 82 33 96 55 96 C 70 96 83 89 91 73 L 71 73 C 66 81 56 87 43 87 C 24 87 9 72 9 51 C 9 30 23 15 43 15 C 52 15 61 18 68 23.5 L 82 18.5 Z
                 M 61 32 L 42 32 C 35 32 31 34.5 31 39 C 31 43.5 34.5 46 43 48.5 C 57 52 78 56 78 72 C 78 88 60 97 37 97 L 37 82 C 51 82 59 79.5 59 72.5 C 59 66 51 63.5 38 60 C 23 56 10 51 10 37 C 10 19 28 9 53 9 L 61 9 L 61 32 Z" fill="white" />
        <circle cx="80" cy="52" r="6.5" fill="white" />
      </svg>
      <span style={{ fontSize: '26px', color: 'white', display: 'flex', fontFamily: 'Inter, sans-serif' }}>
        <span style={{ fontWeight: 700 }}>Study</span>
        <span style={{ fontWeight: 300 }}>Connect</span>
      </span>
    </span>
  );
}