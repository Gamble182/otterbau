import type { Entry } from "@/lib/schemas/zod";
export function exportJSON(entries: Entry[]) {
  const blob = new Blob([JSON.stringify(entries,null,2)],{type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "otterbau_export.json"; a.click();
  URL.revokeObjectURL(url);
}
