import { redirect } from "next/navigation";
import { getCurrentAdminUser } from "@/lib/current-user";
import ProfilePageClient from "./ProfilePageClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProfilePage() {
  const admin = await getCurrentAdminUser();

  if (!admin) {
    redirect("/admin/login");
  }

  return <ProfilePageClient admin={admin} />;
}
