Number of issues: 60

<file name="lib/types/application.ts">

<violation number="1" location="lib/types/application.ts:287">
P1: The dashboard list projection omits `email`, `phone`, and `linkedin_url`, so every draft appears to lack the contact method required by `getListItemPublishBlockers`. Include these fields in the list type and query so complete drafts can be published from their cards.</violation>
</file>

<file name="components/admin/AdminModal.tsx">

<violation number="1" location="components/admin/AdminModal.tsx:231">
P1: This condition hides the entire custom footer when `headerClose` is set, removing the preview’s “Back to form” and “Publish” actions. Keep a supplied `footer` and suppress only the default Close footer.</violation>
</file>

<file name="app/api/applications/route.ts">

<violation number="1" location="app/api/applications/route.ts:394">
P1: When a create request omits `email`, this fallback stores the profile or account address even if `default_show_email` is false; stored contact values are exposed in the public DTO. Respect the profile visibility defaults for omitted email and phone fields.</violation>

<violation number="2" location="app/api/applications/route.ts:713">
P2: This publish gate now runs on every PUT to an application that is already `active`, not only when the request sets `status` to `active`. Active rows saved before these checks existed will get a 400 on unrelated edits such as `show_profile_picture` until every blocker is filled. Limit the gate to requests that set `status: "active"` or change publish-relevant fields, or confirm this strictness is intended.</violation>
</file>

<file name="components/forms/PrimaryCvLibrarySection.tsx">

<violation number="1" location="components/forms/PrimaryCvLibrarySection.tsx:95">
P2: Choosing Delete from the row menu unmounts the menu item, and the inline delete confirm never receives focus. Keyboard and screen-reader users lose their place in the modal. Move focus into the confirm (or back to the row) when `pendingDelete` is set in embedded mode.</violation>

<violation number="2" location="components/forms/PrimaryCvLibrarySection.tsx:412">
P2: Selecting a library résumé here bypasses the confirmation for replacing a saved tailored résumé. Route this selection through the same confirmation path before changing the CV source.</violation>
</file>

<file name="lib/utils/profile-with-saved-identity.ts">

<violation number="1" location="lib/utils/profile-with-saved-identity.ts:18">
P1: This returns a fresh object, so every profile field not listed here is dropped (contact_email, phone, default_show_*, collapse_about_you). Spread the existing profile first so the saved identity fields override it.</violation>
</file>

<file name="docs/manual-testing/MANUAL_TEST_CREATE_AND_EDIT_APPLICATION.md">

<violation number="1" location="docs/manual-testing/MANUAL_TEST_CREATE_AND_EDIT_APPLICATION.md:89">
P2: This Publish check contradicts the rest of the doc: Section 1 and Section 6 say Publish is disabled until the publish set is ready. Replace it with a check that the disabled Publish shows the **To publish, add…** list.</violation>
</file>

<file name="docs/retrospectives/APPLICATION_FORM_STEPS_F35.md">

<violation number="1" location="docs/retrospectives/APPLICATION_FORM_STEPS_F35.md:83">
P2: This table row says create offers **Publish** and must pass 'Publish → share page', but the Step map added above says publish-from-create is still `F41-127`. Pick one behavior and make both lines match.</violation>
</file>

<file name="components/forms/CandidateFieldsSection.tsx">

<violation number="1" location="components/forms/CandidateFieldsSection.tsx:120">
P2: Focus is lost for the First/Last name blocker. The empty-state `<p>` has no `id`, and the filled-state `<div>` is not focusable. `focusApplicationRow` therefore finds nothing to focus when a name is missing. Add `id={id}` and `tabIndex={-1}` to the empty-state `<p>`, and add `tabIndex={-1}` to the filled-state `<div>`.</violation>

<violation number="2" location="components/forms/CandidateFieldsSection.tsx:153">
P3: The read-only value `div` has `aria-label` but no role, and ARIA prohibits naming a generic element. Its row `<label htmlFor>` also targets a non-labelable element, so screen readers do not associate the field name with the value. Add `role="group"` to keep the name.</violation>

<violation number="3" location="components/forms/CandidateFieldsSection.tsx:180">
P3: The `layout = "stack"` default and its whole branch are unreachable, since the only caller passes `layout="rows"`. That branch duplicates the rows-branch JSX for names and share fields. Remove the stack branch and the `layout` prop, or make `rows` the only layout.</violation>
</file>

