import React from 'react';
import { Text, type TextProps } from 'react-native';

import { useTheme } from '../../hooks/useTheme';

export function MCText({ style, ...props }: TextProps) {
  const { t } = useTheme();
  return <Text style={[{ fontFamily: 'System', color: t.text }, style]} {...props} />;
}
