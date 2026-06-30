import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";


interface Answer {
  id: number;
  question_id: number;
  answer_text: string;
  is_correct: boolean;
}

interface Question {
  id: number;
  question: string;
  order_index: number;
  answers: Answer[];
}

export default function QuizView() {
  const { lessonId } = useParams<{ lessonId: string }>();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const loadQuizDataStructure = async () => {
      if (!lessonId) return;
      setLoading(true);

      try {
        const { data: qData, error: qError } = await supabase
          .from("lesson_quizzes")
          .select("*")
          .eq("lesson_id", lessonId)
          .order("order_index", { ascending: true });

        if (qError || !qData || qData.length === 0) throw qError || new Error("No quiz data");

        const questionIds = qData.map((q) => q.id);

        const { data: aData, error: aError } = await supabase
          .from("lesson_quiz_answers")
          .select("*")
          .in("question_id", questionIds);

        const answersList = (aData ?? []) as Answer[];

        const compiledQuizMatrix = qData.map((question) => ({
          ...question,
          answers: answersList.filter((ans) => ans && ans.question_id === question.id),
        }));

        setQuestions(compiledQuizMatrix);
      } catch (err) {
        console.error("Administrative Exception:", err);
      } finally {
        setLoading(false);
      }
    };

    loadQuizDataStructure();
  }, [lessonId]);

  const allQuestionsAnswered = useMemo(() => {
    return Object.keys(selectedAnswers).length === questions.length && questions.length > 0;
  }, [selectedAnswers, questions]);

  const handleEvaluateQuizSubmission = async () => {
    if (!allQuestionsAnswered) {
      alert("Please specify answers for all questions.");
      return;
    }

    setIsSubmitting(true);
    let correctCount = 0;

    questions.forEach((q) => {
      const chosenAnswerId = selectedAnswers[q.id];
      const matchingAnswerObj = q.answers.find((a) => a.id === chosenAnswerId);
      if (matchingAnswerObj?.is_correct) correctCount++;
    });

    setScore(correctCount);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const userUUID = userData?.user?.id;

      if (!userUUID) return;

      await supabase.from("technician_progress").upsert(
        {
          technician_id: userUUID,
          lesson_id: lessonId,
          score: correctCount,
          max_score: questions.length,
          passed: correctCount === questions.length,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "technician_id,lesson_id" }
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="accounting-container">
        <div className="parchment-card" style={{ textAlign: "center", padding: "3rem" }}>
          Loading assessment layout templates...
        </div>
      </div>
    );
  }

  return (
    <div className="accounting-container">
      <div className="parchment-card" style={{ maxWidth: "700px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <span style={{ fontSize: "0.8rem", color: "#9b8b6f" }}>MODULE EVALUATION</span>
            <h1 className="accounting-title">Knowledge Assessment</h1>
          </div>
          <Link to={`/technician/learning/lesson/${lessonId}`} className="small-button">
            📋 Return to Lesson
          </Link>
        </div>

        <hr className="divider" />

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {questions.map((q) => (
            <div key={q.id} style={{ padding: "1.25rem", background: "#fdfbf7", border: "1px solid #d2c4a8" }}>
              <p><strong>{q.order_index}. {q.question}</strong></p>
              {q.answers.map((a) => (
                <label key={a.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    value={a.id}
                    checked={selectedAnswers[q.id] === a.id}
                    disabled={score !== null || isSubmitting}
                    onChange={() => setSelectedAnswers({ ...selectedAnswers, [q.id]: a.id })}
                  />
                  {a.answer_text}
                </label>
              ))}
            </div>
          ))}
        </div>

        <div style={{ marginTop: "2rem" }}>
          {score !== null && (
            <div style={{ padding: "0.5rem", background: "#edf7ed" }}>
              Grade: {score} / {questions.length}
            </div>
          )}
          {score === null ? (
            <button onClick={handleEvaluateQuizSubmission} disabled={!allQuestionsAnswered || isSubmitting}>
              Submit Assessment
            </button>
          ) : (
            <Link to="/technician/learning">Return to Dashboard</Link>
          )}
        </div>
      </div>
    </div>
  );
}