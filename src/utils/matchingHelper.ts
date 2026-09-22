import { Question, MatchingData, MatchingPremise, MatchingOption } from '../types';

export function getMatchingData(q: Question): MatchingData {
  if (
    q.matchingData &&
    Array.isArray(q.matchingData.premises) &&
    q.matchingData.premises.length > 0 &&
    Array.isArray(q.matchingData.options) &&
    q.matchingData.options.length > 0
  ) {
    return q.matchingData;
  }
  
  // Fallback / migration from legacy matchingPairs
  const pairs = q.matchingPairs || [
    { id: 'm_1', left: 'Pernyataan 1', right: 'Jawaban 1' },
    { id: 'm_2', left: 'Pernyataan 2', right: 'Jawaban 2' }
  ];
  
  const premises: MatchingPremise[] = pairs.map((p, idx) => ({
    id: p.id || `prem_${idx}`,
    text: p.left || '',
    imageUrl: p.leftImageUrl,
    correctOptionId: `opt_${idx}`
  }));
  
  const options: MatchingOption[] = pairs.map((p, idx) => ({
    id: `opt_${idx}`,
    label: String.fromCharCode(65 + idx),
    text: p.right || '',
    imageUrl: p.rightImageUrl
  }));

  return { premises, options };
}

export interface MatchingPairColor {
  bg: string;
  bgLight: string;
  border: string;
  borderHover: string;
  text: string;
  badgeBg: string;
  badgeText: string;
  stroke: string;
  name: string;
}

export const MATCHING_COLORS: MatchingPairColor[] = [
  {
    bg: 'bg-emerald-100/90',
    bgLight: 'bg-emerald-50',
    border: 'border-emerald-500',
    borderHover: 'hover:border-emerald-600',
    text: 'text-emerald-950',
    badgeBg: 'bg-emerald-500',
    badgeText: 'text-white',
    stroke: '#10b981',
    name: 'Hijau'
  },
  {
    bg: 'bg-blue-100/90',
    bgLight: 'bg-blue-50',
    border: 'border-blue-500',
    borderHover: 'hover:border-blue-600',
    text: 'text-blue-950',
    badgeBg: 'bg-blue-500',
    badgeText: 'text-white',
    stroke: '#3b82f6',
    name: 'Biru'
  },
  {
    bg: 'bg-purple-100/90',
    bgLight: 'bg-purple-50',
    border: 'border-purple-500',
    borderHover: 'hover:border-purple-600',
    text: 'text-purple-950',
    badgeBg: 'bg-purple-500',
    badgeText: 'text-white',
    stroke: '#a855f7',
    name: 'Ungu'
  },
  {
    bg: 'bg-amber-100/90',
    bgLight: 'bg-amber-50',
    border: 'border-amber-500',
    borderHover: 'hover:border-amber-600',
    text: 'text-amber-950',
    badgeBg: 'bg-amber-500',
    badgeText: 'text-white',
    stroke: '#f59e0b',
    name: 'Oranye'
  },
  {
    bg: 'bg-rose-100/90',
    bgLight: 'bg-rose-50',
    border: 'border-rose-500',
    borderHover: 'hover:border-rose-600',
    text: 'text-rose-950',
    badgeBg: 'bg-rose-500',
    badgeText: 'text-white',
    stroke: '#f43f5e',
    name: 'Merah Muda'
  },
  {
    bg: 'bg-cyan-100/90',
    bgLight: 'bg-cyan-50',
    border: 'border-cyan-500',
    borderHover: 'hover:border-cyan-600',
    text: 'text-cyan-950',
    badgeBg: 'bg-cyan-500',
    badgeText: 'text-white',
    stroke: '#06b6d4',
    name: 'Cyan'
  },
  {
    bg: 'bg-indigo-100/90',
    bgLight: 'bg-indigo-50',
    border: 'border-indigo-500',
    borderHover: 'hover:border-indigo-600',
    text: 'text-indigo-950',
    badgeBg: 'bg-indigo-500',
    badgeText: 'text-white',
    stroke: '#6366f1',
    name: 'Indigo'
  },
  {
    bg: 'bg-teal-100/90',
    bgLight: 'bg-teal-50',
    border: 'border-teal-500',
    borderHover: 'hover:border-teal-600',
    text: 'text-teal-950',
    badgeBg: 'bg-teal-500',
    badgeText: 'text-white',
    stroke: '#14b8a6',
    name: 'Teal'
  }
];

export function getMatchingColor(index: number): MatchingPairColor {
  return MATCHING_COLORS[index % MATCHING_COLORS.length];
}
