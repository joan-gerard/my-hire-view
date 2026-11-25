import {
  applicationHasVisibleRecruiterContact,
  hasVisibleRecruiterContact,
  resolveApplicationContactEmail,
} from "@/lib/utils/profile-contact";

describe("resolveApplicationContactEmail", () => {
  it("prefers contact_email when set", () => {
    expect(
      resolveApplicationContactEmail(
        { contact_email: "hire@example.com" },
        "account@example.com",
      ),
    ).toBe("hire@example.com");
  });

  it("falls back to the account email when contact_email is empty", () => {
    expect(
      resolveApplicationContactEmail(
        { contact_email: null },
        "account@example.com",
      ),
    ).toBe("account@example.com");
    expect(
      resolveApplicationContactEmail({}, "  account@example.com  "),
    ).toBe("account@example.com");
    expect(
      resolveApplicationContactEmail(null, "account@example.com"),
    ).toBe("account@example.com");
  });

  it("returns null when neither source has a value", () => {
    expect(resolveApplicationContactEmail({ contact_email: "  " }, "")).toBeNull();
    expect(resolveApplicationContactEmail(null, null)).toBeNull();
  });
});

describe("hasVisibleRecruiterContact", () => {
  it("accepts a shown email, phone, or LinkedIn", () => {
    expect(
      hasVisibleRecruiterContact({
        email: "a@b.com",
        phone: null,
        linkedin_url: null,
        showEmail: true,
        showPhone: false,
        showLinkedin: false,
      }),
    ).toBe(true);
    expect(
      hasVisibleRecruiterContact({
        email: null,
        phone: "+1 555",
        linkedin_url: null,
        showEmail: false,
        showPhone: true,
        showLinkedin: false,
      }),
    ).toBe(true);
    expect(
      hasVisibleRecruiterContact({
        email: null,
        phone: null,
        linkedin_url: "https://linkedin.com/in/x",
        showEmail: false,
        showPhone: false,
        showLinkedin: true,
      }),
    ).toBe(true);
  });

  it("rejects hidden or empty contact channels", () => {
    expect(
      hasVisibleRecruiterContact({
        email: "a@b.com",
        phone: "+1 555",
        linkedin_url: null,
        showEmail: false,
        showPhone: false,
        showLinkedin: false,
      }),
    ).toBe(false);
    expect(
      hasVisibleRecruiterContact({
        email: "",
        phone: "  ",
        linkedin_url: null,
        showEmail: true,
        showPhone: true,
        showLinkedin: true,
      }),
    ).toBe(false);
  });
});

describe("applicationHasVisibleRecruiterContact", () => {
  it("treats stored values as visible", () => {
    expect(
      applicationHasVisibleRecruiterContact({
        email: null,
        phone: null,
        linkedin_url: "https://linkedin.com/in/x",
      }),
    ).toBe(true);
    expect(
      applicationHasVisibleRecruiterContact({
        email: null,
        phone: null,
        linkedin_url: null,
      }),
    ).toBe(false);
  });
});
