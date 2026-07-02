/** Public URL prefix for the Next.js content dashboard (nginx: /crm/). */
export const CRM_BASE = "/crm";

export function crmPath(subpath = ""): string {
  if (!subpath) return CRM_BASE;
  return `${CRM_BASE}${subpath.startsWith("/") ? subpath : `/${subpath}`}`;
}
