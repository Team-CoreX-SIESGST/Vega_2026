import { useState } from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

const OrdersChart = ({ data }) => {
  const [zoomRange, setZoomRange] = useState(null);

  // Format month labels
  const formattedData = data.map(item => ({
    ...item,
    label: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
  }));

  const labels = formattedData.map(item => item.label);
  const orders = formattedData.map(item => item.orders);

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
  const visibleOrders = zoomRange
    ? orders.slice(zoomRange.min, zoomRange.max + 1)
    : orders;

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold font-display text-foreground">
          Orders Over Time
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
        <BarChart
          series={[
            {
              data: visibleOrders,
              label: 'Orders',
              color: '#603FEF',
              valueFormatter: (value) => value.toLocaleString(),
            },
          ]}
          xAxis={[
            {
              scaleType: 'band',
              data: visibleLabels,
              categoryGapRatio: 0.3,
              barGapRatio: 0.1,
            },
          ]}
          margin={{ top: 10, right: 10, left: 60, bottom: 30 }}
          grid={{ horizontal: true }}
          sx={{
            '& .MuiChartsAxis-line': {
              stroke: 'rgba(255, 255, 255, 0.5)',
            },
            '& .MuiChartsAxis-tick': {
              stroke: 'rgba(255, 255, 255, 0.5)',
            },
            '& .MuiChartsAxis-tickLabel': {
              fill: 'rgba(255, 255, 255, 0.5)',
              fontSize: 12,
            },
            '& .MuiChartsGrid-line': {
              stroke: 'rgba(96, 63, 239, 0.1)',
              strokeDasharray: '3 3',
            },
            '& .MuiChartsTooltip-root': {
              backgroundColor: 'rgba(10, 10, 10, 0.95)',
              border: '1px solid rgba(96, 63, 239, 0.3)',
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            },
            '& .MuiChartsTooltip-label': {
              color: '#ffffff',
            },
            '& .MuiBarElement-root': {
              fill: 'url(#ordersGradient)',
            },
          }}
        >
          <defs>
            <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#603FEF" stopOpacity={1} />
              <stop offset="100%" stopColor="#7D5FF3" stopOpacity={0.8} />
            </linearGradient>
          </defs>
        </BarChart>
      </div>
      <p className="text-xs text-muted-foreground mt-4 flex items-center gap-2">
        <ZoomIn className="w-3 h-3" />
        Use the zoom buttons above to explore specific time periods in detail
      </p>
    </div>
  );
};

export default OrdersChart;