import { COMPANIES } from "@/lib/companies";
import { getUserFromReq } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Progress from "@/models/Progress";
import { readQuestionsByCompany } from "@/lib/csv";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const decoded = getUserFromReq(req);
  if (!decoded) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    await connectDB();

    const progressRecords = await Progress.find({ userId: decoded.userId });
    const progressMap = {};
    progressRecords.forEach((p) => {
      progressMap[p.companySlug] = p.solvedQuestionIds.length;
    });

    const companiesWithProgress = COMPANIES.map((company) => {
      let totalQuestions = 0;
      try {
        const questions = readQuestionsByCompany(company.slug);
        totalQuestions = questions.length;
      } catch {
        totalQuestions = 0;
      }

      return {
        slug: company.slug,
        name: company.name,
        totalQuestions,
        solvedCount: progressMap[company.slug] || 0,
      };
    });

    return res.status(200).json({ companies: companiesWithProgress });
  } catch (error) {
    console.error("Companies error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
