import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";

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
    <div
      className="flex min-h-screen"
      style={{ background: "var(--admin-bg)" }}
    >
      {/* Fixed sidebar */}
      <AdminSidebar userEmail={user.email ?? ""} />

      {/* Main content column — offset by sidebar width on desktop */}
      <div className="flex min-h-screen flex-1 flex-col lg:pl-60">

        {/* Sticky topbar with dark-mode toggle */}
        <AdminTopbar />

        {/* Page content */}
        <main className="flex-1">
          <div className="animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
