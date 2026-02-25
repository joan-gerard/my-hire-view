"use client";

import {
  fadeUp,
  staggerContainer,
  staggerItem,
  viewport,
} from "@/lib/landing-animations";
import { motion } from "framer-motion";
import Image from "next/image";
import { SectionBadge } from "../ui/SectionBadge";

/** Decorative image shown to the left of the FAQ list. Replace with your preferred asset. */
const FAQ_IMAGE = "/question-6.jpg";

const FAQ_ITEMS = [
  {
    q: "When will MyHireView launch?",
    a: "We're launching in Q2 2026. Early signups will be notified first and receive exclusive launch benefits.",
  },
  {
    q: "Will MyHireView be free?",
    a: "Yes! We'll have a free tier that lets you create applications with core features. Premium plans with advanced analytics and unlimited applications will also be available.",
  },
  {
    q: "Do recruiters need to create an account to view my application?",
    a: "No! Recruiters can view your application with just a link – no login required. This makes it effortless for them to engage with your content.",
  },
  {
    q: "What if I don't want to record a video?",
    a: "Video is optional but highly recommended. Our data shows applications with video pitches get 3x more engagement.",
  },
] as const;

/**
 * FAQ section for the pre-launch landing page (LANDING_PAGE_BRIEF).
 */
export default function FAQSection() {
  return (
    <motion.section
      className="px-4 md:px-6 lg:px-10 2xl:px-12 py-16 h-full max-w-[1700px] mx-auto"
      initial={fadeUp.initial}
      whileInView={fadeUp.whileInView}
      viewport={viewport}
      transition={fadeUp.transition}
    >
      <div className="mx-auto max-w-5xl flex flex-col gap-6">
        <div className="w-fit">
          <SectionBadge label="FAQ" />
        </div>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_1.5fr] lg:gap-12">
          {/* Left: decorative image */}
          <div className="relative aspect-video lg:aspect-auto flex items-center justify-center lg:justify-start w-full overflow-hidden">
            <Image
              src={FAQ_IMAGE}
              alt=""
              fill
              className="object-cover lg:object-bottom rounded-3xl"
              sizes="(max-width: 1023px) 100vw, 1600px"
            />
          </div>

          {/* Right: FAQ badge, heading, and Q&A */}
          <div className="flex flex-col gap-6">
            <motion.dl
              className="space-y-8"
              initial="hidden"
              whileInView="visible"
              viewport={viewport}
              variants={staggerContainer.variants}
            >
              {FAQ_ITEMS.map((item, index) => (
                <motion.div key={index} variants={staggerItem}>
                  <dt className="text-lg 2xl:text-2xl font-semibold text-foreground">
                    {item.q}
                  </dt>
                  <dd className="mt-2 text-(--foreground)/90">{item.a}</dd>
                </motion.div>
              ))}
            </motion.dl>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
