import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { signOut } from "@/auth";
import { ShieldCheck, Users, LogOut } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    redirect("/overview");
  }

  return (
    <div className="min-h-screen bg-[#F4F4F6] flex flex-col">
      <header className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2 font-bold">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <span>Administration zdmsFacture</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/admin" className="flex items-center gap-1.5 hover:text-primary transition-colors">
              <Users className="w-4 h-4" />
              <span>Utilisateurs</span>
            </Link>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button
                type="submit"
                className="flex items-center gap-1.5 hover:text-rose-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">{children}</main>
    </div>
  );
}
