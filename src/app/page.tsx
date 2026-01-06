import { auth } from "@/auth";
import EditRoleMobile from "@/components/EditRoleMobile";
import Nav from "@/components/Nav";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import { redirect } from "next/navigation";

export default async function Home() {
  await connectDb();
  const session = await auth();
  const user = await User.findById(session?.user?.id);
  console.log(user);

  if (!user) {
    redirect("/login");
  }

  const incomplete =
    !user.mobile || !user.role || (!user.mobile && user.role === "user");

  if (incomplete) {
    return <EditRoleMobile />;
  }

  return (
    <>
      <Nav user={user} />
    </>
  );
}
