import { auth } from "../../../../lib/auth";
import { redirect, notFound } from "next/navigation";
import { getFleetEquipmentForEdit } from "../../actions";
import { EditEquipmentForm } from "./edit-equipment-form";

export const dynamic = "force-dynamic";

export default async function EditFleetEquipmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: equipmentId } = await params;
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    redirect("/login");
  }

  const data = await getFleetEquipmentForEdit(userId, equipmentId);
  if (!data) {
    notFound();
  }

  return <EditEquipmentForm initial={data} />;
}
