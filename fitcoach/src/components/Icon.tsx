/**
 * Jeu d'icônes en trait fin (react-native-svg), cohérent dans toute l'app.
 * Remplace les emojis : plus sobre et « pro ». viewBox 0 0 24 24, stroke = color.
 */
import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { COLORS } from '@/constants/theme';

const ICONS: Record<string, string[]> = {
  home: ['M3 11l9-7 9 7', 'M5 10v9h4v-5h6v5h4v-9'],
  food: ['M6 3v8a2 2 0 0 0 2 2v8', 'M6 3v6', 'M10 3v6a2 2 0 0 1-2 2', 'M17 3c-1.4 1.8-1.4 5.5 0 8v10'],
  dumbbell: ['M6.5 7v10', 'M17.5 7v10', 'M4 9.5v5', 'M20 9.5v5', 'M6.5 12h11'],
  chart: ['M3 17l6-6 4 4 8-9', 'M21 6v4h-4'],
  report: ['M7 20V11', 'M12 20V4', 'M17 20v-6'],
  search: ['M11 4a7 7 0 1 0 0.001 0z', 'M20 20l-3.6-3.6'],
  clock: ['M12 4a8 8 0 1 0 0.001 0z', 'M12 8v4l3 2'],
  arrow: ['M5 12h14', 'M13 6l6 6-6 6'],
  chevLeft: ['M15 6l-6 6 6 6'],
  chevRight: ['M9 6l6 6-6 6'],
  chevDown: ['M6 9l6 6 6-6'],
  drop: ['M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z'],
  bell: ['M6 9a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7z', 'M10 20a2 2 0 0 0 4 0'],
  apple: ['M12 8c-2.5-3-8-1.5-8 4 0 4.5 4 9 8 9s8-4.5 8-9c0-5.5-5.5-7-8-4z', 'M12 8V4'],
  run: ['M14 3a2 2 0 1 0 0.001 0z', 'M13 8l-3 3 2 3 1 6', 'M10 11l-4 1', 'M12 14l4 2'],
  plus: ['M12 6v12', 'M6 12h12'],
  flame: ['M12 3c1 3 4 4 4 8a4 4 0 0 1-8 0c0-1.5.6-2.5 1-3 .5 1 1.5 1.5 1.5 1.5C10.5 7 12 5 12 3z'],
  trash: ['M4 7h16', 'M9 7V4h6v3', 'M6 7l1 13h10l1-13'],
  check: ['M5 12l4 4 10-11'],
  scale: ['M12 4v3', 'M5 7h14l2 11H3z', 'M9 7a3 3 0 0 0 6 0'],
  ruler: ['M4 8h16v8H4z', 'M8 8v3', 'M12 8v4', 'M16 8v3'],
};

export interface IconProps {
  name: keyof typeof ICONS | string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function Icon({ name, size = 22, color = COLORS.text, strokeWidth = 1.7 }: IconProps) {
  const paths = ICONS[name] ?? [];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {paths.map((d, i) => (
        <Path
          key={i}
          d={d}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </Svg>
  );
}
