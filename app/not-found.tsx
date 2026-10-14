import { stackSansHeadline, switzer } from "@/app/(home)/fonts";
import { MarketingNotFound } from "@/components/marketing";
import "@/app/(home)/mhv-404.css";

export default function NotFound() {
  return (
    <div
      className={`${switzer.variable} ${stackSansHeadline.variable}`}
      style={{
        minHeight: "100dvh",
        width: "100%",
        background: "#122020",
      }}
    >
      <MarketingNotFound />
    </div>
  );
}
