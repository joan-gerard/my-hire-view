import { wizardEditPath } from "@/lib/admin/wizard-routes";
import { redirect } from "next/navigation";

/**
 * Temporary forward. The wizard lives at `/admin/wizard/edit/[id]` while
 * `/admin/edit/[id]` stays free for the next edit flow.
 */
export default async function EditApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(wizardEditPath(id));
}
