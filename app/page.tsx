import { redirect } from "next/navigation";

export default function RootPage() {
  // Redireciona automaticamente para o dashboard dentro do Route Group (dashboard)
  redirect("/");
}
