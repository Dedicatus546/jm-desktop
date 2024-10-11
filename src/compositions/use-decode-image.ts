import { decodeImage, needDecode } from "@/utils/image-rewrite";

export type ComicPicElRef = HTMLDivElement & {
  __comic__pic__onVisible?: () => void;
};

const decodeSrcMap = new Map<string, string>();

const useDecodeImage = (
  elRef: MaybeRef<Element | null>,
  observerRef: MaybeRef<IntersectionObserver | null>,
  sourceSrc: MaybeRef<string>,
  comicId: MaybeRef<number>,
) => {
  const imageSrc = ref("");
  const visible = ref(false);

  onMounted(() => {
    const observer = toValue(observerRef);
    const elValue = toValue(elRef);
    const sourceSrcValue = toValue(sourceSrc);
    const comicIdValue = toValue(comicId);
    const key =
      comicIdValue +
      "-" +
      sourceSrcValue.substring(
        sourceSrcValue.lastIndexOf("/") + 1,
        sourceSrcValue.lastIndexOf("."),
      );
    if (decodeSrcMap.has(key)) {
      visible.value = true;
      imageSrc.value = decodeSrcMap.get(key)!;
      return;
    }
    if (elValue) {
      const safeTypeEl = elValue as ComicPicElRef;
      safeTypeEl.__comic__pic__onVisible = async () => {
        observer?.unobserve(safeTypeEl);
        if (!needDecode(comicIdValue)) {
          visible.value = true;
          imageSrc.value = sourceSrcValue;
          return;
        }
        const decodeSrc = await decodeImage(sourceSrcValue, comicIdValue);
        if (decodeSrc) {
          decodeSrcMap.set(key, decodeSrc);
          setTimeout(
            () => {
              decodeSrcMap.delete(key);
            },
            10 * 60 * 1000,
          ); // 10 分钟过期
          imageSrc.value = decodeSrc;
          visible.value = true;
        }
      };
    }

    if (elValue) {
      observer?.observe(elValue);
    }
  });

  onBeforeUnmount(() => {
    const observer = toValue(observerRef);
    const elValue = toValue(elRef);
    if (elValue) {
      observer?.unobserve(elValue);
    }
  });

  return {
    visible,
    imageSrc,
  };
};

export default useDecodeImage;
