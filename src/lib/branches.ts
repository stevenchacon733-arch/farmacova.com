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
  // Localidad para el filtro y coordenadas del pin en el mapa.
  city?: string;
  latitude?: number | null;
  longitude?: number | null;
};

export const brandContact = {
  phone: "4000-6769",
  instagram: "https://www.instagram.com/farmacovacr/",
  facebook: "https://www.facebook.com/farmacovacr/albums/463081322534907/",
};

// Datos facilitados por el propietario en su documento del 3 de octubre.
// Horarios confirmados por el propietario durante la implementación.
// Coordenadas: las de San Gabriel, San Carlos, Venecia y Pital salen de su
// código Plus; la de Farmacova Aguas Zarcas, del lugar de su enlace de Google
// Maps (Supermercado Economás, confirmado por el propietario).
export const initialBranches: Branch[] = [
  {
    id: "fc000000-0000-4000-8000-000000000001",
    name: "Farmacova Aguas Zarcas",
    address:
      "Dentro del Supermercado Economás, 50 metros norte del Banco Nacional. Aguas Zarcas, San Carlos, Alajuela.",
    phone: "8375-0404",
    hours: "9:00 a. m. a 9:00 p. m.",
    maps_url:
      "https://www.google.com/maps?um=1&ie=UTF-8&fb=1&gl=cr&sa=X&geocode=KWd-L3sQY6CPMUi2Fx2kRzxO&daddr=50+metros+norte+del+banco+nacional+de+costa+rica,+dentro+del+gran+econ%C3%B3+m%C3%A1s+Alajuela+san+carlos,+21004",
    waze_url:
      "https://www.waze.com/es/live-map/directions/cr/provincia-de-alajuela/aguas-zarcas/farmacova?to=place.ChIJZ34vexBjoI8RSLYXHaRHPE4",
    secondary_phone: "",
    facebook_url: "",
    city: "Aguas Zarcas",
    latitude: 10.358323,
    longitude: -84.323266,
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
    city: "Aguas Zarcas",
    latitude: 10.375188,
    longitude: -84.339688,
    published: true,
  },
  {
    id: "fc000000-0000-4000-8000-000000000003",
    name: "Farmacia San Carlos",
    address: "8HF9+VPH, Ciudad Quesada, Alajuela.",
    phone: "2460-0309",
    secondary_phone: "8336-8336",
    hours: "8:00 a. m. a 8:00 p. m.",
    maps_url: "",
    waze_url: "",
    facebook_url: "",
    city: "Ciudad Quesada",
    latitude: 10.324688,
    longitude: -84.430641,
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
    city: "Venecia",
    latitude: 10.353938,
    longitude: -84.274063,
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
    city: "Pital",
    latitude: 10.452063,
    longitude: -84.272063,
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

// En Costa Rica los celulares empiezan con 5, 6, 7 u 8; los fijos (2…) no
// tienen WhatsApp. Se usa el primer celular de la sucursal.
export function whatsappNumber(branch: Branch): string | null {
  for (const phone of [branch.phone, branch.secondary_phone]) {
    const digits = (phone ?? "")
      .replace(/\D/g, "")
      .replace(/^506(?=\d{8}$)/, "");
    if (/^[5-8]\d{7}$/.test(digits)) return `506${digits}`;
  }
  return null;
}

export function whatsappHref(branch: Branch): string | null {
  const number = whatsappNumber(branch);
  if (!number) return null;
  const text = `Hola ${branch.name}, quisiera hacer una consulta.`;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export function branchCity(branch: Branch) {
  return branch.city?.trim() || "Otras localidades";
}

export function branchCoordinates(branch: Branch): [number, number] | null {
  const { latitude, longitude } = branch;
  if (
    typeof latitude !== "number" ||
    typeof longitude !== "number" ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  )
    return null;
  return [latitude, longitude];
}

// Ruta en Google Maps: el enlace del propietario si existe; si no, el pin.
export function directionsHref(branch: Branch) {
  if (branch.maps_url && safeBranchUrl(branch.maps_url, "maps"))
    return branch.maps_url;
  const point = branchCoordinates(branch);
  if (!point) return mapsHref(branch);
  return `https://www.google.com/maps/dir/?${new URLSearchParams({ api: "1", destination: point.join(",") })}`;
}

export function wazeHref(branch: Branch): string | null {
  if (branch.waze_url && safeBranchUrl(branch.waze_url, "waze"))
    return branch.waze_url;
  const point = branchCoordinates(branch);
  if (!point) return null;
  return `https://waze.com/ul?${new URLSearchParams({ ll: point.join(","), navigate: "yes" })}`;
}

// Convierte "9:00 a. m. a 9:00 p. m." en minutos desde medianoche.
export function parseHours(
  hours: string,
): { opens: number; closes: number } | null {
  const times = [
    ...hours
      .toLowerCase()
      .matchAll(/(\d{1,2})(?::(\d{2}))?\s*([ap])\.?\s*m\.?/g),
  ];
  if (times.length !== 2) return null;
  const [opens, closes] = times.map(([, h, m = "0", half]) => {
    const hour = (Number(h) % 12) + (half === "p" ? 12 : 0);
    return hour * 60 + Number(m);
  });
  if (opens > 24 * 60 || closes > 24 * 60) return null;
  return { opens, closes };
}

// Costa Rica usa UTC−6 todo el año (sin horario de verano).
export function costaRicaMinutes(now: Date) {
  const shifted = new Date(now.getTime() - 6 * 3600000);
  return shifted.getUTCHours() * 60 + shifted.getUTCMinutes();
}

export function openNow(branch: Branch, now: Date): boolean | null {
  const range = parseHours(branch.hours);
  if (!range) return null;
  const minutes = costaRicaMinutes(now);
  return range.closes > range.opens
    ? minutes >= range.opens && minutes < range.closes
    : minutes >= range.opens || minutes < range.closes;
}
