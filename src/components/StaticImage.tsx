import React, { useRef, useEffect, useState } from "react";

export default function StaticImage({
  src,
  alt,
  className,
  placeholderClassName,
}: {
  src?: string;
  alt?: string;
  className?: string;
  placeholderClassName?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [useCanvas, setUseCanvas] = useState(false);
  const [errored, setErrored] = useState(false);

  const isGif = src ? /\.gif(\?|$)/i.test(src) : false;

  useEffect(() => {
    setErrored(false);
    setUseCanvas(false);
  }, [src]);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (isGif && canvasRef.current) {
      const img = e.currentTarget;
      const canvas = canvasRef.current;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        setUseCanvas(true);
      }
    }
  };

  if (!src || errored) {
    return (
      <div className={`flex items-center justify-center bg-[#1e2228] ${className || ""}`}>
        <img
          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARgAAAEYCAYAAACHjumMAAAQAElEQVR4AeydB6BlVXX3/+vc96bBwPSBGYYmRZE+UmboChpsiIqJJpZoYmJvSNX4FOmoiTXBqJ8pGiWJxhoLikhHVDQSe4EBmUJngJl59+zv91/n3jdvEMiU96bePXudvfouZ6919j33vTeVeqW3Ar0V6K3AKK1AL8GM0sL23PZWoLcCUi/B9HZBbwV6KzBqK9BLMKO2tD3HG3oFev1v+BXoJZgNfw96I+itwGa7Ar0Es9ne2t7Eeiuw4Vegl2A2/D3ojaC3ApvtCvQSzCjd2p7b3gr0VqD3LVJvD/RWoLcCo7gCvRPMKC5uz3VvBbb0FeglmC19B/Tm31uBNV2BNdDvJZg1WKyeam8FeiuwZivQSzBrtl497d4K9FZgDVagl2DWYLF6qr0V6K3Amq1AL8Gs2Xr1tDf0CvT636RWoJdgNqnb1Rvs8BU4Xhp76uTJOw5MmbLNcH4P33hWoJdgNp570RvJGq7Af+y5/5MGpu/42dOm7/zxB3bf94UD0/faeg1d9NRHeQV6CWaUF7jnfvRWoIqKhNLar5TynIjW3506edwHlu621wFHS32j12vP85qsQLUmylu8bm8BNqoVePedi3+pqrqRQbUU1XSpvKSq+j/5lT33PwRer24EK9BLMBvBTegNYe1WoG/RLb8rpf05rO9VqWmC/VztHSXOfWCPuYf3TjIsyQau3JANPIJe970VWMsVGJAGSSz/UqL6rRTKEi0jR4Tqv//KHnMPTV7vssFWoNpgPfc67q3ACKzAhJ/feFtVyqV2VbgYlMkmnshHprOX7rbvgZJ6+5xFeOw6OtLewo/Ouva8rr8VKG2Vb/AB6Z7o9MmJRoaI6vCq1X/uA7vutUNH1GvW8wr0Esx6XvBedyO/AmffeecPq2hdg+e6STLNldMM+7s6Wq0xr+l9hc3qbIBabYA+e132VmBEV+CcJb+7vZT663VU95NUVvFdVMao6n/FqZMnPHdAGrOKsEeM+gr0EsyoL3Gvg/97BdZZo9RRvsm5ZbHEVd00Y9ygqYp4x6l7Hny4emW9rkAvwazX5e51NlorsNX2z75Jit/xYleSk4pBQ4WUs2tR+eu7dt550hCzh4z6CvQSzKgvca+D9bECcdnAoBTfU/iHeJ1cuqBOMa3jxo6d/tKBWbMmdJi9ZpRXoJdgRnmBe+7X4wqEblRpl1V7JLFES/LP4EmTVMrpp2693Vz1ynpZgV6C0XpZ514n62EFvvPA3QuluEdZnGc6ycV04Ytsma5m1tH3srLnYRPN7sHorkAvwYzu+va8r8cV+O4D990l1Xdkl/lRyRiJxsnFpxiTvAAOVc96oF565IB6P4CnUS69BDPKC9xzv/5WoO4beyfvYJbIJxVR/LGokGBMlzYMqhNNxLSoxrxl3k577gSnV0dxBXoJZhQXt+d6/a5AWXbPXVHUnGCcVNx9hOREk4mFdzENPxSto48YP/WZ2rzLBp9dL8Fs8FvQG8BIrcD4u+66r66q26Wqe1wRL3Ub9/6YBObzjEGKQPicpXseNku9Mmor0Eswo7a0PcfrewV4p1JHPbhYoRUkj6b7zCPkG7dwyCpDV5BDIuqjsfN325C9OtIr0EswI72iPX8bdAVKtPi6iA9KZJlmIJXggXqrO71USEKFf1JsVSteediuc3unGI1OqUbHbc9rbwW0QZYgSmFPO4H4DNN8GBIpRVmcYMwrcIyLr5HKEYeNHTs/xb3LiK8AN2PEffYc9lZgA65ANez40iQaD6Zw8anFLWhW40VR8UXT08rOR49LZu8yoivQSzAjupw9Zxt8BaqI8CA63xqtikPBL8gNNFJ+w1QdfP+EFY9Tr4z4CvQSzIgvac/hhlyBWlV/iSCTlBxGcQJJjI9Mw3CRaBIsK+VxfO90xIB6f87ByzGSsLkmmJFco56... [truncated]"
          alt=""
          className={placeholderClassName || "h-8 w-8 opacity-40"}
        />
      </div>
    );
  }

  return (
    <>
      {isGif && <canvas ref={canvasRef} className={className} style={{ display: useCanvas ? undefined : "none" }} />}
      <img
        src={src}
        alt={alt || ""}
        className={className}
        style={{ display: isGif && useCanvas ? "none" : undefined }}
        onLoad={handleLoad}
        onError={() => setErrored(true)}
        crossOrigin="anonymous"
      />
    </>
  );
}