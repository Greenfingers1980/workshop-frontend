// @ts-nocheck
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";

type Question = {
  id: number;
  question: string;
  order_index: number;
  answers: Answer[];
};

type Answer = {
  id: number;
  question_id: number;
  answer_text: string;
  is_correct: boolean;
};

const LessonQuiz: React.FC = () => {
  const { lessonId } = useParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const loadQuiz = async () => {
    // Check login
    const { data: userData } = await supabase.auth.getUser();
    console.log("Logged in user:", userData?.user);

    // Load questions
    const { data: q } = await supabase
      .from("lesson_quizzes")
      .select("*")
      .eq("lesson_id", lessonId)
      .order("order_index", { ascending: true });

    if (!q) return;

    // Load answers
    const questionIds = q.map((q) => q.id);

    const { data: a } = await supabase
      .from("lesson_quiz_answers")
      .select("*")
      .in("question_id", questionIds);

    const answers = (a ?? []) as Answer[];

    const merged = q.map((question) => ({
      ...question,
      answers: answers.filter(
        (ans) => ans && ans.question_id === question.id
      ),
    }));

    setQuestions(merged);
    setLoading(false);
  };

  loadQuiz();
}, [lessonId]);


  // ⭐ PATCHED: async + progress tracking
  const submitQuiz = async () => {
    let correct = 0;

    questions.forEach((q) => {
      const chosen = selected[q.id];
      const answer = q.answers.find((a) => a.id === chosen);
      if (answer?.is_correct) correct++;
    });

    setScore(correct);

    // ⭐ Get logged-in technician
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    if (!userId) return;

    // ⭐ Save progress (create or update)
    await supabase
      .from("technician_progress")
      .upsert(
        {
          technician_id: userId,
          lesson_id: Number(lessonId),
          score: correct,
          max_score: questions.length,
          passed: correct === questions.length,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "technician_id,lesson_id",
        }
      );
  };

  if (loading) return <p>Loading quiz…</p>;

  return (
    <div>
      <h2>Lesson Quiz</h2>

      {questions.map((q) => (
        <div key={q.id} style={{ marginBottom: "1.5rem" }}>
          <p><strong>{q.order_index}. {q.question}</strong></p>

          {q.answers.map((a) => (
            <label key={a.id} style={{ display: "block", marginLeft: "1rem" }}>
              <input
                type="radio"
                name={`q-${q.id}`}
                value={a.id}
                checked={selected[q.id] === a.id}
                onChange={() =>
                  setSelected({ ...selected, [q.id]: a.id })
                }
              />
              {a.answer_text}
            </label>
          ))}
        </div>
      ))}

      <button onClick={submitQuiz}>Submit Quiz</button>

      {score !== null && (
        <p style={{ marginTop: "1rem" }}>
          Score: {score} / {questions.length}
        </p>
      )}
    </div>
  );
};

export default LessonQuiz;
