import { auth } from "@/auth";
import AdminDashboard from "@/components/AdminDashboard";
import DeliveryBoy from "@/components/DeliveryBoy";
import EditRoleMobile from "@/components/EditRoleMobile";
import GeoUpdater from "@/components/GeoUpdater";
import Nav from "@/components/Nav";
import UserDashboard from "@/components/UserDashboard";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import { redirect } from "next/navigation";

export default async function Home() {
  await connectDb();
  const session = await auth();
  const user = await User.findById(session?.user?.id);

  if (!user) {
    redirect("/login");
  }

  const incomplete =
    !user.mobile || !user.role || (!user.mobile && user.role === "user");

  if (incomplete) {
    return <EditRoleMobile />;
  }

  const plainUser = JSON.parse(JSON.stringify(user));

  return (
    <>
      <Nav user={plainUser} />
      <GeoUpdater userId={plainUser?._id} />
      {user.role === "user" ? <UserDashboard /> : user.role === "admin" ? <AdminDashboard /> : <DeliveryBoy />}
    </>
  );
}
