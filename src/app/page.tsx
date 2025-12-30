import { redirect } from "next/navigation";

export default async function Home() {
  // Auth bypassed - go directly to dashboard
  redirect("/dashboard");
}

