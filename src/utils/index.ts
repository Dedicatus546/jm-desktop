export const getLoadedImage = async (src: string) => {
  const img = document.createElement("img");
  // 允许跨域
  img.setAttribute("crossOrigin", "anonymous");
  return new Promise<HTMLImageElement>((resolve, reject) => {
    img.addEventListener("load", () => {
      resolve(img);
    });
    img.addEventListener("error", (e) => {
      reject(e);
    });
    img.src = src;
  });
};

export const resolveDownloadFileName = (comicId: number, name: string) => {
  return `[JM${comicId}] ${name.replace(/[\\/:*?"<>|]/g, "_")}.zip`;
};

export const normalizeError = (err: unknown) => {
  if (err instanceof Error) {
    return `
      ${err.message}\n
      ${err.stack}
    `;
  }
  return String(err);
};
