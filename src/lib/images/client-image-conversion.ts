export const acceptedAdminImageTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;

export const adminImageAcceptValue = [
  ...acceptedAdminImageTypes,
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".heic",
  ".heif",
].join(",");

const heicExtensions = [".heic", ".heif"];

function isHeicImage(file: File) {
  const name = file.name.toLowerCase();

  return file.type === "image/heic" || file.type === "image/heif" || heicExtensions.some((extension) => name.endsWith(extension));
}

function createObjectUrlImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Görsel tarayıcıda okunamadı."));
    image.src = src;
  });
}

export async function loadImageSource(file: File) {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await createObjectUrlImage(objectUrl);

    return {
      objectUrl,
      image,
      revoke: () => URL.revokeObjectURL(objectUrl),
    };
  } catch (error) {
    URL.revokeObjectURL(objectUrl);

    if (isHeicImage(file)) {
      throw new Error("HEIC/HEIF görsel bu tarayıcıda işlenemedi. iPhone'da Safari ile tekrar deneyin veya JPEG olarak kaydedip yükleyin.");
    }

    throw error;
  }
}

export async function canvasToJpegFile(canvas: HTMLCanvasElement, fileName: string, quality = 0.9) {
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((nextBlob) => {
      if (nextBlob) resolve(nextBlob);
      else reject(new Error("Görsel JPEG olarak hazırlanamadı."));
    }, "image/jpeg", quality);
  });

  return new File([blob], fileName, { type: "image/jpeg" });
}

export async function convertImageFileToJpeg(file: File, fileName = `image-${Date.now()}.jpg`) {
  const { image, revoke } = await loadImageSource(file);

  try {
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth || image.width;
    canvas.height = image.naturalHeight || image.height;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Görsel hazırlama alanı oluşturulamadı.");
    }

    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    return canvasToJpegFile(canvas, fileName);
  } finally {
    revoke();
  }
}
