import type { Metadata } from "next";
import { MhvLanding } from "./mhv-landing";

export const metadata: Metadata = {
  title: "Our story",
};

export default function HomePage() {
  return <MhvLanding />;
}
