export const COMPANIES = [
  { slug: "amazon", name: "Amazon", file: "amazon.csv" },
//   { slug: "google", name: "Google", file: "google.csv" },
//   { slug: "microsoft", name: "Microsoft", file: "microsoft.csv" },
//   { slug: "meta", name: "Meta", file: "meta.csv" },
];

export function getCompanyBySlug(slug) {
  return COMPANIES.find((c) => c.slug === slug);
}