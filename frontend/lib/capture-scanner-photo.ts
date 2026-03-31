export async function captureScannerPhoto(
  host: HTMLDivElement | null,
  filenamePrefix: string,
): Promise<File> {
  if (!host) throw new Error("Camera is not ready.");

  const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

  const findVideo = (): HTMLVideoElement | null => {
    const v = host.querySelector("video") as HTMLVideoElement | null;
    return v;
  };

  let v: HTMLVideoElement | null = null;
  for (let i = 0; i < 30; i++) {
    v = findVideo();
    if (v) break;
    // eslint-disable-next-line no-await-in-loop
    await sleep(50);
  }
  if (!v) throw new Error("Camera is not ready.");

  const waitFrame = () =>
    new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });

  for (let i = 0; i < 30; i++) {
    if (v.readyState >= 2 && v.videoWidth > 0 && v.videoHeight > 0) break;
    // eslint-disable-next-line no-await-in-loop
    await waitFrame();
  }

  const w = v.videoWidth;
  const h = v.videoHeight;
  if (!w || !h) throw new Error("Camera is not ready.");

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Unable to capture image.");

  const isBlank = () => {
    try {
      const sample = ctx.getImageData(
        Math.max(0, Math.floor(w / 2) - 2),
        Math.max(0, Math.floor(h / 2) - 2),
        4,
        4,
      ).data;
      let allWhite = true;
      let allTransparent = true;
      for (let i = 0; i < sample.length; i += 4) {
        const r = sample[i];
        const g = sample[i + 1];
        const b = sample[i + 2];
        const a = sample[i + 3];
        if (a !== 0) allTransparent = false;
        if (!(r === 255 && g === 255 && b === 255 && a === 255)) allWhite = false;
      }
      return allTransparent || allWhite;
    } catch {
      return false;
    }
  };

  for (let attempt = 0; attempt < 6; attempt++) {
    ctx.drawImage(v, 0, 0, w, h);
    if (!isBlank()) break;
    await new Promise((r) => setTimeout(r, 80));
  }

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (!b) reject(new Error("Unable to capture image."));
        else resolve(b);
      },
      "image/png",
      0.92,
    );
  });

  return new File([blob], `${filenamePrefix}_${Date.now()}.png`, { type: blob.type });
}

