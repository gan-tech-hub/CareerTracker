import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";

type AuthenticatedShellProps = {
  children: React.ReactNode;
  userEmail?: string;
};

export function AuthenticatedShell({
  children,
  userEmail,
}: AuthenticatedShellProps) {
  return (
    <div className="min-h-screen bg-surface">
      <Header userEmail={userEmail} />
      <div className="flex min-h-[calc(100vh-4rem)]">
        <Sidebar />
        <main className="min-w-0 flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
