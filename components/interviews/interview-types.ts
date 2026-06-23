import type { Database } from "@/lib/types/database";

type Interview = Database["public"]["Tables"]["interviews"]["Row"];
type Application = Database["public"]["Tables"]["applications"]["Row"];
type Job = Database["public"]["Tables"]["jobs"]["Row"];

export type InterviewApplicationRelation = Pick<
  Application,
  "id" | "status"
> & {
  jobs:
    | (Pick<Job, "id" | "title" | "company_id" | "service_id"> & {
        companies: { id: string; name: string } | null;
        services: { id: string; name: string } | null;
      })
    | null;
};

export type InterviewWithRelations = Interview & {
  applications: InterviewApplicationRelation | null;
};

export type InterviewApplicationOption = InterviewApplicationRelation;

export type InterviewSelectOption = {
  id: string;
  name: string;
};
