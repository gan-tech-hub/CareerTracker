import Link from "next/link";
import { ProfileDetail } from "@/components/profile/profile-detail";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
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
          description="求人マッチ度や自己PR生成に使う希望条件・プロフィールを管理します。"
          title="プロフィール"
        />
        <Link
          className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          href="/profile/edit"
        >
          {profile ? "編集" : "プロフィールを登録"}
        </Link>
      </div>

      {profile ? (
        <Card>
          <ProfileDetail profile={profile} />
        </Card>
      ) : (
        <Card>
          <div className="py-10 text-center">
            <h3 className="text-lg font-semibold text-ink">
              プロフィールが未登録です
            </h3>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted">
              希望職種、希望年収、転職軸、スキルなどを登録しておくと、今後のAI機能で求人との相性や自己PRの下書きに活用できます。
            </p>
            <Link
              className="mt-6 inline-flex rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
              href="/profile/edit"
            >
              プロフィールを登録
            </Link>
          </div>
        </Card>
      )}
    </>
  );
}
