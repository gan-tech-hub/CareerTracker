import type { ReactNode } from "react";
import type { Database } from "@/lib/types/database";

type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];

type ProfileDetailProps = {
  profile: UserProfile;
};

function formatSalary(min: number | null, max: number | null) {
  if (min !== null && max !== null) {
    return `${min}万円 - ${max}万円`;
  }

  if (min !== null) {
    return `${min}万円以上`;
  }

  if (max !== null) {
    return `${max}万円まで`;
  }

  return "-";
}

function DetailItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </dt>
      <dd className="mt-2 whitespace-pre-wrap text-sm text-ink">
        {value || "-"}
      </dd>
    </div>
  );
}

export function ProfileDetail({ profile }: ProfileDetailProps) {
  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-base font-semibold text-ink">基本情報</h3>
        <dl className="mt-4 grid gap-6 md:grid-cols-2">
          <DetailItem label="表示名" value={profile.display_name} />
          <DetailItem
            label="現在の職種・役割"
            value={profile.current_position}
          />
          <DetailItem label="希望職種" value={profile.desired_role} />
          <DetailItem
            label="希望業界"
            value={profile.desired_industries}
          />
        </dl>
      </section>

      <section>
        <h3 className="text-base font-semibold text-ink">希望条件</h3>
        <dl className="mt-4 grid gap-6 md:grid-cols-2">
          <DetailItem
            label="希望年収"
            value={formatSalary(
              profile.desired_salary_min,
              profile.desired_salary_max,
            )}
          />
          <DetailItem label="希望勤務地" value={profile.desired_locations} />
          <DetailItem
            label="リモート希望"
            value={profile.remote_preference}
          />
          <DetailItem label="副業希望" value={profile.side_job_preference} />
          <div className="md:col-span-2">
            <DetailItem label="働き方" value={profile.work_style} />
          </div>
        </dl>
      </section>

      <section>
        <h3 className="text-base font-semibold text-ink">転職軸・NG条件</h3>
        <dl className="mt-4 grid gap-6 md:grid-cols-2">
          <DetailItem label="転職軸" value={profile.career_axis} />
          <DetailItem label="避けたい条件" value={profile.avoid_conditions} />
        </dl>
      </section>

      <section>
        <h3 className="text-base font-semibold text-ink">
          スキル・自己PR素材
        </h3>
        <dl className="mt-4 grid gap-6 md:grid-cols-2">
          <DetailItem label="強み" value={profile.strengths} />
          <DetailItem label="スキル" value={profile.skills} />
          <DetailItem
            label="今後伸ばしたい領域"
            value={profile.learning_interests}
          />
          <DetailItem label="自己PR素材" value={profile.self_pr} />
        </dl>
      </section>

      <section>
        <h3 className="text-base font-semibold text-ink">メモ</h3>
        <p className="mt-4 whitespace-pre-wrap text-sm text-ink">
          {profile.memo || "-"}
        </p>
      </section>
    </div>
  );
}