<file name="docs/product/APPLICATION_FORM_WORKFLOW.md">

<violation number="1" location="docs/product/APPLICATION_FORM_WORKFLOW.md:11">
P3: The doc contradicts itself on whether names get a red asterisk on create/draft. The Create intro says they are not starred there, while the About you paragraph says the name fields carry the asterisk. Clarify that the asterisk applies only on a live edit.</violation>

<violation number="2" location="docs/product/APPLICATION_FORM_WORKFLOW.md:19">
P2: Dirty edits do prompt before leaving: `hasEditProgress` feeds `leaveConfirmEnabled`, which is passed to `useLeaveConfirm`. Remove this claim; only localStorage draft persistence is create-only.</violation>
</file>

<file name="docs/architecture/ARCHITECTURE.md">

<violation number="1" location="docs/architecture/ARCHITECTURE.md:176">
P2: The `/admin/new` entry still describes the old one-chapter-at-a-time checklist, but the new create form is a single page with separate section cards. Update this route description to match the new layout.</violation>

<violation number="2" location="docs/architecture/ARCHITECTURE.md:396">
P3: The 'Profile snapshot on application' design row still lists only name, location, portfolio, and LinkedIn as snapshotted fields. Add email and phone so it matches Section 5.3 and the snapshot rule.</violation>
</file>

<file name="components/forms/YouTubeUrlInput.tsx">

<violation number="1" location="components/forms/YouTubeUrlInput.tsx:98">
P2: This full-list request can trigger up to 50 R2 `HeadObject` checks just to populate video choices. Use a lightweight endpoint or projection that returns prior video URLs without checking CV objects.</violation>

<violation number="2" location="components/forms/YouTubeUrlInput.tsx:221">
P2: Transient failures (5xx, 429, 401) are reported as `unavailable`, which the form treats as a private or non-embeddable video. That hard-blocks Save and draft Save until the user retypes the URL, with no retry control. Map non-422 failures to a separate non-blocking status, or keep them out of the `unavailable` path.</violation>
</file>

<file name="components/forms/SlugOrderDropdown.tsx">

<violation number="1" location="components/forms/SlugOrderDropdown.tsx:49">
P2: Selecting an option unmounts the focused option button without returning focus to the dropdown trigger, disrupting keyboard users’ tab sequence. Restore focus to the trigger after selection.</violation>

<violation number="2" location="components/forms/SlugOrderDropdown.tsx:112">
P2: Arrow-key navigation changes only the option’s visual highlight, so screen-reader users cannot tell which option Enter will select. Expose the active option to assistive technology or move focus through the options.</violation>
</file>

<file name="lib/utils/cv-filename.ts">

<violation number="1" location="lib/utils/cv-filename.ts:41">
P2: Letters that do not decompose under NFKD are stripped, so names in Cyrillic, CJK, or with characters like ø, ł, or đ are lost or mangled. A fully non-Latin name disappears from both the preview and the download. Keep Unicode letters and digits, for example with `\p{L}\p{N}` and the `u` flag.</violation>

<violation number="2" location="lib/utils/cv-filename.ts:118">
P2: A partial name is treated as a complete name in the preview. With only a first name, the preview shows `Joan-Spotify-Software-Engineer.pdf` and `isComplete` is true, so the incomplete warning is suppressed and the missing last name is never shown as `Last`. Fill each name part separately with its placeholder.</violation>
</file>

<file name="lib/utils/create-application-draft.ts">

<violation number="1" location="lib/utils/create-application-draft.ts:163">
P2: The email/phone default in `defaultIncludeFromValues` uses value presence, but the form defaults these toggles from `default_show_email` / `default_show_phone`. For users who turned those defaults off, an untouched create form is never treated as blank. That draft is then restored on return and arms leave confirm. Derive the email/phone default from the form's `initialInclude`, or ignore those include deltas in the blank check.</violation>
</file>

<file name="lib/types/primary-cv.ts">

<violation number="1" location="lib/types/primary-cv.ts:93">
P2: The new copy says affected applications will show “Résumé missing” on the dashboard, but the dashboard badge still reads “CV missing” (`CV_MISSING_LEGEND.label` in `application-status-display.ts`). Either rename that label too, or keep the “CV missing” wording here so the warning matches what users see.</violation>
</file>

