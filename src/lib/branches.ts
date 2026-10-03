export type Branch = {
  id: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
  published: boolean;
  secondary_phone?: string;
  maps_url?: string;
  waze_url?: string;
  facebook_url?: string;
};

export const brandContact = {
  phone: "4000-6769",
  instagram: "https://www.instagram.com/farmacovacr/",
  facebook: "https://www.facebook.com/farmacovacr/albums/463081322534907/",
};

// Datos facilitados por el propietario en su documento del 3 de octubre.
// Horarios confirmados por el propietario durante la implementación.
export const initialBranches: Branch[] = [
  {
    id: "fc000000-0000-4000-8000-000000000001",
    name: "Farmacova Aguas Zarcas",
    address:
      "50 metros norte del Banco Nacional, dentro del supermercado Gran Economás. Aguas Zarcas, San Carlos, Alajuela.",
    phone: "8375-0404",
    hours: "9:00 a. m. a 9:00 p. m.",
    maps_url:
      "https://www.google.com/maps?um=1&ie=UTF-8&fb=1&gl=cr&sa=X&geocode=KWd-L3sQY6CPMUi2Fx2kRzxO&daddr=50+metros+norte+del+banco+nacional+de+costa+rica,+dentro+del+gran+econ%C3%B3+m%C3%A1s+Alajuela+san+carlos,+21004",
    waze_url:
      "https://www.waze.com/es/live-map/directions/cr/provincia-de-alajuela/aguas-zarcas/farmacova?to=place.ChIJZ34vexBjoI8RSLYXHaRHPE4",
    secondary_phone: "",
    facebook_url: "",
    published: true,
  },
  {
    id: "fc000000-0000-4000-8000-000000000002",
    name: "Farmacia San Gabriel · Aguas Zarcas",
    address: "9MG6+345, Aguas Zarcas, Alajuela.",
    phone: "2474-2505",
    secondary_phone: "6077-5505",
    hours: "8:00 a. m. a 8:00 p. m.",
    maps_url: "",
    waze_url: "",
    facebook_url: "https://www.facebook.com/farmaciasangabrielcr",
    published: true,
  },
  {
    id: "fc000000-0000-4000-8000-000000000003",
    name: "Farmacia San Carlos",
    address: "8HF9+RPX, Ciudad Quesada, Alajuela.",
    phone: "2460-0309",
    secondary_phone: "8336-8336",
    hours: "8:00 a. m. a 8:00 p. m.",
    maps_url: "",
    waze_url: "",
    facebook_url: "",
    published: true,
  },
  {
    id: "fc000000-0000-4000-8000-000000000004",
    name: "Farmacova Venecia",
    address: "9P3G+H9, Venecia, Alajuela.",
    phone: "8472-8472",
    secondary_phone: "",
    hours: "8:00 a. m. a 8:00 p. m.",
    maps_url: "",
    waze_url: "",
    facebook_url: "",
    published: true,
  },
  {
    id: "fc000000-0000-4000-8000-000000000005",
    name: "Farmacova Pital",
    address: "Dentro del supermercado Economás. FP2H+R5, Pital, Alajuela.",
    phone: "8480-8480",
    secondary_phone: "",
    hours: "9:00 a. m. a 9:00 p. m.",
    maps_url: "",
    waze_url: "",
    facebook_url: "",
    published: true,
  },
];

export function phoneHref(phone: string) {
  const digits = phone.replace(/[^0-9+]/g, "");
  return `tel:${/^\d{8}$/.test(digits) ? `+506${digits}` : digits}`;
}

export function safeBranchUrl(
  value: string,
  kind: "maps" | "waze" | "facebook",
) {
  try {
    const url = new URL(value);
    const allowed = {
      maps: [
        "www.google.com",
        "google.com",
        "maps.google.com",
        "maps.app.goo.gl",
      ],
      waze: ["www.waze.com", "waze.com"],
      facebook: ["www.facebook.com", "facebook.com"],
    };
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      !url.port &&
      allowed[kind].includes(url.hostname)
    );
  } catch {
    return false;
  }
}

export function mapsHref(branch: Branch) {
  if (branch.maps_url && safeBranchUrl(branch.maps_url, "maps"))
    return branch.maps_url;
  // Abrir la búsqueda de la dirección facilitada, sin inventar coordenadas.
  return `https://www.google.com/maps/search/?${new URLSearchParams({ api: "1", query: `${branch.name}, ${branch.address}, Costa Rica` })}`;
}
