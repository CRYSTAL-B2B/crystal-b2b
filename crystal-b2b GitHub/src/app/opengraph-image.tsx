import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const alt = "Даниил Чекулаев - B2B-маркетинг от спроса до выручки";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        color: "#f4f2ec",
        background: "#111111",
        position: "relative",
        padding: "64px 72px",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ position: "absolute", inset: 0, display: "flex", opacity: 0.24, backgroundImage: "linear-gradient(#6b6b6b 1px, transparent 1px), linear-gradient(90deg, #6b6b6b 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
      <div style={{ position: "absolute", right: 96, top: 94, width: 390, height: 390, display: "flex", border: "2px solid #2457ff", transform: "rotate(-12deg)" }} />
      <div style={{ position: "absolute", right: 140, top: 138, width: 300, height: 300, display: "flex", border: "1px solid #57d6df", transform: "rotate(11deg)" }} />
      <div style={{ position: "absolute", right: 215, top: 215, width: 150, height: 150, display: "flex", background: "#2457ff", opacity: 0.82 }} />
      <div style={{ zIndex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20, letterSpacing: 3 }}>
          <span>ДАНИИЛ ЧЕКУЛАЕВ</span><span>B2B / CRM / РОСТ</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 770 }}>
          <div style={{ display: "flex", fontSize: 78, lineHeight: 0.98, letterSpacing: -4 }}>Строю B2B-маркетинг</div>
          <div style={{ display: "flex", fontSize: 78, lineHeight: 0.98, letterSpacing: -4, color: "#7f9bff" }}>от спроса до выручки.</div>
        </div>
        <div style={{ display: "flex", fontSize: 24, color: "#b9b9b2" }}>Стратегия - спрос - CRM - продажи - результат</div>
      </div>
    </div>,
    size,
  );
}