<file name="components/forms/ProfileForm.tsx">

<violation number="1" location="components/forms/ProfileForm.tsx:209">
P2: The Email toggle reads Hidden when the Email field is empty, but the save persists `default_show_email: true` and new applications still show the account email. Compute availability with the same fallback the server and create page use: `resolveApplicationContactEmail`.</violation>

<violation number="2" location="components/forms/ProfileForm.tsx:351">
P2: LinkedIn and Portfolio show Hidden when their URL fails the default-show check, but the save still persists `true`, so new applications include the link anyway. Persist the effective value so the saved default matches the displayed toggle.</violation>
</file>

<file name="lib/validation/profile.ts">

<violation number="1" location="lib/validation/profile.ts:67">
P2: This `optionalNullableEmail` helper is an exact copy of the one in `lib/validation/application.ts`. Export it from here and import it in `application.ts` so the trim/blank-to-null and email rules live in one place.</violation>
</file>

<file name="docs/manual-testing/MANUAL_TEST_PRIMARY_CV_AND_STATUS.md">

<violation number="1" location="docs/manual-testing/MANUAL_TEST_PRIMARY_CV_AND_STATUS.md:55">
P2: The quoted confirm copy doesn't match the UI. The unused-primary confirm reads “Delete this library résumé? This cannot be undone.”, so update the quoted text to that.</violation>

<violation number="2" location="docs/manual-testing/MANUAL_TEST_PRIMARY_CV_AND_STATUS.md:70">
P3: The empty-library labels don't match the code. There is no "Upload primary CV" button, and the same “Manage library” / “Upload one to your library” controls show on both create and edit. Replace the create/edit split with the labels the UI actually renders.</violation>
</file>

<file name="lib/utils/youtube-preview.ts">

<violation number="1" location="lib/utils/youtube-preview.ts:43">
P2: This accepts non-YouTube hosts containing a `youtube.com/watch` substring because `extractVideoId` does not validate the URL host. Validate the parsed host before extracting the ID so unrelated URLs cannot pass the video check.</violation>
</file>

<file name="components/forms/ApplicationFormPreviewDialog.tsx">

<violation number="1" location="components/forms/ApplicationFormPreviewDialog.tsx:92">
P2: The preview body mounts even while the dialog is closed, because `AdminModal` always renders its children. That means the CV PDF in `ApplicationPageContent` loads and renders on every form mount. Wrap the modal body in `{open ? (...) : null}` so the PDF only loads when Preview is open.</violation>

<violation number="2" location="components/forms/ApplicationFormPreviewDialog.tsx:120">
P3: The `refetchApplication` no-op makes "Try again" in the preview a silent no-op when the saved CV is missing. Either hide the retry button in preview or give it a meaningful action.</violation>
</file>

<file name="components/forms/ApplicationFormSinglePageLayout.tsx">

<violation number="1" location="components/forms/ApplicationFormSinglePageLayout.tsx:96">
P3: `align` is threaded through `ApplicationFormPageRow` and every caller but never read, so setting it has no effect despite the type doc describing behavior. Remove the prop from the row type, the layout, and the call sites, or implement it.</violation>

<violation number="2" location="components/forms/ApplicationFormSinglePageLayout.tsx:206">
P2: The status tip button sits inside the field's `<label htmlFor>`. That breaks the label content model and folds the tip text (for example "Ready") into the field's accessible name. Move the tip outside the `<label>`, or render it as a non-labelable element such as a `<span>`.</violation>
</file>

<file name="docs/product/CREATE_FORM_FIELD_TRIM.md">

<violation number="1" location="docs/product/CREATE_FORM_FIELD_TRIM.md:119">
P2: The download-name toggle is marked Keep in the Résumé table but parked or dropped here and in the Scope line. Pick one call for the Original name switch and apply it in the table, the Scoreboard, and the Scope line.</violation>

<violation number="2" location="docs/product/CREATE_FORM_FIELD_TRIM.md:129">
P3: This describes the removed write-through design, contrary to the shipped model above and the workflow, which say application saves only snapshot values. Replace it with the Profile-only edit path.</violation>

