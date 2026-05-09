export function splitMediaUrls(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
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
