import { BarChart } from '@mui/x-charts/BarChart';
import { formatCurrency } from '@/utils/dataCleaners';

const YearlyComparisonChart = ({ data }) => {
  const years = data.map(item => item.year);
  const revenues = data.map(item => item.revenue);
  const orders = data.map(item => item.orders);

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold font-display text-foreground mb-6">
        Yearly Performance
      </h3>
      <div className="h-80">
        <BarChart
          series={[
            {
              data: revenues,
              label: 'Revenue',
              color: 'hsl(252, 91%, 60%)',
              valueFormatter: (value) => formatCurrency(value),
              yAxisKey: 'revenue',
            },
            {
              data: orders,
              label: 'Orders',
              color: 'hsl(142, 76%, 46%)',
              valueFormatter: (value) => value.toLocaleString(),
              yAxisKey: 'orders',
            },
          ]}
          xAxis={[
            {
              scaleType: 'band',
              data: years,
              categoryGapRatio: 0.3,
              barGapRatio: 0.1,
            },
          ]}
          yAxis={[
            {
              id: 'revenue',
              valueFormatter: (value) => `$${(value / 1000000).toFixed(1)}M`,
            },
            {
              id: 'orders',
              valueFormatter: (value) => `${(value / 1000).toFixed(0)}K`,
            },
          ]}
          margin={{ top: 60, right: 60, left: 60, bottom: 30 }}
          grid={{ horizontal: true }}
          slotProps={{
            legend: {
              direction: 'row',
              position: { vertical: 'top', horizontal: 'middle' },
              padding: 0,
              labelStyle: {
                fontSize: 14,
                fill: 'hsl(240, 5%, 64.9%)',
              },
            },
          }}
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
            '& .MuiBarElement-root:nth-of-type(1)': {
              fill: 'url(#revenueBarGradient)',
            },
            '& .MuiBarElement-root:nth-of-type(2)': {
              fill: 'url(#ordersBarGradient)',
            },
          }}
        >
          <defs>
            <linearGradient id="revenueBarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(252, 91%, 60%)" stopOpacity={1} />
              <stop offset="100%" stopColor="hsl(252, 91%, 60%)" stopOpacity={0.6} />
            </linearGradient>
            <linearGradient id="ordersBarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(142, 76%, 46%)" stopOpacity={1} />
              <stop offset="100%" stopColor="hsl(142, 76%, 46%)" stopOpacity={0.6} />
            </linearGradient>
          </defs>
        </BarChart>
      </div>
    </div>
  );
};

export default YearlyComparisonChart;