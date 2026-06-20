import type { Database } from "@/lib/types/database";

type Job = Database["public"]["Tables"]["jobs"]["Row"];

export type JobSelectOption = {
  id: string;
  name: string;
};

export type JobWithRelations = Job & {
  companies: { id: string; name: string } | null;
  services: { id: string; name: string } | null;
};
