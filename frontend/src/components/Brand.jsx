export default function Brand({ inverse = false }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '18px', color: inverse ? '#fff' : '#000' }}>
      <span style={{ width: '32px', height: '32px', background: inverse ? '#fff' : '#000', color: inverse ? '#000' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
        S
      </span>
      <span>StudyConnect</span>
    </span>
  );
}