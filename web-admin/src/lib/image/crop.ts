export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', (e) => reject(e));
    img.src = src;
  });
}

export async function cropImageToFile(
  imageSrc: string,
  cropArea: CropArea,
  fileName: string,
  mimeType: string = 'image/jpeg',
): Promise<File> {
  const image = await loadImage(imageSrc);

  const canvas = document.createElement('canvas');
  canvas.width = cropArea.width;
  canvas.height = cropArea.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  ctx.drawImage(
    image,
    cropArea.x,
    cropArea.y,
    cropArea.width,
    cropArea.height,
    0,
    0,
    cropArea.width,
    cropArea.height,
  );

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Canvas toBlob failed'))),
      mimeType,
      0.92,
    );
  });

  return new File([blob], fileName, { type: mimeType });
}
