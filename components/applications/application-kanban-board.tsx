import { APPLICATION_STATUSES } from "@/lib/constants/applications";
import type { ApplicationWithRelations } from "./application-types";
import {
  ApplicationKanbanCard,
  type RelatedKanbanInterview,
  type RelatedKanbanTask,
} from "./application-kanban-card";

type ApplicationKanbanBoardProps = {
  applications: ApplicationWithRelations[];
  interviewsByApplicationId: Record<string, RelatedKanbanInterview[]>;
  tasksByApplicationId: Record<string, RelatedKanbanTask[]>;
};

export function ApplicationKanbanBoard({
  applications,
  interviewsByApplicationId,
  tasksByApplicationId,
}: ApplicationKanbanBoardProps) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="grid min-w-[1760px] grid-cols-11 gap-3">
        {APPLICATION_STATUSES.map((status) => {
          const statusApplications = applications.filter(
            (application) => application.status === status,
          );

          return (
            <section
              className="min-h-[520px] rounded-md border border-border bg-white p-3 shadow-panel"
              key={status}
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="truncate text-sm font-semibold text-ink">
                  {status}
                </h3>
                <span className="rounded-md bg-surface px-2 py-1 text-xs text-muted">
                  {statusApplications.length}
                </span>
              </div>

              {statusApplications.length === 0 ? (
                <div className="rounded-md border border-dashed border-border px-3 py-6 text-center text-xs text-muted">
                  カードはありません
                </div>
              ) : (
                <div className="space-y-3">
                  {statusApplications.map((application) => (
                    <ApplicationKanbanCard
                      application={application}
                      interviews={interviewsByApplicationId[application.id] ?? []}
                      key={application.id}
                      tasks={tasksByApplicationId[application.id] ?? []}
                    />
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
