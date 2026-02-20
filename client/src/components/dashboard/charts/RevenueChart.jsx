import { useState } from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { formatCurrency } from '@/utils/dataCleaners';

const RevenueChart = ({ data }) => {
  const [zoomRange, setZoomRange] = useState(null);

  // Format month labels
  const formattedData = data.map(item => ({
    ...item,
    label: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
  }));

  const labels = formattedData.map(item => item.label);
  const revenues = formattedData.map(item => item.revenue);

  const handleZoomIn = () => {
    const currentRange = zoomRange || { min: 0, max: labels.length - 1 };
    const rangeSize = currentRange.max - currentRange.min;
    const newRangeSize = Math.max(3, Math.floor(rangeSize * 0.7));
    const center = (currentRange.min + currentRange.max) / 2;
    
    setZoomRange({
      min: Math.max(0, Math.floor(center - newRangeSize / 2)),
      max: Math.min(labels.length - 1, Math.ceil(center + newRangeSize / 2))
    });
  };

  const handleZoomOut = () => {
    if (!zoomRange) return;
    
    const rangeSize = zoomRange.max - zoomRange.min;
    const newRangeSize = Math.min(labels.length - 1, Math.floor(rangeSize * 1.3));
    const center = (zoomRange.min + zoomRange.max) / 2;
    
    const newMin = Math.max(0, Math.floor(center - newRangeSize / 2));
    const newMax = Math.min(labels.length - 1, Math.ceil(center + newRangeSize / 2));
    
    if (newMin === 0 && newMax === labels.length - 1) {
      setZoomRange(null);
    } else {
      setZoomRange({ min: newMin, max: newMax });
    }
  };

  const handleReset = () => {
    setZoomRange(null);
  };

  // Filter data based on zoom range
  const visibleLabels = zoomRange 
    ? labels.slice(zoomRange.min, zoomRange.max + 1)
    : labels;
  const visibleRevenues = zoomRange
    ? revenues.slice(zoomRange.min, zoomRange.max + 1)
    : revenues;

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold font-display text-foreground">
          Revenue Trend
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4 text-foreground" />
          </button>
          <button
            onClick={handleZoomOut}
            disabled={!zoomRange}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4 text-foreground" />
          </button>
          <button
            onClick={handleReset}
            disabled={!zoomRange}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Reset Zoom"
          >
            <Maximize2 className="w-4 h-4 text-foreground" />
          </button>
        </div>
      </div>
      <div className="h-80">
        <LineChart
          series={[
            {
              data: visibleRevenues,
              label: 'Revenue',
              color: 'hsl(252, 91%, 60%)',
              curve: 'natural',
              area: true,
              showMark: false,
              valueFormatter: (value) => formatCurrency(value),
            },
          ]}
          xAxis={[
            {
              scaleType: 'point',
              data: visibleLabels,
            },
          ]}
          yAxis={[
            {
              valueFormatter: (value) => `$${(value / 1000).toFixed(0)}K`,
            },
          ]}
          margin={{ top: 10, right: 10, left: 60, bottom: 30 }}
          grid={{ horizontal: true }}
          sx={{
            '& .MuiChartsAxis-line': {
              stroke: 'hsl(240, 5%, 55%)',
            },
            '& .MuiChartsAxis-tick': {
              stroke: 'hsl(240, 5%, 55%)',
            },
            '& .MuiChartsAxis-tickLabel': {
              fill: 'hsl(240, 5%, 55%)',
              fontSize: 12,
            },
            '& .MuiChartsGrid-line': {
              stroke: 'hsl(240, 10%, 16%)',
              strokeDasharray: '3 3',
            },
            '& .MuiChartsTooltip-root': {
              backgroundColor: 'hsl(240, 10%, 8%)',
              border: '1px solid hsl(240, 10%, 16%)',
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            },
            '& .MuiChartsTooltip-label': {
              color: 'hsl(0, 0%, 98%)',
            },
            '& .MuiAreaElement-root': {
              fill: 'url(#revenueGradient)',
            },
            '& .MuiLineElement-root': {
              strokeWidth: 2,
            },
          }}
        >
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(252, 91%, 60%)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="hsl(252, 91%, 60%)" stopOpacity={0} />
            </linearGradient>
          </defs>
        </LineChart>
      </div>
    </div>
  );
};

export default RevenueChart;