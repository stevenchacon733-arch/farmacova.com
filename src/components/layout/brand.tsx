import Link from "next/link";
import Image from "next/image";

export function Brand() {
  return (
    <Link
      href="/"
      aria-label="Farmacova, inicio"
      className="inline-flex shrink-0 items-center"
    >
      <Image
        src="/images/farmacova-logo-transparente.png"
        alt="Farmacova · Cuidamos de ti"
        width={222}
        height={112}
        className="h-auto w-36 sm:w-44"
        unoptimized
      />
    </Link>
  );
}