<violation number="3" location="docs/product/CREATE_FORM_FIELD_TRIM.md:133">
P2: The status header says this trim is decided and live, but the open questions and suggested decision order still describe it as pending. Mark the open questions as resolved or move the decision-order section to a historical note so readers can tell what is final.</violation>
</file>

<file name="components/forms/FileUpload.tsx">

<violation number="1" location="components/forms/FileUpload.tsx:130">
P2: The status text says "Using the saved PDF for this role" even when `cvUrlExists` is false, and the warning right below says the file is not in storage. Show a different status (or none) when `showSaved && !cvUrlExists`.</violation>

<violation number="2" location="components/forms/FileUpload.tsx:150">
P3: The hidden file input still carries `aria-label={chooseLabel}`, so screen readers announce two controls with the same name, one of them a duplicate. Hide the input from the accessibility tree with `aria-hidden` so only the visible button is exposed.</violation>
</file>

<file name="docs/product/Backlog.md">

<violation number="1" location="docs/product/Backlog.md:317">
P2: `L13-130` reuses the number `130` already taken by the new `F42-130`. Per the ID convention, this should be the next unused number, `L13-131`. Update both the Could-table row and the sprint-table row.</violation>
</file>

<file name="app/api/profile/route.ts">

<violation number="1" location="app/api/profile/route.ts:188">
P2: The `existing` read ignores its error, so a failed SELECT makes every omitted field fall back to null or `true`. The upsert then overwrites a saved phone, contact email and visibility flags. Check the error and return a 500 unless it is the no-row case (`PGRST116`) before building `merged`.</violation>
</file>

<file name="components/admin/icons.tsx">

<violation number="1" location="components/admin/icons.tsx:469">
P3: `EyeIcon` and `EyeOffIcon` have no call sites, while `PasswordField` still defines its own toggle SVG. Use these exports there or remove the unused icon components to avoid maintaining duplicate, unused UI code.</violation>
</file>

<file name="docs/product/BEFORE_LAUNCH_PR_ORDER.md">

<violation number="1" location="docs/product/BEFORE_LAUNCH_PR_ORDER.md:19">
P3: This marks F40 and F41 as shipped, but the rollup still counts them as open. Either move them into the shipped list and update the open count, effort table, and weighted average, or keep them as planned and revert this wording. The sequence and phase text below still treat them as pending.</violation>
</file>

<file name="docs/manual-testing/MANUAL_TEST_PROFILE_CREATE_ON_PUT.md">

<violation number="1" location="docs/manual-testing/MANUAL_TEST_PROFILE_CREATE_ON_PUT.md:46">
P3: The picture control on the application form is labeled Visible / Hidden, not Show / Hide (Yes / No). Update this step to use those labels so the checklist matches the UI.</violation>

<violation number="2" location="docs/manual-testing/MANUAL_TEST_PROFILE_CREATE_ON_PUT.md:54">
P3: This step names a button that no longer exists on `/admin/profile`. Change “Save picture” to “Save profile” to match section 3 and ProfileForm.</violation>
</file>

<file name="components/forms/application-form-steps.ts">

<violation number="1" location="components/forms/application-form-steps.ts:88">
P3: These `APPLICATION_FORM_STEPS` copy edits reach no UI: the wizard and split layouts that read this array were deleted in this PR, and nothing else references it. Either delete the array and `ApplicationFormStepDef` (keeping `APPLICATION_FORM_STEP_IDS` and `applicationFormStepForErrors`, which are still used), or drop these copy changes so the dead data is not edited.</violation>
</file>

<file name="components/admin/CreateApplicationPage.tsx">

<violation number="1" location="components/admin/CreateApplicationPage.tsx:258">
P2: The new `!resolvedEmail` condition is effectively always false, because the account email fallback is always present for signed-in users. A saved profile with no location, links, or picture now never gets the nudge that asks for them. Drop the `!resolvedEmail` and `!profile?.phone?.trim()` conditions, or base them on `profile.contact_email` only.</violation>
</file>

<file name="components/admin/AdminPageSkeleton.tsx">

<violation number="1" location="components/admin/AdminPageSkeleton.tsx:134">
P2: The create/edit skeleton no longer sets a min-height, so it is not tall enough to keep the scrollbar stable. The file header and the F34 design note both call for tall shells. Restore `ADMIN_MAIN_MIN_CLASS` on the root, or update the header comment if the short shell is intended.</violation>
</file>

