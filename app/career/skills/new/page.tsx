import Link from "next/link";
import { createCareerSkill } from "@/app/career/skills/actions";
import { CareerSkillForm } from "@/components/career/career-skill-form";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export default function NewCareerSkillPage() {
  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader
          description="技術スキル、業務スキル、マネジメント経験などを登録します。"
          title="スキルを登録"
        />
        <Link
          className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface"
          href="/career"
        >
          一覧へ戻る
        </Link>
      </div>

      <Card>
        <CareerSkillForm action={createCareerSkill} submitLabel="登録する" />
      </Card>
    </>
  );
}
