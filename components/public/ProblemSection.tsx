"use client";

import {
  DocumentIcon,
  InboxIcon,
  QuestionIcon,
  StopwatchIcon,
} from "@/components/admin/icons";
import {
  staggerContainer,
  staggerItem,
  viewport,
} from "@/lib/landing-animations";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/** Intersection threshold for considering the section "in view" (0–1). */
const IN_VIEW_THRESHOLD = 0.2;

/** Image for the problem section bento (left column). */
const PROBLEM_SECTION_IMAGE = "/remote-work-2.jpg";

const PROBLEMS = [
  {
    Icon: InboxIcon,
    label: "Inbox overflow",
    description: "Your resume gets lost in a sea of PDFs.",
  },
  {
    Icon: StopwatchIcon,
    label: "6 seconds",
    description: "Recruiters spend 6 seconds scanning it.",
  },
  {
    Icon: QuestionIcon,
    label: "No visibility",
    description: "You have no idea if anyone even opened it.",
  },
  {
    Icon: DocumentIcon,
    label: "Flat document",
    description:
      "There's no way to show your personality, passion, or communication skills that matter most for the job.",
  },
] as const;

/**
 * "The Problem" section for the pre-launch landing page (LANDING_PAGE_BRIEF).
 * Bento layout: left hero (image + h2), right 4 problem cards (icon, label, description).
 * Uses dark mode (black background, light text) when the section is in the viewport.
 */
export default function ProblemSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: IN_VIEW_THRESHOLD, rootMargin: "0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="mx-auto transition-colors duration-500 py-16"
      style={
        isInView
          ? {
              backgroundColor: "#000",
              color: "#fff",
              ["--foreground" as string]: "#fff",
              ["--background" as string]: "#171717",
              ["--secondary-background" as string]: "#000",
            }
          : undefined
      }
    >
      <div className="mx-auto px-10 2xl:px-12 py-16 h-full max-w-[1700px]">
        {/* Bento: mobile = 1 col (hero then cards); desktop = 3 cols, 2 rows */}
        <div className="grid grid-cols-1 gap-4 md:gap-6 min-[1440px]:grid-cols-3 min-[1440px]:grid-rows-2">
          {/* Left hero: image with h2 overlay; full height on desktop (col 1, rows 1–2), first on mobile. */}
          <ProblemSectionHero />

          {/* Right: 4 problem cards — 2x2 on desktop, stacked on mobile */}
          <motion.div
            className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-2 min-[1440px]:col-span-2 min-[1440px]:row-span-2 min-[1440px]:grid-cols-2 min-[1440px]:grid-rows-2 min-[1440px]:content-stretch"
            aria-label="Problems with traditional resumes"
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={staggerContainer.variants}
          >
            {PROBLEMS.map(({ Icon, label, description }) => (
              <ProblemCard
                key={label}
                Icon={Icon}
                label={label}
                description={description}
                isDarkMode={isInView}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ProblemSectionHero() {
  return (
    <div className="relative min-h-[600px] overflow-hidden rounded-2xl bg-linear-to-br from-foreground/10 to-foreground/5 lg:col-span-1 lg:row-span-2">
      <Image
        src={PROBLEM_SECTION_IMAGE}
        alt="Resume and documents on a desk"
        fill
        className="object-cover object-[50%_35%] min-[1440px]:object-center"
        sizes="(max-width: 1023px) 100vw, 33vw"
      />
      <div className="absolute inset-0 flex flex-col justify-between text-start p-8 2xl:p-10">
        <div
          className="absolute inset-0 -m-6 bg-linear-to-b from-black/70 to-transparent h-1/3"
          aria-hidden
        />
        <div className="flex flex-col gap-6 w-full max-w-xl">
          <h2 className="relative z-10 text-2xl 2xl:text-5xl text-balance font-light tracking-tight text-white sm:text-3xl lg:text-3xl xl:text-4xl">
            Still sending the same old resume?
          </h2>
          <p className="relative z-10 text-white text-lg leading-normal text-balance">
            Standing out in today&apos;s hiring process is harder than ever. The
            old playbook isn&apos;t enough.
          </p>
        </div>
        <div className="w-full self-stretch">
          <Link
            href="#early-access"
            className="flex items-center justify-center w-full rounded-2xl bg-white hover:bg-white/90 text-black px-6 py-4 text-base xl:text-xl font-normal shadow-md transition focus:outline-none focus:ring-2 focus:ring-(--brand-primary) focus:ring-offset-2 focus:ring-offset-(--secondary-background) disabled:opacity-70"
          >
            Get Started with MyHireView
          </Link>
        </div>
      </div>
    </div>
  );
}

function ProblemCard({
  Icon,
  label,
  description,
  isDarkMode,
}: {
  Icon: React.ElementType;
  label: string;
  description: string;
  isDarkMode: boolean;
}) {
  return (
    <motion.article
      key={label}
      className={`flex flex-col gap-4 rounded-2xl border-[0.5px] border-gray-200 p-6 md:p-8 2xl:p-10 shadow-sm transition duration-500 hover:shadow-md min-[1440px]:aspect-16/12 bg-white 
      `}
      variants={staggerItem}
    >
      <div
        className={`flex h-10 2xl:h-14 w-10 2xl:w-14 shrink-0 items-center justify-center rounded-xl border bg-[#f4f2f1]`}
      >
        <Icon className={`h-6 2xl:h-8 w-6 2xl:w-8 text-black`} />
      </div>
      <h3 className={`text-2xl xl:text-3xl 2xl:text-4xl font-light text-black`}>
        {label}
      </h3>
      <p
        className={`text-lg xl:text-xl font-extralight leading-snug xl:leading-normal mb-6 min-[1440px]:mb-0 text-black`}
      >
        {description}
      </p>
    </motion.article>
  );
}
