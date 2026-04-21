import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#11131A",
          borderRadius: 16,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at top, rgba(205,180,214,0.28), transparent 58%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 14,
            left: 18,
            right: 18,
            height: 2,
            borderRadius: 999,
            background: "#CDB4D6",
            opacity: 0.9,
          }}
        />
        <div
          style={{
            fontSize: 34,
            lineHeight: 1,
            color: "#F3F1F7",
            fontWeight: 700,
            letterSpacing: "-0.08em",
            transform: "translateY(-2px)",
          }}
        >
          BM
        </div>
      </div>
    ),
    size,
  );
}
