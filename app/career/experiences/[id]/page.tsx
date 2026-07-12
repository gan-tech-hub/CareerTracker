import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteCareerExperience } from "@/app/career/experiences/actions";
import { CareerExperienceDetail } from "@/components/career/career-experience-detail";
import { DeleteCareerExperienceButton } from "@/components/career/delete-career-experience-button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type CareerExperienceDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CareerExperienceDetailPage({
  params,
}: CareerExperienceDetailPageProps) {
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

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader
          description="職務経歴の詳細を確認します。"
          title={experience.company_name}
        />
        <div className="flex items-center gap-2">
          <Link
            className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface"
            href="/career"
          >
            一覧へ戻る
          </Link>
          <Link
            className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            href={`/career/experiences/${experience.id}/edit`}
          >
            編集
          </Link>
        </div>
      </div>

      <Card>
        <CareerExperienceDetail experience={experience} />
      </Card>

      <Card className="mt-6 border-red-200">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-ink">削除</h3>
            <p className="mt-1 text-sm text-muted">
              この職務経歴を削除します。削除後は元に戻せません。
            </p>
          </div>
          <form action={deleteCareerExperience}>
            <input name="id" type="hidden" value={experience.id} />
            <DeleteCareerExperienceButton
              companyName={experience.company_name}
            />
          </form>
        </div>
      </Card>
    </>
  );
}
