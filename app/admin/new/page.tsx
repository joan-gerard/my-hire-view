import { WIZARD_NEW_PATH } from "@/lib/admin/wizard-routes";
import { redirect } from "next/navigation";

/**
 * Temporary forward. The wizard lives at `/admin/wizard/new` while `/admin/new`
 * stays free for the next create flow. Remove this redirect when that page lands,
 * or when the wizard moves back here and the parked route is deleted.
 */
export default function NewApplicationPage() {
  redirect(WIZARD_NEW_PATH);
}
