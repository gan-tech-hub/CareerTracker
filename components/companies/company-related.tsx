import Link from "next/link";
import { Card } from "@/components/ui/card";

type RelatedContact = {
  id: string;
  name: string;
  organization: string | null;
  role: string;
  email: string | null;
  services: { id: string; name: string } | null;
};

type RelatedJob = {
  id: string;
  title: string;
  job_type: string | null;
  employment_type: string;
  priority: string;
  services: { id: string; name: string } | null;
};

type CompanyRelatedProps = {
  contacts: RelatedContact[];
  jobs: RelatedJob[];
};

function EmptyMessage({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-md border border-dashed border-border bg-white px-4 py-6 text-sm text-muted">
      {children}
    </p>
  );
}

export function CompanyRelated({ contacts, jobs }: CompanyRelatedProps) {
  return (
    <div className="mt-6 grid gap-6 xl:grid-cols-2">
      <Card>
        <h3 className="text-base font-semibold text-ink">関連担当者</h3>
        {contacts.length === 0 ? (
          <div className="mt-4">
            <EmptyMessage>この会社に紐づく担当者はまだありません。</EmptyMessage>
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-md border border-border">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-surface text-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">氏名</th>
                  <th className="px-3 py-2 font-medium">役割</th>
                  <th className="px-3 py-2 font-medium">所属</th>
                  <th className="px-3 py-2 font-medium">メール</th>
                  <th className="px-3 py-2 font-medium">関連サービス</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {contacts.map((contact) => (
                  <tr className="hover:bg-surface" key={contact.id}>
                    <td className="px-3 py-2 font-medium text-ink">
                      <Link className="hover:underline" href={`/contacts/${contact.id}`}>
                        {contact.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-muted">{contact.role}</td>
                    <td className="px-3 py-2 text-muted">
                      {contact.organization ?? "-"}
                    </td>
                    <td className="px-3 py-2 text-muted">
                      {contact.email ?? "-"}
                    </td>
                    <td className="px-3 py-2 text-muted">
                      {contact.services?.name ?? "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <h3 className="text-base font-semibold text-ink">関連求人</h3>
        {jobs.length === 0 ? (
          <div className="mt-4">
            <EmptyMessage>この会社に紐づく求人はまだありません。</EmptyMessage>
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-md border border-border">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-surface text-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">求人タイトル</th>
                  <th className="px-3 py-2 font-medium">サービス</th>
                  <th className="px-3 py-2 font-medium">職種</th>
                  <th className="px-3 py-2 font-medium">雇用形態</th>
                  <th className="px-3 py-2 font-medium">優先度</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {jobs.map((job) => (
                  <tr className="hover:bg-surface" key={job.id}>
                    <td className="px-3 py-2 font-medium text-ink">
                      <Link className="hover:underline" href={`/jobs/${job.id}`}>
                        {job.title}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-muted">
                      {job.services?.name ?? "-"}
                    </td>
                    <td className="px-3 py-2 text-muted">{job.job_type ?? "-"}</td>
                    <td className="px-3 py-2 text-muted">{job.employment_type}</td>
                    <td className="px-3 py-2 text-muted">{job.priority}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
