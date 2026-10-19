import { getPublishedBranches } from "@/lib/branches-server";
import { whatsappHref } from "@/lib/branches";
import { WhatsAppButton, type WhatsAppContact } from "./whatsapp-button";

// Toma las sucursales publicadas (las mismas de /sucursales) y deja solo las
// que tienen un celular con WhatsApp.
export async function WhatsAppContacts() {
  const branches = await getPublishedBranches();
  const contacts: WhatsAppContact[] = branches.flatMap((branch) => {
    const href = whatsappHref(branch);
    return href
      ? [{ id: branch.id, name: branch.name, hours: branch.hours, href }]
      : [];
  });
  return <WhatsAppButton contacts={contacts} />;
}
