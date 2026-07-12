import Link from "next/link";
import { createCareerExperience } from "@/app/career/experiences/actions";
import { CareerExperienceForm } from "@/components/career/career-experience-form";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export default function NewCareerExperiencePage() {
  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader
          description="職務経歴を登録します。担当業務、実績、使用技術を整理しておくとAI機能で活用しやすくなります。"
          title="職務経歴を登録"
        />
        <Link
          className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface"
          href="/career"
        >
          一覧へ戻る
        </Link>
      </div>

      <Card>
        <CareerExperienceForm
          action={createCareerExperience}
          submitLabel="登録する"
        />
      </Card>
    </>
  );
}
