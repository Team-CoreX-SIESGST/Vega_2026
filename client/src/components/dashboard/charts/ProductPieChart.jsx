import { useState } from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { Card, CardContent, Typography, Box, Stack, Tooltip as MuiTooltip } from '@mui/material';
import { formatCurrency } from '@/utils/dataCleaners';

const COLORS = [
  '#603FEF',
  '#7D5FF3',
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
];

const ProductPieChart = ({ data, title, dataKey = 'orders' }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  // Transform data for MUI PieChart
  const chartData = data.map((item, index) => ({
    id: index,
    value: item[dataKey],
    label: item.product,
    color: COLORS[index % COLORS.length],
  }));

  // Calculate total for percentages
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  const handleMouseEnter = (event, index) => {
    setActiveIndex(index);
  };

  const handleMouseLeave = () => {
    setActiveIndex(null);
  };

  return (
    <Card 
      className="glass-card"
      sx={{
        p: 3,
        backgroundColor: 'rgba(16, 18, 27, 0.4)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'white' }}>
        {title}
      </Typography>
      
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ height: 280 }}>
          <PieChart
            series={[
              {
                data: chartData,
                innerRadius: 60,
                outerRadius: 90,
                paddingAngle: 4,
                cornerRadius: 4,
                highlightScope: { fade: 'global', highlight: 'item' },
                faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                arcLabel: (item) => `${((item.value / total) * 100).toFixed(1)}%`,
                arcLabelMinAngle: 15,
                arcLabelRadius: '75%',
                valueFormatter: (value, context) => {
                  const dataItem = data[context.dataIndex];
                  return dataKey === 'revenue' 
                    ? `${dataItem.product}: ${formatCurrency(value)}`
                    : `${dataItem.product}: ${value.toLocaleString()} orders`;
                },
              },
            ]}
            slotProps={{
              legend: {
                direction: 'row',
                position: { vertical: 'bottom', horizontal: 'middle' },
                padding: { top: 20 },
                labelStyle: { fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 },
                itemMarkWidth: 8,
                itemMarkHeight: 8,
              },
            }}
            onItemClick={(event, { dataIndex }) => {
              setActiveIndex(dataIndex);
            }}
            margin={{ top: 20, bottom: 70, left: 20, right: 20 }}
          />
        </Box>

        {/* Custom legend with more details */}
        <Stack spacing={1} sx={{ mt: 3 }}>
          {chartData.slice(0, 4).map((item, index) => (
            <MuiTooltip 
              key={index} 
              title={`${((item.value / total) * 100).toFixed(1)}% of total`}
              arrow
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 1.5,
                  borderRadius: 1,
                  backgroundColor: activeIndex === index ? 'rgba(96, 63, 239, 0.1)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  '&:hover': {
                    backgroundColor: 'rgba(96, 63, 239, 0.15)',
                  },
                }}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: item.color,
                    flexShrink: 0,
                  }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: 'rgba(255, 255, 255, 0.7)', display: 'block' }}
                    noWrap
                  >
                    {item.label}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'white' }}>
                    {dataKey === 'revenue' 
                      ? formatCurrency(item.value)
                      : `${item.value.toLocaleString()} orders`}
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                  {((item.value / total) * 100).toFixed(1)}%
                </Typography>
              </Box>
            </MuiTooltip>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ProductPieChart;