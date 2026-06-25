import { NextResponse } from "next/server";
import { connectionBelongsToUser, getConnection, getRequestUserId, listAccessibleCustomers, publicConnection, updateConnection } from "@/lib/google-ads/server";

export const runtime = "nodejs";

export async function GET(req: Request, { params }: { params: { connectionId: string } }) {
  const userId = getRequestUserId(req);
  if (!userId) return NextResponse.json({ error: "Trackfy user required" }, { status: 401 });
  const connection = await getConnection(params.connectionId);
  if (!connection) return NextResponse.json({ error: "Connection not found" }, { status: 404 });
  if (!connectionBelongsToUser(connection, userId)) return NextResponse.json({ error: "Connection not found" }, { status: 404 });

  try {
    const accessible = await listAccessibleCustomers(connection);
    const expected = `customers/${connection.customer_id}`;
    const accessibleConfiguredCustomer = accessible.includes(expected);
    const updated = await updateConnection(connection.id, {
      status: accessibleConfiguredCustomer ? "active" : "error",
      last_error: accessibleConfiguredCustomer ? undefined : "Customer ID configurado não apareceu em customers:listAccessibleCustomers. Verifique acesso, Customer ID e MCC.",
    });
    return NextResponse.json({
      ok: accessibleConfiguredCustomer,
      accessibleCustomers: accessible,
      connection: updated ? publicConnection(updated) : publicConnection(connection),
      message: accessibleConfiguredCustomer
        ? "Google Ads conectado com sucesso."
        : "OAuth funcionou, mas o Customer ID não está acessível para esse e-mail.",
    });
  } catch (e: any) {
    const updated = await updateConnection(connection.id, { status: "error", last_error: e.message });
    return NextResponse.json({
      ok: false,
      error: e.message,
      connection: updated ? publicConnection(updated) : publicConnection(connection),
    }, { status: 400 });
  }
}
