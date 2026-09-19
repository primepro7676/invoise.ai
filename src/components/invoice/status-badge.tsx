export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PAID: "border-emerald-200 bg-emerald-50 text-emerald-800",
    UNPAID: "border-[#d8e5dc] bg-[#eaf2ec] text-[#0c2e1b]",
    PARTIALLY_PAID: "border-blue-200 bg-blue-50 text-blue-800",
    OVERDUE: "border-rose-200 bg-rose-50 text-rose-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
        styles[status] || "border-slate-200 bg-slate-100 text-slate-700"
      }`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

