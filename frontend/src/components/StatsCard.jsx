import './StatsCard.css';

/**
 * Animated stat card with gradient icon background.
 * @param {React.ReactNode} icon
 * @param {string} label
 * @param {string|number} value
 * @param {string} trend — e.g. "+12%" or "↑ 5"
 * @param {'up'|'down'|'neutral'} trendDir
 * @param {'purple'|'teal'|'orange'|'green'|'blue'} color
 */
export default function StatsCard({
  icon,
  label,
  value,
  trend,
  trendDir = 'neutral',
  color = 'purple',
  className = '',
}) {
  return (
    <div className={`stats-card stats-card-${color} ${className}`}>
      <div className="stats-card-header">
        <div className={`stats-card-icon stats-icon-${color}`}>{icon}</div>
        {trend && (
          <span className={`stats-card-trend trend-${trendDir}`}>{trend}</span>
        )}
      </div>
      <div className="stats-card-value">{value}</div>
      <div className="stats-card-label">{label}</div>
    </div>
  );
}
