"use client";

import { BarChartIcon, LinkIcon, VideoIcon } from "@/components/admin/icons";
import {
  fadeUp,
  staggerContainer,
  staggerItem,
  viewport,
} from "@/lib/landing-animations";
import { motion } from "framer-motion";
import Image from "next/image";

/** Unsplash image: professional / career theme (no SVG in Image per requirements). */
const SOLUTION_HERO_IMAGE = "/solution-2.jpg";

const FEATURES = [
  {
    title: "Video Pitch",
    description:
      "Let recruiters see and hear you. Upload a 60–90 second video pitch to showcase your communication skills and personality.",
    Icon: VideoIcon,
  },
  {
    title: "Smart Analytics",
    description:
      "Know when recruiters view your application. Track engagement and follow up at the perfect time.",
    Icon: BarChartIcon,
  },
  {
    title: "Shareable Links",
    description:
      "Create custom applications for each role with unique, professional URLs. No login required for recruiters.",
    Icon: LinkIcon,
  },
];

export default function SolutionSection() {
  return (
    <motion.section
      className="px-4 md:px-6 lg:px-10 2xl:px-12 pt-16 pb-10 lg:pb-16 h-full max-w-[1700px] mx-auto"
      initial={fadeUp.initial}
      whileInView={fadeUp.whileInView}
      viewport={viewport}
      transition={fadeUp.transition}
    >
      <div className="mx-auto flex flex-col gap-4 lg:gap-10">
        <SolutionHero />
        <motion.div
          className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={staggerContainer.variants}
        >
          {FEATURES.map(({ title, description, Icon }) => (
            <SolutionFeatureCard
              key={title}
              title={title}
              description={description}
              Icon={Icon}
            />
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}

function SolutionHero() {
  return (
    <motion.div
      className="relative min-h-[500px] sm:min-h-[400px] overflow-hidden rounded-2xl border border-(--foreground)/10"
      initial={fadeUp.initial}
      whileInView={fadeUp.whileInView}
      viewport={viewport}
      transition={fadeUp.transition}
    >
      <Image
        src={SOLUTION_HERO_IMAGE}
        alt="Professional woman at laptop, career and application theme"
        fill
        className="object-cover object-bottom md:object-center"
        sizes="(max-width: 1023px) 100vw, 1600px"
      />
      <div
        className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent pointer-events-none"
        aria-hidden
      />
      <motion.div
        className="absolute inset-0 flex flex-col justify-end p-8 2xl:p-10"
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
        variants={staggerContainer.variants}
      >
        <motion.h2
          className="relative z-10 text-2xl 2xl:text-5xl text-balance font-light tracking-tight text-white sm:text-3xl lg:text-3xl xl:text-4xl max-w-2xl"
          variants={staggerItem}
        >
          Introducing MyHireView: Your Application, Elevated
        </motion.h2>
        <motion.p
          className="relative z-10 mt-4 text-lg leading-normal text-balance text-white/90 max-w-2xl"
          variants={staggerItem}
        >
          Stand out with a video pitch, smart analytics, and shareable links—so
          recruiters see the real you.
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

function SolutionFeatureCard({
  title,
  description,
  Icon,
}: {
  title: string;
  description: string;
  Icon: React.ElementType;
}) {
  return (
    <motion.article
      className="flex flex-col gap-4 rounded-2xl bg-[#fbfaf9] p-6 md:p-8 2xl:p-10"
      variants={staggerItem}
    >
      <div className="flex h-10 2xl:h-14 w-10 2xl:w-14 shrink-0 items-center justify-center rounded-xl bg-[#f4f2f1] border border-(--foreground)/10">
        <Icon className="h-6 2xl:h-8 w-6 2xl:w-8 text-foreground" />
      </div>
      <h3 className="text-2xl xl:text-3xl 2xl:text-4xl font-light text-foreground">
        {title}
      </h3>
      <p className="text-lg xl:text-xl font-extralight leading-snug xl:leading-normal text-foreground/80">
        {description}
      </p>
    </motion.article>
  );
}
