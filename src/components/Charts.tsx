import React from 'react';

interface ChartDataPoint {
  month: string;
  value: number;
}

interface AreaChartProps {
  data: ChartDataPoint[];
  height?: number;
}

export const RevenueAreaChart: React.FC<AreaChartProps> = ({ data, height = 200 }) => {
  const padding = { top: 20, right: 20, bottom: 30, left: 50 };
  const width = 500;
  
  const values = data.map(d => d.value);
  const maxValue = Math.max(...values, 1000) * 1.1; // Add 10% breathing room
  const minValue = 0;

  const points = data.map((d, index) => {
    const x = padding.left + (index / (data.length - 1)) * (width - padding.left - padding.right);
    const y = height - padding.bottom - ((d.value - minValue) / (maxValue - minValue)) * (height - padding.top - padding.bottom);
    return { x, y, label: d.month, val: d.value };
  });

  const pathD = points.reduce((acc, p, i) => {
    return acc + `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y} `;
  }, '');

  const areaD = pathD
    ? `${pathD} L ${points[points.length - 1].x} ${height - padding.bottom} L ${points[0].x} ${height - padding.bottom} Z`
    : '';

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = padding.top + ratio * (height - padding.top - padding.bottom);
          const val = maxValue - ratio * (maxValue - minValue);
          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#e2e8f0"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <text
                x={padding.left - 8}
                y={y + 4}
                textAnchor="end"
                fontSize="10px"
                fontWeight="600"
                fill="var(--neutral-muted)"
              >
                R$ {Math.round(val)}
              </text>
            </g>
          );
        })}

        {/* Area Fill */}
        {areaD && <path d={areaD} fill="url(#chartGrad)" />}

        {/* Line */}
        {pathD && (
          <path
            d={pathD}
            fill="none"
            stroke="var(--primary)"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Dots & Labels */}
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r={5}
              fill="var(--white)"
              stroke="var(--primary)"
              strokeWidth={3}
            />
            {/* Value above dot on hover/static */}
            <text
              x={p.x}
              y={p.y - 10}
              textAnchor="middle"
              fontSize="10px"
              fontWeight="700"
              fill="var(--neutral-dark)"
            >
              R$ {p.val}
            </text>
            {/* Month Label */}
            <text
              x={p.x}
              y={height - padding.bottom + 18}
              textAnchor="middle"
              fontSize="11px"
              fontWeight="600"
              fill="var(--neutral-muted)"
            >
              {p.label}
            </text>
          </g>
        ))}

        {/* X Axis */}
        <line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          stroke="#cbd5e1"
          strokeWidth={1.5}
        />
      </svg>
    </div>
  );
};

interface BarChartProps {
  data: Array<{ name: string; count: number; value: number }>;
}

export const TopServicesBarChart: React.FC<BarChartProps> = ({ data }) => {
  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      {data.map((item, index) => {
        const percentage = (item.count / maxCount) * 100;
        
        return (
          <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'between', fontSize: '0.85rem', fontWeight: 600 }}>
              <span className="text-muted" style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '70%' }}>
                {item.name}
              </span>
              <span className="font-bold text-neutral-dark">
                {item.count} agend. (R$ {item.value.toFixed(2)})
              </span>
            </div>
            
            <div style={{ width: '100%', height: '12px', backgroundColor: '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${percentage}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
                  borderRadius: '6px',
                  transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
            </div>
          </div>
        );
      })}
      
      {data.length === 0 && (
        <div className="text-center text-muted" style={{ padding: '2rem' }}>
          Sem agendamentos registrados no momento.
        </div>
      )}
    </div>
  );
};
