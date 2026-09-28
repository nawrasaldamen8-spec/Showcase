export function formatCareerDateRange(
  startDate: string,
  endDate: string | null | undefined,
  isCurrent?: boolean
): string {
  const end = isCurrent ? "Present" : endDate || "Present";
  return `${startDate} \u2014 ${end}`;
}
