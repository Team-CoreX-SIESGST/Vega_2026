import { BarChart } from '@mui/x-charts/BarChart';
import { formatCurrency } from '@/utils/dataCleaners';

const RefundChart = ({ data }) => {
  // Truncate long product names
  const formattedData = data.map(item => ({
    ...item,
    label: item.product.length > 15 ? item.product.substring(0, 15) + '...' : item.product,
  }));

  // Prepare data for MUI BarChart
  const labels = formattedData.map(item => item.label);
  const amounts = formattedData.map(item => item.amount);
  const refunds = formattedData.map(item => item.refunds);

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold font-display text-foreground mb-6">
        Refunds by Product
      </h3>
      <div className="h-72">
        <BarChart
          layout="horizontal"
          series={[
            {
              data: amounts,
              label: 'Refund Amount',
              color: 'hsl(0, 84%, 60%)',
              valueFormatter: (value) => formatCurrency(value),
            },
          ]}
          yAxis={[
            {
              scaleType: 'band',
              data: labels,
              categoryGapRatio: 0.3,
              barGapRatio: 0.1,
            },
          ]}
          xAxis={[
            {
              valueFormatter: (value) => `$${(value / 1000).toFixed(0)}K`,
            },
          ]}
          margin={{ top: 10, right: 10, left: 100, bottom: 30 }}
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
          }}
        />
      </div>
    </div>
  );
};

export default RefundChart;