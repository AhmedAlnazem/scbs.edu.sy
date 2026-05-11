export function splitMediaUrls(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;
const MAX_IMAGE_COUNT = 6;

function isFile(value: FormDataEntryValue | null): value is File {
  return typeof File !== "undefined" && value instanceof File;
}

async function fileToDataUrl(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image uploads are allowed.");
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("Each image must be 2 MB or smaller.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  return `data:${file.type};base64,${buffer.toString("base64")}`;
}

export async function readUploadedImage(formData: FormData, key: string) {
  const value = formData.get(key);

  if (!isFile(value) || value.size === 0) {
    return null;
  }

  return fileToDataUrl(value);
}

export async function readUploadedImages(formData: FormData, key: string) {
  const files = formData
    .getAll(key)
    .filter((value): value is File => isFile(value) && value.size > 0);

  if (files.length > MAX_IMAGE_COUNT) {
    throw new Error(`You can upload up to ${MAX_IMAGE_COUNT} images.`);
  }

  return Promise.all(files.map((file) => fileToDataUrl(file)));
}

export function joinMediaUrls(values: string[]) {
  return values.map((item) => item.trim()).filter(Boolean).join("\n");
}

export function readMediaUrls(value: string | null | undefined) {
  if (!value) {
    return [];
  }

  return splitMediaUrls(value);
}
