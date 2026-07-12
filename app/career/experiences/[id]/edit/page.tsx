import Link from "next/link";
import { notFound } from "next/navigation";
import { updateCareerExperience } from "@/app/career/experiences/actions";
import { CareerExperienceForm } from "@/components/career/career-experience-form";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type EditCareerExperiencePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditCareerExperiencePage({
  params,
}: EditCareerExperiencePageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: experience, error } = await supabase
    .from("career_experiences")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !experience) {
    notFound();
  }

  const updateCareerExperienceWithId = updateCareerExperience.bind(
    null,
    experience.id,
  );

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader
          description="職務経歴の登録内容を編集します。"
          title="職務経歴を編集"
        />
        <Link
          className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface"
          href={`/career/experiences/${experience.id}`}
        >
          詳細へ戻る
        </Link>
      </div>

      <Card>
        <CareerExperienceForm
          action={updateCareerExperienceWithId}
          experience={experience}
          submitLabel="更新する"
        />
      </Card>
    </>
  );
}
