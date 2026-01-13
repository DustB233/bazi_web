import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import BaziClient from "./BaziClient";

export default async function AppPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");
  return <BaziClient />;
}


