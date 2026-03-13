import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";

const COMPANY_ICONS = {
  amazon: "🛒",
  google: "🔍",
  microsoft: "💻",
  meta: "👤",
};

const COMPANY_COLORS = {
  amazon: "#ff9900",
  google: "#4285f4",
  microsoft: "#00a4ef",
  meta: "#0668e1",
};

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [companies, setCompanies] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetch("/api/companies")
        .then((res) => res.json())
        .then((data) => {
          setCompanies(data.companies || []);
          setFetching(false);
        })
        .catch(() => setFetching(false));
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard - MRBInterviews</title>
      </Head>
      <div className="container">
        <div className="dashboard-header">
          <h1>Your Interview Prep</h1>
          <p>Choose a company to start tracking your progress</p>
        </div>

        {fetching ? (
          <div className="loading-screen">
            <div className="spinner" />
          </div>
        ) : (
          <div className="company-grid">
            {companies.map((company) => {
              const percent =
                company.totalQuestions > 0
                  ? Math.round(
                      (company.solvedCount / company.totalQuestions) * 100
                    )
                  : 0;

              return (
                <Link
                  href={`/company/${company.slug}`}
                  key={company.slug}
                  className="company-card"
                  style={{ "--accent": COMPANY_COLORS[company.slug] || "#6366f1" }}
                >
                  <div className="company-icon">
                    {COMPANY_ICONS[company.slug] || "📋"}
                  </div>
                  <h2 className="company-name">{company.name}</h2>
                  <div className="company-stats">
                    <span className="solved-count">
                      {company.solvedCount} / {company.totalQuestions} solved
                    </span>
                  </div>
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="progress-percent">{percent}%</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
