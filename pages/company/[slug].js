import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";

const DIFFICULTY_COLORS = {
  Easy: "#00b8a3",
  Medium: "#ffc01e",
  Hard: "#ff375f",
};

export default function CompanyQuestionsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { slug } = router.query;

  const [company, setCompany] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [solvedCount, setSolvedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [fetching, setFetching] = useState(true);
  const [filter, setFilter] = useState("all"); // all, solved, unsolved
  const [diffFilter, setDiffFilter] = useState("all"); // all, Easy, Medium, Hard

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && slug) {
      fetch(`/api/companies/${slug}/questions`)
        .then((res) => res.json())
        .then((data) => {
          setCompany(data.company);
          setQuestions(data.questions || []);
          setSolvedCount(data.solvedCount || 0);
          setTotalCount(data.totalCount || 0);
          setFetching(false);
        })
        .catch(() => setFetching(false));
    }
  }, [user, slug]);

  const toggleSolved = async (questionId, currentSolved) => {
    const newSolved = !currentSolved;

    // Optimistic update
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, solved: newSolved } : q))
    );
    setSolvedCount((prev) => (newSolved ? prev + 1 : prev - 1));

    try {
      const res = await fetch(`/api/progress/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, solved: newSolved }),
      });

      if (!res.ok) {
        // Revert on failure
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === questionId ? { ...q, solved: currentSolved } : q
          )
        );
        setSolvedCount((prev) => (newSolved ? prev - 1 : prev + 1));
      }
    } catch {
      // Revert on failure
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId ? { ...q, solved: currentSolved } : q
        )
      );
      setSolvedCount((prev) => (newSolved ? prev - 1 : prev + 1));
    }
  };

  const filteredQuestions = questions.filter((q) => {
    if (filter === "solved" && !q.solved) return false;
    if (filter === "unsolved" && q.solved) return false;
    if (diffFilter !== "all" && q.difficulty !== diffFilter) return false;
    return true;
  });

  const percent =
    totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;

  if (loading || !user || fetching) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="container">
        <p>Company not found.</p>
        <Link href="/dashboard">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{company.name} Questions - MRBInterviews</title>
      </Head>
      <div className="container">
        <Link href="/dashboard" className="back-link">
          ← Back to Dashboard
        </Link>

        <div className="company-header">
          <h1>{company.name} Questions</h1>
          <div className="progress-summary">
            <span className="progress-text">
              {solvedCount} / {totalCount} solved ({percent}%)
            </span>
            <div className="progress-bar-container progress-bar-lg">
              <div
                className="progress-bar-fill"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="filters">
          <div className="filter-group">
            <label>Status:</label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="solved">Solved</option>
              <option value="unsolved">Unsolved</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Difficulty:</label>
            <select
              value={diffFilter}
              onChange={(e) => setDiffFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>

        <div className="questions-table-wrapper">
          <table className="questions-table">
            <thead>
              <tr>
                <th className="th-check">Done</th>
                <th className="th-id">#</th>
                <th className="th-title">Title</th>
                <th className="th-diff">Difficulty</th>
                <th className="th-acc">Acceptance</th>
                <th className="th-freq">Frequency</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuestions.map((q) => (
                <tr key={q.id} className={q.solved ? "row-solved" : ""}>
                  <td className="td-check">
                    <input
                      type="checkbox"
                      checked={q.solved}
                      onChange={() => toggleSolved(q.id, q.solved)}
                      className="question-checkbox"
                    />
                  </td>
                  <td className="td-id">{q.id}</td>
                  <td className="td-title">
                    <a
                      href={q.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="question-link"
                    >
                      {q.title}
                    </a>
                  </td>
                  <td className="td-diff">
                    <span
                      className="difficulty-badge"
                      style={{
                        color: DIFFICULTY_COLORS[q.difficulty] || "#888",
                      }}
                    >
                      {q.difficulty}
                    </span>
                  </td>
                  <td className="td-acc">{q.acceptancePercent}</td>
                  <td className="td-freq">{q.frequencyPercent}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredQuestions.length === 0 && (
            <div className="empty-state">No questions match your filters.</div>
          )}
        </div>
      </div>
    </>
  );
}
