"use client";

import {
  staggerContainer,
  staggerItem,
  transition,
  viewport,
} from "@/lib/landing-animations";
import { motion } from "framer-motion";
import { useState } from "react";
import { SectionBadge } from "../ui/SectionBadge";
import type { WaitlistFormStatus } from "./WaitlistSignupForm";
import { WaitlistSignupForm } from "./WaitlistSignupForm";
import { WaitlistSuccessMessage } from "./WaitlistSuccessMessage";

const BACKGROUND_IMAGE = "/images/diego-ph-@jdiegoph-1920-2400.jpg";

/** Stronger stagger for this section so each element is clearly sequential */
const emailSectionStagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.22, delayChildren: 0.12 },
  },
} as const;

/**
 * Email capture form for the pre-launch landing page.
 * Submits to /api/waitlist; shows success message and early bird incentive per LANDING_PAGE_BRIEF.
 */
export default function EmailCaptureForm() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [jobSearchStatus, setJobSearchStatus] = useState("Actively searching");
  const [primaryGoal, setPrimaryGoal] = useState("");
  const [careerStage, setCareerStage] = useState("");
  const [status, setStatus] = useState<WaitlistFormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");
    setStatus("loading");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          first_name: firstName.trim(),
          job_search_status: jobSearchStatus,
          primary_goal: primaryGoal.trim() || undefined,
          career_stage: careerStage.trim() || undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(
          data?.error ?? "Something went wrong. Please try again.",
        );
        return;
      }

      setStatus("success");
      setEmail("");
      setFirstName("");
      setJobSearchStatus("Actively searching");
      setPrimaryGoal("");
      setCareerStage("");
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  }

  const sectionClassName =
    "mx-4 px-4 py-16 sm:px-6 sm:py-8 lg:px-10 lg:py-12 2xl:py-16 min-h-[520px] flex flex-col justify-center rounded-2xl bg-[#f4f2f1]";

  return (
    <section id="early-access" className={sectionClassName}>
      <motion.div
        className="w-full flex flex-col gap-4 items-start px-4"
        initial={staggerContainer.initial}
        whileInView={staggerContainer.whileInView}
        viewport={viewport}
        variants={emailSectionStagger}
        transition={transition}
      >
        <motion.div variants={staggerItem}>
          <SectionBadge label="Early Sign Up" />
        </motion.div>
        <motion.div
          className="grid grid-cols-2 gap-4 w-full"
          variants={staggerItem}
        >
          <motion.div className="max-w-lg flex flex-col gap-4">
            <motion.h2
              className="text-6xl font-light tracking-wide text-(--brand-primary) text-balance"
              variants={staggerItem}
            >
              Be the first to stand out
            </motion.h2>
            <motion.p
              className="text-xl sm:text-2xl font-light text-black/60 text-balance"
              variants={staggerItem}
            >
              Early signups get 3 months of Pro free when we launch!
            </motion.p>
          </motion.div>
          {/* <motion.div
            className="rounded-3xl bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${BACKGROUND_IMAGE})` }}
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={viewport}
            transition={transition}
          /> */}
          <motion.div
            className="w-full h-full min-h-[440px] rounded-3xl flex flex-col pr-12"
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={viewport}
            transition={transition}
          >
            {status === "success" ? (
              <WaitlistSuccessMessage />
            ) : (
              <WaitlistSignupForm
                handleSubmit={handleSubmit}
                email={email}
                setEmail={setEmail}
                firstName={firstName}
                setFirstName={setFirstName}
                jobSearchStatus={jobSearchStatus}
                setJobSearchStatus={setJobSearchStatus}
                primaryGoal={primaryGoal}
                setPrimaryGoal={setPrimaryGoal}
                careerStage={careerStage}
                setCareerStage={setCareerStage}
                errorMessage={errorMessage}
                status={status}
              />
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
