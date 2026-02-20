import { useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush, ZoomInIcon } from 'recharts';
import { ZoomIn, ZoomOut, Move } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const TrafficChart = ({ type, data, title }) => {
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
              {entry.name}: <span className="font-semibold">{entry.value}</span>
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
            {/* Zoom/Pan Instructions */}
            <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
              <Move className="w-3 h-3" />
              <span>Use the slider below to zoom and pan through the data</span>
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
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
                  stroke="rgba(148, 163, 184, 0.5)"
                  tick={{ fill: 'rgba(148, 163, 184, 0.8)', fontSize: 11 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ color: 'rgba(148, 163, 184, 0.8)', fontSize: '12px' }}
                  iconType="line"
                />
                
                {/* Brush for zoom and pan */}
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
                
                <Line 
                  type="monotone" 
                  dataKey="sessions" 
                  stroke="#3b82f6" 
                  strokeWidth={2.5}
                  name="Total Sessions"
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="desktop" 
                  stroke="#10b981" 
                  strokeWidth={2.5}
                  name="Desktop"
                  dot={{ fill: '#10b981', r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="mobile" 
                  stroke="#f59e0b" 
                  strokeWidth={2.5}
                  name="Mobile"
                  dot={{ fill: '#f59e0b', r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
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
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ color: 'rgba(148, 163, 184, 0.8)', fontSize: '12px' }}
              />
              <Bar 
                dataKey="sessions" 
                fill="#3b82f6" 
                name="Sessions" 
                radius={[8, 8, 0, 0]}
                animationDuration={800}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'device':
        const RADIAN = Math.PI / 180;
        const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, device, sessions }) => {
          const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
          const x = cx + radius * Math.cos(-midAngle * RADIAN);
          const y = cy + radius * Math.sin(-midAngle * RADIAN);

          return (
            <text 
              x={x} 
              y={y} 
              fill="white" 
              textAnchor={x > cx ? 'start' : 'end'} 
              dominantBaseline="central"
              className="text-sm font-semibold"
            >
              {`${(percent * 100).toFixed(0)}%`}
            </text>
          );
        };

        return (
          <div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="sessions"
                  nameKey="device"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  labelLine={false}
                  label={renderCustomizedLabel}
                  animationDuration={800}
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]}
                      stroke="rgba(0,0,0,0.2)"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ color: 'rgba(148, 163, 184, 0.8)', fontSize: '12px' }}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Device Stats Below Chart */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              {data.map((item, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20 border border-border/50"
                >
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">{item.device}</p>
                    <p className="text-lg font-semibold text-foreground">{item.sessions.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'campaign':
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
                dataKey="campaign" 
                stroke="rgba(148, 163, 184, 0.5)"
                tick={{ fill: 'rgba(148, 163, 184, 0.8)', fontSize: 11 }}
                width={100}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="sessions" 
                fill="#8b5cf6" 
                name="Sessions" 
                radius={[0, 8, 8, 0]}
                animationDuration={800}
              />
            </BarChart>
          </ResponsiveContainer>
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

export default TrafficChart;