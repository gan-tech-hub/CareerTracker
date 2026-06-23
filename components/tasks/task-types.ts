import type { Database } from "@/lib/types/database";

type Task = Database["public"]["Tables"]["tasks"]["Row"];
type Application = Database["public"]["Tables"]["applications"]["Row"];
type Job = Database["public"]["Tables"]["jobs"]["Row"];

export type TaskApplicationRelation = Pick<Application, "id" | "status"> & {
  jobs:
    | (Pick<Job, "id" | "title" | "company_id" | "service_id"> & {
        companies: { id: string; name: string } | null;
        services: { id: string; name: string } | null;
      })
    | null;
};

export type TaskWithRelations = Task & {
  applications: TaskApplicationRelation | null;
};

export type TaskApplicationOption = TaskApplicationRelation;

export type TaskSelectOption = {
  id: string;
  name: string;
};
