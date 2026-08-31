import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata = {
  title: { template: "%s — Admin", default: "Admin Panel" },
};

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-[#0f0e0c] text-white">
      <AdminSidebar userEmail={user.email ?? ""} />
      <main className="flex-1 overflow-auto lg:pl-64">
        <div className="min-h-screen">{children}</div>
      </main>
    </div>
  );
}
