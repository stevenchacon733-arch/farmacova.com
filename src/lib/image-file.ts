// Comprueba tipo, tamaño y firma real de una imagen antes de subirla.
export async function checkImageFile(file: File, maxMb: number) {
  if (
    !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
    file.size > maxMb * 1024 * 1024
  )
    throw new Error(`Usa una imagen PNG, JPG o WebP de hasta ${maxMb} MB.`);
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const png =
    bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71;
  const jpg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const webp =
    new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" &&
    new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP";
  if (!(
    (file.type === "image/png" && png) ||
    (file.type === "image/jpeg" && jpg) ||
    (file.type === "image/webp" && webp)
  ))
    throw new Error(
      "El archivo no coincide con un formato de imagen admitido.",
    );
  return file.type === "image/png"
    ? "png"
    : file.type === "image/jpeg"
      ? "jpg"
      : "webp";
}

export async function imageDataUrl(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
