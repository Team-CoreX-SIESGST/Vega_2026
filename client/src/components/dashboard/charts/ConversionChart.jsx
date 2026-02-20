import { useState } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Brush, Cell, ComposedChart, Area 
} from 'recharts';
import { ZoomIn, Move, TrendingUp } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const ConversionChart = ({ type, data, title }) => {
  const [brushIndexes, setBrushIndexes] = useState({
    startIndex: 0,
    endIndex: data.length - 1
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-3 shadow-xl">
          <p className="text-gray-200 font-medium mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-semibold">
                {entry.name.includes('Rate') || entry.name.includes('%') 
                  ? `${entry.value.toFixed(2)}%` 
                  : entry.value.toLocaleString()}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    switch (type) {
      case 'timeline':
        return (
          <div>
            <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
              <Move className="w-3 h-3" />
              <span>Use the slider below to zoom and pan through the data</span>
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(148, 163, 184, 0.5)"
                  tick={{ fill: 'rgba(148, 163, 184, 0.8)', fontSize: 11 }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                />
                <YAxis 
                  yAxisId="left"
                  stroke="rgba(148, 163, 184, 0.5)"
                  tick={{ fill: 'rgba(148, 163, 184, 0.8)', fontSize: 11 }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="rgba(148, 163, 184, 0.5)"
                  tick={{ fill: 'rgba(148, 163, 184, 0.8)', fontSize: 11 }}
                  tickFormatter={(value) => `${value.toFixed(1)}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ color: 'rgba(148, 163, 184, 0.8)', fontSize: '12px' }}
                  iconType="line"
                />
                
                <Brush 
                  dataKey="date"
                  height={30}
                  stroke="#3b82f6"
                  fill="rgba(59, 130, 246, 0.1)"
                  startIndex={brushIndexes.startIndex}
                  endIndex={brushIndexes.endIndex}
                  onChange={(newIndexes) => setBrushIndexes(newIndexes)}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                />
                
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="sessions"
                  fill="rgba(59, 130, 246, 0.1)"
                  stroke="none"
                  name="Sessions"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="conversionRate" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  name="Conversion Rate"
                  dot={{ fill: '#10b981', r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="conversions" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Orders"
                  dot={{ fill: '#3b82f6', r: 3 }}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        );

      case 'funnel':
        return (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart 
              data={data} 
              layout="vertical"
              margin={{ left: 80, right: 20, top: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
              <XAxis 
                type="number"
                stroke="rgba(148, 163, 184, 0.5)"
                tick={{ fill: 'rgba(148, 163, 184, 0.8)', fontSize: 11 }}
              />
              <YAxis 
                type="category"
                dataKey="stage" 
                stroke="rgba(148, 163, 184, 0.5)"
                tick={{ fill: 'rgba(148, 163, 184, 0.8)', fontSize: 12 }}
                width={150}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="count" 
                name="Count"
                radius={[0, 8, 8, 0]}
                animationDuration={800}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case 'source':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
              <XAxis 
                dataKey="source" 
                stroke="rgba(148, 163, 184, 0.5)"
                tick={{ fill: 'rgba(148, 163, 184, 0.8)', fontSize: 11 }}
              />
              <YAxis 
                stroke="rgba(148, 163, 184, 0.5)"
                tick={{ fill: 'rgba(148, 163, 184, 0.8)', fontSize: 11 }}
                tickFormatter={(value) => `${value.toFixed(1)}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: 'rgba(148, 163, 184, 0.8)', fontSize: '12px' }} />
              <Bar 
                dataKey="conversionRate" 
                fill="#10b981" 
                name="Conversion Rate (%)" 
                radius={[8, 8, 0, 0]}
                animationDuration={800}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'device':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
              <XAxis 
                dataKey="device" 
                stroke="rgba(148, 163, 184, 0.5)"
                tick={{ fill: 'rgba(148, 163, 184, 0.8)', fontSize: 11 }}
              />
              <YAxis 
                yAxisId="left"
                stroke="rgba(148, 163, 184, 0.5)"
                tick={{ fill: 'rgba(148, 163, 184, 0.8)', fontSize: 11 }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="rgba(148, 163, 184, 0.5)"
                tick={{ fill: 'rgba(148, 163, 184, 0.8)', fontSize: 11 }}
                tickFormatter={(value) => `${value.toFixed(1)}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: 'rgba(148, 163, 184, 0.8)', fontSize: '12px' }} />
              <Bar 
                yAxisId="left"
                dataKey="sessions" 
                fill="#3b82f6" 
                name="Sessions" 
                radius={[8, 8, 0, 0]}
                animationDuration={800}
              />
              <Bar 
                yAxisId="left"
                dataKey="conversions" 
                fill="#10b981" 
                name="Conversions" 
                radius={[8, 8, 0, 0]}
                animationDuration={800}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="conversionRate"
                stroke="#f59e0b"
                strokeWidth={3}
                name="Conv Rate (%)"
                dot={{ fill: '#f59e0b', r: 5 }}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'product':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
              <XAxis 
                type="number"
                stroke="rgba(148, 163, 184, 0.5)"
                tick={{ fill: 'rgba(148, 163, 184, 0.8)', fontSize: 11 }}
              />
              <YAxis 
                type="category"
                dataKey="productName" 
                stroke="rgba(148, 163, 184, 0.5)"
                tick={{ fill: 'rgba(148, 163, 184, 0.8)', fontSize: 11 }}
                width={180}
              />
              <Tooltip 
                content={<CustomTooltip />}
                formatter={(value) => `$${value.toLocaleString()}`}
              />
              <Bar 
                dataKey="revenue" 
                name="Revenue"
                radius={[0, 8, 8, 0]}
                animationDuration={800}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case 'visitor-type':
        return (
          <div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis 
                  dataKey="type" 
                  stroke="rgba(148, 163, 184, 0.5)"
                  tick={{ fill: 'rgba(148, 163, 184, 0.8)', fontSize: 11 }}
                />
                <YAxis 
                  yAxisId="left"
                  stroke="rgba(148, 163, 184, 0.5)"
                  tick={{ fill: 'rgba(148, 163, 184, 0.8)', fontSize: 11 }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="rgba(148, 163, 184, 0.5)"
                  tick={{ fill: 'rgba(148, 163, 184, 0.8)', fontSize: 11 }}
                  tickFormatter={(value) => `${value.toFixed(1)}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: 'rgba(148, 163, 184, 0.8)', fontSize: '12px' }} />
                <Bar 
                  yAxisId="left"
                  dataKey="sessions" 
                  fill="#3b82f6" 
                  name="Sessions" 
                  radius={[8, 8, 0, 0]}
                  animationDuration={800}
                />
                <Bar 
                  yAxisId="right"
                  dataKey="conversionRate" 
                  fill="#10b981" 
                  name="Conversion Rate (%)" 
                  radius={[8, 8, 0, 0]}
                  animationDuration={800}
                />
              </BarChart>
            </ResponsiveContainer>

            {/* Stats Below Chart */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              {data.map((item, index) => (
                <div 
                  key={index} 
                  className="p-3 rounded-lg bg-secondary/20 border border-border/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted-foreground">{item.type}</p>
                    <TrendingUp className="w-3 h-3 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{item.conversionRate.toFixed(2)}%</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.sessions.toLocaleString()} sessions</p>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Chart type not supported
          </div>
        );
    }
  };

  return (
    <div className="glass-card p-6 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold font-display text-foreground">{title}</h3>
        {type === 'timeline' && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <ZoomIn className="w-3 h-3" />
            <span>Interactive</span>
          </div>
        )}
      </div>
      {renderChart()}
    </div>
  );
};

export default ConversionChart;