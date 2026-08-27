import RoleGuard from "@/components/auth/RoleGuard";

export default function KasirLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={["kasir"]}>{children}</RoleGuard>;
}
