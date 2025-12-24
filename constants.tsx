
import React from 'react';

export const COLORS = {
  primary: 'indigo-600',
  secondary: 'emerald-500',
  accent: 'amber-500',
};

export const FORMATS = [
  { label: 'Best of 1', value: 1 },
  { label: 'Best of 3', value: 3 },
  { label: 'Best of 5', value: 5 },
] as const;

export const POINTS_TARGETS = [15, 21, 30] as const;
