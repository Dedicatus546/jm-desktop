import {
  ComicPicElRef,
  decodeSrcMap,
  observer,
} from "@/components/comic-pic/state";
import { decodeImage, needDecode } from "@/utils/image-rewrite";

const useDecodeImage = (
  sourceSrc: MaybeRef<string>,
  comicId: MaybeRef<number>,
) => {
  const imageSrc = ref("");
  const visible = ref(false);
  const elRef = ref<Element | null>(null);

  const onSetRef = (el: Element | ComponentPublicInstance | null) => {
    if (el) {
      const safeTypeEl = el as ComicPicElRef;
      safeTypeEl.__comic__pic__onVisible = async () => {
        observer.unobserve(safeTypeEl);
        if (!needDecode(toValue(comicId))) {
          visible.value = true;
          imageSrc.value = toValue(sourceSrc);
          return;
        }
        const decodeSrc = await decodeImage(
          toValue(sourceSrc),
          toValue(comicId),
        );
        if (decodeSrc) {
          const key = toValue(sourceSrc) + toValue(comicId);
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
      elRef.value = safeTypeEl;
    } else {
      elRef.value = null;
    }
  };

  onMounted(() => {
    if (elRef.value) {
      observer.observe(elRef.value);
    }
  });

  onBeforeUnmount(() => {
    if (elRef.value) {
      observer.unobserve(elRef.value);
    }
  });

  return {
    onSetRef,
    visible,
    imageSrc,
  };
};

export default useDecodeImage;
