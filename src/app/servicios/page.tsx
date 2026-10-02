import type { Metadata } from "next";
import { Services } from "@/components/marketing/services";

export const metadata: Metadata = {
  title: "Medicamentos, vacunas e inyectables",
};
export default function ServicesPage() {
  return (
    <div className="shell py-12">
      <h1 className="mb-8 text-4xl font-extrabold tracking-tight text-blue-950">
        Nuestros servicios
      </h1>
      <Services />
    </div>
  );
}
