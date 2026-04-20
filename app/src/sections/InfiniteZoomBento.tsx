import { useEffect, useState } from "react";
import crowd1 from "@/assets/bento/crowd-1.avif";
import crowd2 from "@/assets/bento/crowd-2.avif";
import uiDashboard from "@/assets/bento/ui-dashboard.avif";
import nfcScanner from "@/assets/bento/nfc-scanner.avif";
import qrPass from "@/assets/bento/qr-pass.avif";
import stage from "@/assets/bento/stage.avif";
import uiMobile from "@/assets/bento/ui-mobile.avif";
import scanEntry from "@/assets/bento/scan-entry.avif";
import wristband from "@/assets/bento/wristband.avif";
import analytics from "@/assets/bento/analytics.avif";
import dj from "@/assets/bento/dj.avif";

type Tile =
  | { kind: "image"; src: string; alt: string; className: string }
  | { kind: "logo"; className: string; large?: boolean };

const TILES: Tile[] = [
  { kind: "image", src: crowd1,      alt: "Concert crowd",           className: "col-span-2 row-span-2" },
  { kind: "image", src: uiDashboard, alt: "Ticketing dashboard",     className: "col-span-1 row-span-1" },
  { kind: "image", src: qrPass,      alt: "Dynamic QR pass",         className: "col-span-1 row-span-2" },
  { kind: "image", src: nfcScanner,  alt: "NFC scanner",             className: "col-span-1 row-span-1" },

  { kind: "image", src: stage,       alt: "Stage performer",         className: "col-span-1 row-span-1" },
  { kind: "image", src: analytics,   alt: "Sales analytics",         className: "col-span-1 row-span-1" },
  { kind: "logo",                                                      className: "col-span-2 row-span-2" },
  { kind: "logo",                                                      className: "col-span-1 row-span-1", large: true },

  { kind: "image", src: dj,          alt: "DJ booth",                className: "col-span-1 row-span-2" },
  { kind: "image", src: wristband,   alt: "RFID wristband",          className: "col-span-1 row-span-1" },
  { kind: "image", src: uiMobile,    alt: "Mobile ticketing app",    className: "col-span-1 row-span-1" },

  { kind: "image", src: scanEntry,   alt: "Door scan entry",         className: "col-span-2 row-span-1" },
  { kind: "image", src: crowd2,      alt: "Festival lasers",         className: "col-span-2 row-span-1" },
  { kind: "image", src: uiDashboard, alt: "Analytics ui",            className: "col-span-1 row-span-1" },
];

const InfiniteZoomBento = () => {
  const [zoomScale, setZoomScale] = useState(6);

  useEffect(() => {
    const compute = () => {
      const vw = window.innerWidth;
      const gridWidth = Math.min(vw * 0.96, 1400);
      const gap = vw >= 640 ? 12 : 8;
      const colWidth = (gridWidth - 4 * gap) / 5;
      setZoomScale(vw / colWidth);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  return (
  <section className="bento-section relative bg-black text-foreground" style={{ height: "300vh" }}>
    <div className="sticky top-0 h-screen w-full overflow-hidden">

      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[hsl(var(--brand)/0.18)] blur-3xl" />
      </div>

      {/* Zoom grid — animated via CSS scroll-driven animation (compositor thread) */}
      <div
        className="bento-grid-wrapper absolute inset-0 flex items-center justify-center"
        style={{ "--bento-zoom": zoomScale } as React.CSSProperties}
      >
        <div
          className="grid w-[min(96vw,1400px)] aspect-[5/4] gap-2 sm:gap-3 grid-cols-5 grid-flow-dense"
          style={{ gridAutoRows: "1fr" }}
        >
          {TILES.map((tile, i) => (
            <div
              key={i}
              className={`${tile.className} relative overflow-hidden rounded-xl bg-secondary/40 ring-1 ring-white/5`}
            >
              {tile.kind === "image" ? (
                <img
                  src={tile.src}
                  alt={tile.alt}
                  loading="eager"
                  decoding="async"
                  width={800}
                  height={800}
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-black via-black to-[hsl(var(--brand)/0.5)] p-2 text-center">
                  <span
                    className="font-black leading-none tracking-tighter"
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: tile.kind === "logo" && tile.large ? "clamp(1.5rem, 2vw, 2.5rem)" : "26%",
                    }}
                  >
                    <span className="text-lime-400">The </span>
                    <span className="text-white">Backstage</span>
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Vignette */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_40%,black_95%)]" />

    </div>
  </section>
  );
};

export default InfiniteZoomBento;
