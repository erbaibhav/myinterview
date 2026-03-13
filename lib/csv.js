import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { getCompanyBySlug } from "./companies";

export function readQuestionsByCompany(companySlug) {
  const company = getCompanyBySlug(companySlug);
  if (!company) throw new Error("Invalid company");

  const filePath = path.join(process.cwd(), "data", company.file);
  const fileContent = fs.readFileSync(filePath, "utf-8");

  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  return records.map((row) => ({
    id: String(row.ID),
    url: row.URL,
    title: row.Title,
    difficulty: row.Difficulty,
    acceptancePercent: row["Acceptance %"],
    frequencyPercent: row["Frequency %"],
  }));
}