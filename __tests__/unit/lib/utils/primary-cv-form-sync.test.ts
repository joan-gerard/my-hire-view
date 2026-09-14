/**
 * Tests for ApplicationForm vs library-modal primary-CV load races.
 * F15-049: do not overwrite an explicit CV source choice on create.
 */
import { describe, expect, it } from "vitest";
import {
  isCurrentPrimaryCvLoad,
  shouldApplyInitialCvModeDefault,
  shouldAutoSelectFirstPrimaryOnLibraryFill,
} from "@/lib/utils/primary-cv-form-sync";

describe("isCurrentPrimaryCvLoad", () => {
  it("accepts the latest generation", () => {
    expect(isCurrentPrimaryCvLoad(2, 2)).toBe(true);
  });

  it("rejects a slower GET after the modal bumped generation", () => {
    expect(isCurrentPrimaryCvLoad(1, 2)).toBe(false);
  });

  it("rejects unmounted fetches even when generation matches", () => {
    expect(isCurrentPrimaryCvLoad(1, 1, true)).toBe(false);
  });
});

describe("shouldApplyInitialCvModeDefault", () => {
  it("defaults on create when the user has not chosen yet", () => {
    expect(
      shouldApplyInitialCvModeDefault({
        hasSavedCvType: false,
        userChoseCvMode: false,
      }),
    ).toBe(true);
  });

  it("does not default when the user already chose or edit has a saved type", () => {
    expect(
      shouldApplyInitialCvModeDefault({
        hasSavedCvType: false,
        userChoseCvMode: true,
      }),
    ).toBe(false);
    expect(
      shouldApplyInitialCvModeDefault({
        hasSavedCvType: true,
        userChoseCvMode: false,
      }),
    ).toBe(false);
  });
});

describe("shouldAutoSelectFirstPrimaryOnLibraryFill", () => {
  it("selects the first primary on create when the library was empty", () => {
    expect(
      shouldAutoSelectFirstPrimaryOnLibraryFill({
        hadPrimaryCvs: false,
        isCreate: true,
        listLength: 1,
      }),
    ).toBe(true);
  });

  it("does not override edit mode when the modal fills first", () => {
    expect(
      shouldAutoSelectFirstPrimaryOnLibraryFill({
        hadPrimaryCvs: false,
        isCreate: false,
        listLength: 2,
      }),
    ).toBe(false);
  });

  it("does not run when the library is still empty", () => {
    expect(
      shouldAutoSelectFirstPrimaryOnLibraryFill({
        hadPrimaryCvs: false,
        isCreate: true,
        listLength: 0,
      }),
    ).toBe(false);
  });

  it("does not force primary when the user already chose a CV source", () => {
    expect(
      shouldAutoSelectFirstPrimaryOnLibraryFill({
        hadPrimaryCvs: false,
        isCreate: true,
        listLength: 1,
        userChoseCvMode: true,
      }),
    ).toBe(false);
  });
});
