
// ============================================
// KpiCard.jsx
// ============================================
import { TrendingUp, TrendingDown } from 'lucide-react';

const KpiCard = ({ title, value, change, changeLabel, icon, trend }) => {
  const getTrendColor = () => {
    if (trend === 'up') return 'text-success';
    if (trend === 'down') return 'text-destructive';
    return 'text-muted-foreground';
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-3 h-3" />;
    if (trend === 'down') return <TrendingDown className="w-3 h-3" />;
    return null;
  };

  return (
    <div className="glass-card-hover p-6 group">
      <div className="flex items-start justify-between mb-4">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        {icon && (
          <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
            {icon}
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <h3 className="text-3xl font-bold font-display text-foreground">{value}</h3>
        
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm ${getTrendColor()}`}>
            {getTrendIcon()}
            <span>{change > 0 ? '+' : ''}{change.toFixed(1)}%</span>
            {changeLabel && (
              <span className="text-muted-foreground ml-1">{changeLabel}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default KpiCard;