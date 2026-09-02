import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="relative min-h-screen bg-[#080b11] text-slate-100 antialiased selection:bg-amber-500/30 selection:text-amber-200">
      {/* Subtle ambient lighting for glassy refraction */}
      <div className="pointer-events-none fixed -left-40 top-0 h-[36rem] w-[36rem] rounded-full bg-amber-500/5 blur-[160px]" />
      <div className="pointer-events-none fixed right-0 top-20 h-[36rem] w-[36rem] rounded-full bg-blue-500/5 blur-[180px]" />
      <div className="pointer-events-none fixed bottom-0 left-1/3 h-[32rem] w-[32rem] rounded-full bg-emerald-500/5 blur-[160px]" />

      <div className="relative z-10 flex min-h-screen">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
          <Topbar userName={session.user?.name || session.user?.email || "Admin"} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