<file name="components/forms/CvSourceField.tsx">

<violation number="1" location="components/forms/CvSourceField.tsx:170">
P2: Creating the object URL inside `useMemo` is a render-time side effect, and the cleanup effect revokes it. In Strict Mode dev the Preview link can point to a revoked blob. Create and revoke the URL in one `useEffect` and store it in state.</violation>

<violation number="2" location="components/forms/CvSourceField.tsx:392">
P2: These buttons sit inside the radio `<label>`, which makes the radio's accessible name include the button text and is invalid HTML. Render the `tailoredPicker` and the Manage library button outside the `<label>` element, next to the radio row.</violation>
</file>

<file name="components/ui/ConfirmDialog.tsx">

<violation number="1" location="components/ui/ConfirmDialog.tsx:172">
P2: Clicking the mid action (Save Draft) does not set `confirmedRef`, so a successful save closes the dialog through the `open` effect and the `close` listener calls `onCancel`. Set `confirmedRef.current = true` before `onMidAction()` so only real cancels emit `onCancel`. A failed save leaves the dialog open, and Escape or Cancel already resets the flag.</violation>
</file>

<file name="docs/architecture/API_REFERENCE.md">

<violation number="1" location="docs/architecture/API_REFERENCE.md:198">
P3: The parenthetical implies company, role, and slug are only required for drafts. `applicationCreateSchema` requires them for every status, so replace '(required for draft)' with 'required' and keep the draft-only qualifier on `cv_url` and `video_url`.</violation>

<violation number="2" location="docs/architecture/API_REFERENCE.md:634">
P3: This new sentence says pictures are changed only on Profile, but the PUT /api/profile section still says a picture-only PUT from `/admin/new` can create or repair the row. Drop the `/admin/new` reference there, since New no longer uploads pictures.</violation>
</file>

<file name="__tests__/unit/lib/utils/application-form-preview.test.ts">

<violation number="1" location="__tests__/unit/lib/utils/application-form-preview.test.ts:44">
P3: Add a case where `cv_url` is set and `cv_exists: false`. That is the only path where the preview reports a missing résumé, and nothing currently asserts `cv_exists` is passed through as `false`.</violation>
</file>

<file name="docs/engineering/USER_GUIDE.md">

<violation number="1" location="docs/engineering/USER_GUIDE.md:22">
P3: Remove the internal ticket reference `F42-130` from this user-facing guide. Users cannot act on it, and it will go stale when the ticket closes. Keep the tab label description without the ID.</violation>
</file>

<file name="components/forms/ApplicationFormActions.tsx">

<violation number="1" location="components/forms/ApplicationFormActions.tsx:122">
P3: Publish is the only button in this footer without an explicit `shape`, so it renders pill while Save and Preview render rounded. Add `shape="rounded"` to match the other two, as `Button`'s doc asks for paired footers.</violation>
</file>

<file name="lib/types/database.ts">

<violation number="1" location="lib/types/database.ts:135">
P3: The `profiles` types are missing `collapse_about_you`, which migration 033 adds in this PR. Add it to Row as `collapse_about_you: boolean;` and to Insert and Update as `collapse_about_you?: boolean;` so this file matches the schema.</violation>
</file>

<file name="components/public/ApplicationPageHeader.tsx">

<violation number="1" location="components/public/ApplicationPageHeader.tsx:178">
P3: A phone value with no digits (e.g. "N/A") yields `href="tel:"`, a dead link. Render the `tel:` anchor only when the stripped value contains a digit, and show plain text otherwise.</violation>
</file>

<file name="supabase/migrations/032_drop_profiles_use_account_email.sql">

<violation number="1" location="supabase/migrations/032_drop_profiles_use_account_email.sql:4">
P3: Dropping `use_account_email` leaves `profiles.contact_email` documented as conditional on that removed toggle. Update the column comment to describe the editable email prefilled from the Auth account.</violation>
</file>

<file name="__tests__/unit/lib/application-validation.test.ts">

<violation number="1" location="__tests__/unit/lib/application-validation.test.ts:288">
P3: The new publish-blocker tests skip the primary-CV branch (`cv_type: "primary"` with a missing `primary_cv_id`), plus the Company, Role, and application-link blockers. Add cases for these so a regression in the publish gate is caught.</violation>
</file>
