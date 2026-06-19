import type { Database } from "@/lib/types/database";

type Contact = Database["public"]["Tables"]["contacts"]["Row"];

export type ContactWithRelations = Contact & {
  companies: { id: string; name: string } | null;
  services: { id: string; name: string } | null;
};
