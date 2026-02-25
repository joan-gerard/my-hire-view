"use client";

import Image from "next/image";
import { FAQ_IMAGE } from "./constants";

const SUPPORT_EMAIL = "support@myhireview.com";

/**
 * Contact card shown beside the FAQ list: decorative image, "Still have questions?"
 * copy, and support email link. Used in the FAQ section layout.
 */
export function FAQContactCard() {
  return (
    <div className="relative aspect-video lg:aspect-auto flex flex-col p-10 justify-center lg:justify-between w-full overflow-hidden lg:col-span-1 bg-slate-600 text-white rounded-3xl">
      <div className="flex flex-col gap-6">
        <Image
          src={FAQ_IMAGE}
          alt="Customer service"
          width={80}
          height={80}
          className="rounded-full"
        />
        <p className="text-4xl">Still have questions?</p>
        <p className="text-lg 2xl:text-xl font-light text-balance">
          Can&apos;t find the answer you&apos;re looking for? Please send us an
          email.
        </p>
      </div>
      <p className="text-lg 2xl:text-xl font-light">
        We&apos;re available at:{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold">
          {SUPPORT_EMAIL}
        </a>
      </p>
    </div>
  );
}
