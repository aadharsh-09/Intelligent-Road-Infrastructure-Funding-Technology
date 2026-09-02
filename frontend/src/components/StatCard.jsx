import "./StatCard.css";

export default function StatCard({ label, value, sub, icon: Icon, tone }) {
  return (
    <div className={`stat-card${tone ? ` stat-card--${tone}` : ""}`}>
      <div className="stat-card-top">
        <span className="stat-card-label">{label}</span>
        {Icon && (
          <span className="stat-card-icon">
            <Icon size={15} strokeWidth={2} />
          </span>
        )}
      </div>
      <div className="stat-card-value mono">{value}</div>
      {sub && <div className="stat-card-sub">{sub}</div>}
    </div>
  );
}
