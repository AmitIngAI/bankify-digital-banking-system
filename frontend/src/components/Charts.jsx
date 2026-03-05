import React from 'react';
import styles from '../styles/Components.module.css';

// Simple Bar Chart Component
export const BarChart = ({ data, height = 200 }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className={styles.barChart} style={{ height }}>
      <div className={styles.barChartBars}>
        {data.map((item, index) => (
          <div key={index} className={styles.barChartItem}>
            <div 
              className={styles.bar}
              style={{ 
                height: `${(item.value / maxValue) * 100}%`,
                background: item.color || 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)'
              }}
            >
              <span className={styles.barValue}>₹{(item.value / 1000).toFixed(0)}K</span>
            </div>
            <span className={styles.barLabel}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Donut Chart Component
export const DonutChart = ({ data, size = 200 }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let cumulativePercent = 0;

  const getCoordinatesForPercent = (percent) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  return (
    <div className={styles.donutChart}>
      <svg viewBox="-1.2 -1.2 2.4 2.4" style={{ width: size, height: size }}>
        {data.map((item, index) => {
          const percent = item.value / total;
          const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
          cumulativePercent += percent;
          const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
          const largeArcFlag = percent > 0.5 ? 1 : 0;

          const pathData = [
            `M ${startX} ${startY}`,
            `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
            `L 0 0`,
          ].join(' ');

          return (
            <path
              key={index}
              d={pathData}
              fill={item.color}
              stroke="white"
              strokeWidth="0.02"
            />
          );
        })}
        <circle cx="0" cy="0" r="0.6" fill="white" />
      </svg>
      <div className={styles.donutCenter}>
        <span className={styles.donutTotal}>₹{(total / 1000).toFixed(0)}K</span>
        <span className={styles.donutLabel}>Total</span>
      </div>
      <div className={styles.donutLegend}>
        {data.map((item, index) => (
          <div key={index} className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: item.color }}></span>
            <span className={styles.legendLabel}>{item.label}</span>
            <span className={styles.legendValue}>{((item.value / total) * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Line Chart Component
export const LineChart = ({ data, height = 200 }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((item.value - minValue) / range) * 80 - 10;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,100 ${points} 100,100`;

  return (
    <div className={styles.lineChart} style={{ height }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#667eea" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#667eea" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon fill="url(#lineGradient)" points={areaPoints} />
        <polyline
          fill="none"
          stroke="#667eea"
          strokeWidth="2"
          points={points}
          vectorEffect="non-scaling-stroke"
        />
        {data.map((item, index) => {
          const x = (index / (data.length - 1)) * 100;
          const y = 100 - ((item.value - minValue) / range) * 80 - 10;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="3"
              fill="white"
              stroke="#667eea"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>
      <div className={styles.lineChartLabels}>
        {data.map((item, index) => (
          <span key={index}>{item.label}</span>
        ))}
      </div>
    </div>
  );
};