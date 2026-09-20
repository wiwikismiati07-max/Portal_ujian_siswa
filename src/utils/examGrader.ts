import { Exam, Question, User, ExamSubmission } from '../types';

export function gradeSubmission(
  exam: Exam,
  questions: Question[],
  student: User,
  answers: Record<string, any>,
  violationCount: number,
  startedAt: string
): ExamSubmission {
  let earnedScore = 0;
  const evaluatedAnswers: ExamSubmission['evaluatedAnswers'] = {};

  const totalMaxScore = questions.reduce((acc, q) => acc + (q.points || 0), 0) || exam.totalScore || 100;

  for (const q of questions) {
    const studentAns = answers[q.id];
    let earned = 0;
    let isCorrect = false;
    let feedback = '';

    if (q.type === 'single_choice') {
      if (typeof studentAns === 'number' && studentAns === q.correctSingle) {
        earned = q.points;
        isCorrect = true;
      }
    } else if (q.type === 'multiple_choice') {
      const correctArr = (q.correctMulti || []).slice().sort();
      const studentArr = Array.isArray(studentAns) ? studentAns.slice().sort() : [];
      if (
        correctArr.length > 0 &&
        correctArr.length === studentArr.length &&
        correctArr.every((val, index) => val === studentArr[index])
      ) {
        earned = q.points;
        isCorrect = true;
      } else if (correctArr.length > 0 && studentArr.length > 0) {
        // Partial credit if some are correct without wrong selections
        const correctPicks = studentArr.filter(i => correctArr.includes(i)).length;
        const wrongPicks = studentArr.filter(i => !correctArr.includes(i)).length;
        if (wrongPicks === 0 && correctPicks > 0) {
          earned = Math.round((correctPicks / correctArr.length) * q.points);
          isCorrect = false;
        }
      }
    } else if (q.type === 'true_false' && q.trueFalseItems) {
      const tfAns = studentAns || {};
      let correctCount = 0;
      q.trueFalseItems.forEach(item => {
        if (tfAns[item.id] === item.isCorrect) {
          correctCount++;
        }
      });
      if (q.trueFalseItems.length > 0) {
        earned = Math.round((correctCount / q.trueFalseItems.length) * q.points);
        isCorrect = correctCount === q.trueFalseItems.length;
      }
    } else if (q.type === 'matching' && q.matchingPairs) {
      const matchAns = studentAns || {};
      let matchCount = 0;
      q.matchingPairs.forEach(pair => {
        if (matchAns[pair.id] === pair.right) {
          matchCount++;
        }
      });
      if (q.matchingPairs.length > 0) {
        earned = Math.round((matchCount / q.matchingPairs.length) * q.points);
        isCorrect = matchCount === q.matchingPairs.length;
      }
    } else if (q.type === 'case_study') {
      // Essay / Case Study: check keywords if available, or give initial credit for thoughtful essay
      const essayText = typeof studentAns === 'string' ? studentAns.trim() : '';
      if (essayText.length > 0) {
        if (q.caseKeywords && q.caseKeywords.length > 0) {
          const lowerText = essayText.toLowerCase();
          const matchedKeywords = q.caseKeywords.filter(kw => lowerText.includes(kw.toLowerCase()));
          const keywordRatio = matchedKeywords.length / q.caseKeywords.length;
          earned = Math.max(Math.round(keywordRatio * q.points), Math.round(q.points * 0.5));
          isCorrect = keywordRatio >= 0.7;
          feedback = `Terdeteksi ${matchedKeywords.length}/${q.caseKeywords.length} kata kunci esensial.`;
        } else {
          // Default baseline score for completed analysis
          earned = essayText.split(/\s+/).length >= 15 ? q.points : Math.round(q.points * 0.6);
          isCorrect = earned === q.points;
        }
      }
    }

    earnedScore += earned;
    if (evaluatedAnswers) {
      evaluatedAnswers[q.id] = {
        earned,
        max: q.points,
        isCorrect,
        feedback
      };
    }
  }

  const percentage = Math.round((earnedScore / totalMaxScore) * 100);
  const passingGrade = exam.passingScore || 75;
  const passed = percentage >= passingGrade;

  return {
    id: 'sub_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    examId: exam.id,
    examTitle: exam.title,
    subjectName: exam.subjectName,
    studentId: student.id,
    studentName: student.name,
    studentClass: student.classGroup || '',
    answers,
    earnedScore,
    totalScore: totalMaxScore,
    percentage,
    passed,
    violationCount,
    startedAt,
    submittedAt: new Date().toISOString(),
    evaluatedAnswers
  };
}
