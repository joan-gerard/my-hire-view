import { resolveApplicationContactEmail } from "@/lib/utils/profile-contact";

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
