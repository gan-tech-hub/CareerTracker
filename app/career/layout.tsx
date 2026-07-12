import { ProtectedLayout } from "@/components/layout/protected-layout";

export default function CareerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}
