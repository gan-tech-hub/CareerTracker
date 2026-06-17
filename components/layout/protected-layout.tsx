import { redirect } from "next/navigation";
import { AuthenticatedShell } from "@/components/layout/authenticated-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ProtectedLayoutProps = {
  children: React.ReactNode;
};

export async function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <AuthenticatedShell userEmail={user.email}>{children}</AuthenticatedShell>
  );
}
