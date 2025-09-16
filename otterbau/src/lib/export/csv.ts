import type { Entry } from "@/lib/schemas/zod";

export function exportCSV(entries: Entry[]) {
  const rows = entries.map(e=>{
    const p:any = e.payload;
    if (e.type==="work")   return [e.date, e.type, p.personName, p.hours, p.project??"", p.note??""].join(";");
    if (e.type==="expense")return [e.date, e.type, p.position, p.category, p.qty, p.unitPrice, p.total, p.buyer].join(";");
    return [e.date, e.type, p.position, p.category, p.amount, p.note??""].join(";");
  });
  const header = "date;type;c1;c2;c3;c4;c5;c6";
  const blob = new Blob([header+"\n"+rows.join("\n")],{type:"text/csv;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "otterbau_export.csv"; a.click();
  URL.revokeObjectURL(url);
}
