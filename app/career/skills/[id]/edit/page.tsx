import Link from "next/link";
import { notFound } from "next/navigation";
import { updateCareerSkill } from "@/app/career/skills/actions";
import { CareerSkillForm } from "@/components/career/career-skill-form";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type EditCareerSkillPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditCareerSkillPage({
  params,
}: EditCareerSkillPageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: skill, error } = await supabase
    .from("career_skills")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !skill) {
    notFound();
  }

  const updateCareerSkillWithId = updateCareerSkill.bind(null, skill.id);

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader
          description="スキルの登録内容を編集します。"
          title="スキルを編集"
        />
        <Link
          className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface"
          href="/career"
        >
          一覧へ戻る
        </Link>
      </div>

      <Card>
        <CareerSkillForm
          action={updateCareerSkillWithId}
          skill={skill}
          submitLabel="更新する"
        />
      </Card>
    </>
  );
}
