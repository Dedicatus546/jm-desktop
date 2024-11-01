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
