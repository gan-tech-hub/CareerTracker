import Link from "next/link";
import { CareerExperienceList } from "@/components/career/career-experience-list";
import { CareerSkillList } from "@/components/career/career-skill-list";
import { PageHeader } from "@/components/ui/page-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function CareerPage() {
  const supabase = await createSupabaseServerClient();
  const [experiencesResult, skillsResult] = await Promise.all([
    supabase
      .from("career_experiences")
      .select("*")
      .order("is_current", { ascending: false })
      .order("start_date", { ascending: false, nullsFirst: false })
      .order("updated_at", { ascending: false }),
    supabase
      .from("career_skills")
      .select("*")
      .order("category", { ascending: true })
      .order("name", { ascending: true }),
  ]);

  if (experiencesResult.error) {
    throw new Error(
      `Failed to load career experiences: ${experiencesResult.error.message}`,
    );
  }

  if (skillsResult.error) {
    throw new Error(`Failed to load career skills: ${skillsResult.error.message}`);
  }

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader
          description="求人マッチ度や自己PR生成に使う職務経歴とスキルを管理します。"
          title="職務経歴・スキル"
        />
        <div className="flex items-center gap-2">
          <Link
            className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface"
            href="/career/ai-draft"
          >
            AIで自己PR・職務要約
          </Link>
          <Link
            className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface"
            href="/career/skills/new"
          >
            スキルを追加
          </Link>
          <Link
            className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            href="/career/experiences/new"
          >
            職務経歴を追加
          </Link>
        </div>
      </div>

      <div className="space-y-8">
        <section>
          <div className="mb-4 flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-ink">職務経歴</h3>
          </div>
          <CareerExperienceList experiences={experiencesResult.data ?? []} />
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-ink">スキル</h3>
          </div>
          <CareerSkillList skills={skillsResult.data ?? []} />
        </section>
      </div>
    </>
  );
}
