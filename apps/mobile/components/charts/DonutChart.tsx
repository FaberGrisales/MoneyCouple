import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { useTheme } from '../../hooks/useTheme';

interface DonutSlice {
  key: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutSlice[];
  size?: number;
  stroke?: number;
}

export function DonutChart({ data, size = 180, stroke = 26 }: DonutChartProps) {
  const { dark } = useTheme();
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  let acc = 0;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={dark ? '#1E2126' : '#F0F0F4'}
          strokeWidth={stroke}
        />
        {data.map((d, i) => {
          const len = (d.value / total) * C;
          const offset = -(acc / C) * C;
          acc += len;
          return (
            <Circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={d.color}
              strokeWidth={stroke}
              strokeDasharray={`${len} ${C - len}`}
              strokeDashoffset={offset + C * 0.25}
              strokeLinecap="butt"
            />
          );
        })}
      </Svg>
    </View>
  );
}
