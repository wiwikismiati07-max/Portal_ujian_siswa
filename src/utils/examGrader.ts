import { Exam, Question, User, ExamSubmission, ViolationLog } from '../types';
import { getMatchingData } from './matchingHelper';

export function gradeSubmission(
  exam: Exam,
  questions: Question[],
  student: User,
  answers: Record<string, any>,
  violationCount: number,
  startedAt: string,
  violationLogs: ViolationLog[] = []
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
      if (q.trueFalseItems.length === 1) {
        const item = q.trueFalseItems[0];
        const studentVal = typeof tfAns === 'object' && tfAns !== null ? tfAns[item.id] : tfAns;
        if (typeof studentVal === 'boolean' && studentVal === item.isCorrect) {
          earned = q.points;
          isCorrect = true;
        } else {
          earned = 0;
          isCorrect = false;
        }
      } else {
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
      }
    } else if (q.type === 'matching') {
      const matchingData = getMatchingData(q);
      const matchAns = studentAns || {};
      let matchCount = 0;
      matchingData.premises.forEach(premise => {
        if (matchAns[premise.id] === premise.correctOptionId) {
          matchCount++;
        }
      });
      if (matchingData.premises.length > 0) {
        earned = Math.round((matchCount / matchingData.premises.length) * q.points);
        isCorrect = matchCount === matchingData.premises.length;
      }
    } else if (q.type === 'case_study') {
      if (typeof studentAns === 'number' && studentAns === q.correctSingle) {
        earned = q.points;
        isCorrect = true;
        feedback = 'Jawaban Benar';
      } else {
        feedback = 'Jawaban Salah';
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
    studentNipOrNis: student.nipOrNis || undefined,
    answers,
    earnedScore,
    totalScore: totalMaxScore,
    percentage,
    passed,
    violationCount,
    violationLogs: [...violationLogs],
    startedAt: startedAt || new Date().toISOString(),
    submittedAt: new Date().toISOString(),
    evaluatedAnswers
  };
}
