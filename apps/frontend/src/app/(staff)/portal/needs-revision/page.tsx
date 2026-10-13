import { getStaffNeedsRevisionAction } from "@/app/actions/staff";
import NeedsRevisionClient from "./NeedsRevisionClient";

export default async function NeedsRevisionPage() {
  const res = await getStaffNeedsRevisionAction();
  const items = res.success && res.data ? res.data.items : [];

  return <NeedsRevisionClient initialItems={items} />;
}
