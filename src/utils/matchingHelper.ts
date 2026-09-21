import { Question, MatchingData, MatchingPremise, MatchingOption } from '../types';

export function getMatchingData(q: Question): MatchingData {
  if (q.matchingData && q.matchingData.premises && q.matchingData.options) {
    return q.matchingData;
  }
  
  // Fallback / migration from legacy matchingPairs
  const pairs = q.matchingPairs || [
    { id: 'm_1', left: 'Pernyataan 1', right: 'Jawaban 1' },
    { id: 'm_2', left: 'Pernyataan 2', right: 'Jawaban 2' }
  ];
  
  const premises: MatchingPremise[] = pairs.map((p, idx) => ({
    id: p.id || `prem_${idx}`,
    text: p.left,
    correctOptionId: `opt_${idx}`
  }));
  
  const options: MatchingOption[] = pairs.map((p, idx) => ({
    id: `opt_${idx}`,
    label: String.fromCharCode(65 + idx),
    text: p.right
  }));

  // Add 2 distractors (Pengecoh) as requested
  options.push({
    id: `opt_distractor_1`,
    label: String.fromCharCode(65 + options.length),
    text: 'Pilihan Pengecoh 1'
  });
  options.push({
    id: `opt_distractor_2`,
    label: String.fromCharCode(65 + options.length),
    text: 'Pilihan Pengecoh 2'
  });

  return { premises, options };
}
