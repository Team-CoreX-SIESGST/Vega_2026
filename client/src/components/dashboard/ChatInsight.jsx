import { TrendingUp, TrendingDown, AlertTriangle, Lightbulb, Info } from 'lucide-react';

const ChartInsight = ({ type, message }) => {
  const getInsightConfig = () => {
    switch (type) {
      case 'trend-up':
        return {
          icon: <TrendingUp className="w-4 h-4" />,
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/30',
          textColor: 'text-green-400',
          iconBg: 'bg-green-500/20'
        };
      case 'trend-down':
        return {
          icon: <TrendingDown className="w-4 h-4" />,
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30',
          textColor: 'text-red-400',
          iconBg: 'bg-red-500/20'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-4 h-4" />,
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/30',
          textColor: 'text-yellow-400',
          iconBg: 'bg-yellow-500/20'
        };
      case 'opportunity':
        return {
          icon: <Lightbulb className="w-4 h-4" />,
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/30',
          textColor: 'text-blue-400',
          iconBg: 'bg-blue-500/20'
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-4 h-4" />,
          bgColor: 'bg-gray-500/10',
          borderColor: 'border-gray-500/30',
          textColor: 'text-gray-400',
          iconBg: 'bg-gray-500/20'
        };
    }
  };

  const config = getInsightConfig();

  return (
    <div className={`mt-3 p-3 rounded-lg border ${config.bgColor} ${config.borderColor} backdrop-blur-sm`}>
      <div className="flex items-start gap-3">
        <div className={`p-1.5 rounded ${config.iconBg} ${config.textColor} flex-shrink-0 mt-0.5`}>
          {config.icon}
        </div>
        <p className="text-sm text-foreground leading-relaxed">
          {message}
        </p>
      </div>
    </div>
  );
};

export default ChartInsight;