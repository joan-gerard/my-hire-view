"use client";

import { fadeUp, transition, viewport } from "@/lib/landing-animations";
import { motion } from "framer-motion";
import { useState } from "react";
import { SectionBadge } from "../ui/SectionBadge";
import type { WaitlistFormStatus } from "./WaitlistSignupForm";
import { WaitlistSignupForm } from "./WaitlistSignupForm";
import { WaitlistSuccessMessage } from "./WaitlistSuccessMessage";

const BACKGROUND_IMAGE = "/images/diego-ph-@jdiegoph-1920-2400.jpg";

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
    "px-4 py-16 sm:px-6 sm:py-20 lg:px-8 min-h-[520px] flex flex-col justify-center items-center";

  return (
    <motion.section
      id="early-access"
      className={sectionClassName}
      initial={fadeUp.initial}
      whileInView={fadeUp.whileInView}
      viewport={viewport}
      transition={transition}
    >
      <div className="w-full max-w-5xl text-center flex flex-col items-center gap-4">
        <SectionBadge label="Early Sign Up" />
        <h2 className="text-6xl font-light tracking-wide text-[var(--brand-primary)]">
          Be the first to stand out
        </h2>
        <p className="text-xl sm:text-2xl font-light text-[#94877c] text-balance">
          Early signups get 3 months of Pro free when we launch!
        </p>
        <div className="grid grid-cols-2 gap-4 w-full">
          <div
            className="rounded-3xl bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${BACKGROUND_IMAGE})` }}
          />
          <div className="bg-(--brand-surface) w-full h-full min-h-[440px] p-8 rounded-3xl flex flex-col">
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
          </div>
        </div>
      </div>
    </motion.section>
  );
}
