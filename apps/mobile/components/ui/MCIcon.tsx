import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

interface MCIconProps {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function MCIcon({
  name,
  size = 20,
  color = 'currentColor',
  strokeWidth = 1.6,
}: MCIconProps) {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (name) {
    case 'home':
      return (
        <Svg {...props}>
          <Path d="M3 11l9-8 9 8M5 9v11h14V9" />
        </Svg>
      );
    case 'chart':
      return (
        <Svg {...props}>
          <Path d="M3 20h18M7 16V10M12 16V6M17 16v-4" />
        </Svg>
      );
    case 'plus':
      return (
        <Svg {...props}>
          <Path d="M12 5v14M5 12h14" />
        </Svg>
      );
    case 'wallet':
      return (
        <Svg {...props}>
          <Rect x="3" y="6" width="18" height="14" rx="2" />
          <Path d="M16 13h2M3 10h18" />
        </Svg>
      );
    case 'user':
      return (
        <Svg {...props}>
          <Circle cx="12" cy="8" r="4" />
          <Path d="M4 21c1-4 5-6 8-6s7 2 8 6" />
        </Svg>
      );
    case 'bell':
      return (
        <Svg {...props}>
          <Path d="M6 8a6 6 0 0112 0c0 7 3 8 3 8H3s3-1 3-8M10 21a2 2 0 004 0" />
        </Svg>
      );
    case 'camera':
      return (
        <Svg {...props}>
          <Path d="M3 8h4l2-3h6l2 3h4v11H3V8z" />
          <Circle cx="12" cy="13" r="4" />
        </Svg>
      );
    case 'mic':
      return (
        <Svg {...props}>
          <Rect x="9" y="3" width="6" height="12" rx="3" />
          <Path d="M5 11a7 7 0 0014 0M12 18v3" />
        </Svg>
      );
    case 'msg':
      return (
        <Svg {...props}>
          <Path d="M21 12c0 4.5-4 8-9 8a10 10 0 01-4-.8L3 21l1.5-4A7.5 7.5 0 013 12c0-4.5 4-8 9-8s9 3.5 9 8z" />
        </Svg>
      );
    case 'edit':
      return (
        <Svg {...props}>
          <Path d="M14 4l6 6L9 21H3v-6L14 4z" />
        </Svg>
      );
    case 'check':
      return (
        <Svg {...props}>
          <Path d="M4 12l5 5L20 6" />
        </Svg>
      );
    case 'x':
      return (
        <Svg {...props}>
          <Path d="M6 6l12 12M6 18L18 6" />
        </Svg>
      );
    case 'arrowR':
      return (
        <Svg {...props}>
          <Path d="M5 12h14M13 5l7 7-7 7" />
        </Svg>
      );
    case 'arrowU':
      return (
        <Svg {...props}>
          <Path d="M12 19V5M5 12l7-7 7 7" />
        </Svg>
      );
    case 'arrowD':
      return (
        <Svg {...props}>
          <Path d="M12 5v14M5 12l7 7 7-7" />
        </Svg>
      );
    case 'chevR':
      return (
        <Svg {...props}>
          <Path d="M9 6l6 6-6 6" />
        </Svg>
      );
    case 'chevD':
      return (
        <Svg {...props}>
          <Path d="M6 9l6 6 6-6" />
        </Svg>
      );
    case 'chevL':
      return (
        <Svg {...props}>
          <Path d="M15 6l-6 6 6 6" />
        </Svg>
      );
    case 'search':
      return (
        <Svg {...props}>
          <Circle cx="11" cy="11" r="7" />
          <Path d="M21 21l-4.3-4.3" />
        </Svg>
      );
    case 'filter':
      return (
        <Svg {...props}>
          <Path d="M3 6h18M7 12h10M11 18h2" />
        </Svg>
      );
    case 'sparkle':
      return (
        <Svg {...props}>
          <Path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.5 5.5l2.8 2.8M15.7 15.7l2.8 2.8M5.5 18.5l2.8-2.8M15.7 8.3l2.8-2.8" />
        </Svg>
      );
    case 'heart':
      return (
        <Svg {...props}>
          <Path d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z" />
        </Svg>
      );
    case 'split':
      return (
        <Svg {...props}>
          <Path d="M3 12h18M8 7l-5 5 5 5M16 7l5 5-5 5" />
        </Svg>
      );
    case 'wave':
      return (
        <Svg {...props}>
          <Path d="M3 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0" />
        </Svg>
      );
    case 'moon':
      return (
        <Svg {...props}>
          <Path d="M21 13A9 9 0 1111 3a7 7 0 0010 10z" />
        </Svg>
      );
    case 'send':
      return (
        <Svg {...props}>
          <Path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
        </Svg>
      );
    case 'flash':
      return (
        <Svg {...props}>
          <Path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
        </Svg>
      );
    case 'gallery':
      return (
        <Svg {...props}>
          <Rect x="3" y="3" width="18" height="18" rx="2" />
          <Circle cx="9" cy="10" r="2" />
          <Path d="M3 17l6-5 5 4 3-2 4 3" />
        </Svg>
      );
    case 'pause':
      return (
        <Svg {...props}>
          <Rect x="6" y="5" width="4" height="14" rx="1" />
          <Rect x="14" y="5" width="4" height="14" rx="1" />
        </Svg>
      );
    case 'stop':
      return (
        <Svg {...props}>
          <Rect x="5" y="5" width="14" height="14" rx="2" />
        </Svg>
      );
    case 'logout':
      return (
        <Svg {...props}>
          <Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
        </Svg>
      );
    case 'trash':
      return (
        <Svg {...props}>
          <Path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
        </Svg>
      );
    case 'copy':
      return (
        <Svg {...props}>
          <Rect x="8" y="8" width="13" height="13" rx="2" />
          <Path d="M16 8V5a2 2 0 00-2-2H5a2 2 0 00-2 2v9a2 2 0 002 2h3" />
        </Svg>
      );
    case 'share':
      return (
        <Svg {...props}>
          <Path d="M12 16V4M8 8l4-4 4 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </Svg>
      );
    case 'attach':
      return (
        <Svg {...props}>
          <Path d="M21 11l-9 9a5 5 0 01-7-7l9-9a3.5 3.5 0 015 5l-9 9a2 2 0 01-3-3l8-8" />
        </Svg>
      );
    case 'mail':
      return (
        <Svg {...props}>
          <Rect x="3" y="5" width="18" height="14" rx="2" />
          <Path d="M3 7l9 6 9-6" />
        </Svg>
      );
    case 'lock':
      return (
        <Svg {...props}>
          <Rect x="4" y="11" width="16" height="10" rx="2" />
          <Path d="M8 11V7a4 4 0 018 0v4" />
        </Svg>
      );
    case 'eye':
      return (
        <Svg {...props}>
          <Path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
          <Circle cx="12" cy="12" r="3" />
        </Svg>
      );
    case 'card':
      return (
        <Svg {...props}>
          <Rect x="3" y="6" width="18" height="13" rx="2" />
          <Path d="M3 11h18" />
        </Svg>
      );
    case 'cash':
      return (
        <Svg {...props}>
          <Rect x="2" y="6" width="20" height="13" rx="2" />
          <Circle cx="12" cy="12.5" r="3" />
        </Svg>
      );
    default:
      return (
        <Svg {...props}>
          <Circle cx="12" cy="12" r="3" />
        </Svg>
      );
  }
}
