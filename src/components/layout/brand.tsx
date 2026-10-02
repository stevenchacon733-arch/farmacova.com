import Link from "next/link";

export function Brand() {
  return (
    <Link
      href="/"
      aria-label="Farmacova, inicio"
      className="inline-flex flex-col leading-none"
    >
      <span className="text-[2rem] font-extrabold tracking-[-0.055em]">
        <span className="text-blue-800">Farma</span>
        <span className="text-green-600">cova</span>
        <span
          className="ml-1 inline-block h-2 w-2 rounded-full bg-green-500"
          aria-hidden="true"
        />
      </span>
      <span className="mt-2 text-[0.65rem] font-semibold tracking-[0.3em] text-gray-500">
        CUIDAMOS DE TI
      </span>
    </Link>
  );
}
