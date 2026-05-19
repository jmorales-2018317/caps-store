import { AccountSectionShell } from "@/components/cart/AccountSectionShell";

export default function AccountLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <AccountSectionShell>{children}</AccountSectionShell>;
}
