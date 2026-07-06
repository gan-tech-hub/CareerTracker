import Link from "next/link";
import { upsertUserProfile } from "@/app/profile/actions";
import { ProfileForm } from "@/components/profile/profile-form";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function EditProfilePage() {
  const supabase = await createSupabaseServerClient();
  const { data: profile, error } = await supabase
    .from("user_profiles")
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load profile: ${error.message}`);
  }

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader
          description="希望条件、転職軸、スキル、自己PR素材を編集します。"
          title="プロフィールを編集"
        />
        <Link
          className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface"
          href="/profile"
        >
          詳細へ戻る
        </Link>
      </div>

      <Card>
        <ProfileForm action={upsertUserProfile} profile={profile} />
      </Card>
    </>
  );
}
