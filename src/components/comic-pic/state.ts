export type ComicPicElRef = HTMLDivElement & {
  __comic__pic__onVisible?: () => void;
};

export const observer = new IntersectionObserver((entries) => {
  entries.forEach((item) => {
    if (item.isIntersecting) {
      // show
      (item.target as ComicPicElRef).__comic__pic__onVisible?.();
    }
  });
});

export const decodeSrcMap = new Map<string, string>();
