const bars = [28, 54, 86, 54, 28, 36, 68, 106, 68, 36, 28, 54, 86, 54, 28]
export default function Logo() {
  return <span className="wave-logo" aria-label="RadarTech">{bars.map((height, i) => <span key={i} style={{ height: `${height}%` }} />)}</span>
}

