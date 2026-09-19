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
    <div className="relative min-h-screen bg-[#f4f7f4] text-[#0c2317] antialiased selection:bg-[#0c2e1b]/20 selection:text-[#0c2e1b]">
      {/* Subtle ambient lighting for light canvas */}
      <div className="pointer-events-none fixed -left-40 top-0 h-[36rem] w-[36rem] rounded-full bg-emerald-500/[0.04] blur-[160px]" />
      <div className="pointer-events-none fixed right-0 top-20 h-[36rem] w-[36rem] rounded-full bg-amber-500/[0.03] blur-[180px]" />

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
