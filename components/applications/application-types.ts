import type { Database } from "@/lib/types/database";

type Application = Database["public"]["Tables"]["applications"]["Row"];
type Job = Database["public"]["Tables"]["jobs"]["Row"];

export type ApplicationJobRelation = Pick<
  Job,
  "id" | "title" | "company_id" | "service_id"
> & {
  companies: { id: string; name: string } | null;
  services: { id: string; name: string } | null;
};

export type ApplicationWithRelations = Application & {
  jobs: ApplicationJobRelation | null;
};

export type ApplicationJobOption = ApplicationJobRelation;

export type ApplicationSelectOption = {
  id: string;
  name: string;
};
