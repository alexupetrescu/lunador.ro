import NoiseOverlay from "./NoiseOverlay";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";

interface PublicShellProps {
  children: React.ReactNode;
  readingRoomHref?: string;
}

export default function PublicShell({
  children,
  readingRoomHref,
}: PublicShellProps) {
  return (
    <>
      <NoiseOverlay />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <SiteHeader readingRoomHref={readingRoomHref} />
        <div style={{ flex: 1 }}>{children}</div>
        <SiteFooter />
      </div>
    </>
  );
}
