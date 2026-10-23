# Profile picture dialog — UI breakdown

Source: `components/forms/ProfilePictureModal.tsx` (shared `Button` from `components/ui/Button.tsx`).  
Opened from New / Edit application via **Add profile picture** / **Manage picture** on `ProfilePictureField` (`usage="application"`). Pass `usage="account"` when reusing on Profile. Native `<dialog>` (`showModal`); nested `ConfirmDialog` only for discard.

Tokens from `app/globals.css` (F34).

| Token | Value |
| --- | --- |
| `--ink` | `#0b0b0c` |
| `--white` | `#ffffff` |
| `--muted` | `#6a6e6e` |
| `--lime` | `#9efc65` |
| `--status-danger-fg` / `--status-danger-bg` / `--status-danger-solid` | `#b42318` / `#fde8e4` / `#b42318` |
| `--status-wash-notice` | `#fff1b8` |
| Heading font | Switzer (`font-heading`) |

---

## Copy

| Element | Text |
| --- | --- |
| Title | Profile picture |
| Helper lead — empty, `usage="application"` | This picture will show on this application. You can turn it off later. |
| Helper lead — empty, `usage="account"` | This picture will be available on applications where you choose to show it. |
| Helper lead — account already has a saved picture | Replaces your picture on all your applications. |
| Helper lead — pending remove | Removes your picture from your account. Applications that show it will be marked Picture missing. (no separate emphasis) |
| Helper emphasis — save | Your new picture goes live when you click Save picture. |
| Status line (one slot under helper) | Default: JPEG, PNG or WebP, up to 5 MB. · Pending new: **Not saved yet** · Pending remove: **Will be removed when you save** (same place; avoids layout shift) |
| Media actions | Circular icon controls on the avatar’s right edge (`ProfilePictureIconActions`): camera = choose/change; red × = discard new or mark remove (`aria-label`s keep the names). Dialog uses `size="md"`; Profile uses `size="sm"` so controls scale with the smaller circle. Camera stays in the lower slot when × is hidden (spacer reserves the top). |
| Primary — new / replace | **Save picture** (disabled when nothing has changed) |
| Primary — remove only | **Remove and save** (same footer order as Save: primary then Cancel) |
| Loading | **Uploading…** → **Saving…**, or **Removing…** |
| Dismiss | **Cancel** / **Close** (when notice or error and not dirty) |
| Discard confirm | Discard picture changes? / Your picture changes aren’t saved yet. Discard them? / **Discard** · **Keep editing** |
| Live region examples | `New picture selected: {filename}. Not saved yet.` · `New picture discarded…` · `Picture marked for removal…` · `Uploading…` / `Saving…` / `Removing…` |
| Errors | Please choose a JPEG, PNG or WebP image. · Image must be 5 MB or smaller. · That took too long… · Couldn’t save… · upload/API errors |
| Warnings | Mapped via `mapProfileSaveWarnings` (plain sentences + generic fallback) — never raw API strings |

**Size rule:** max `5 * 1024 * 1024` bytes inclusive. Copy uses **5 MB** (space).

**Field side effects after save:** set show to **No** on remove. Set show to **Yes** only when there was **no** saved picture before (first picture). Replacing while show is **No** leaves the toggle alone.

---

## Dialog chrome

- Width `min(100vw - 2rem, 26rem)`; max-height `min(90vh, 36rem)` + `overflow-y-auto`.
- `rounded-[28px]`, `--white`, backdrop 40% black (no backdrop dismiss).
- On open: reset local state; focus Choose/Change.

### Dismiss

- Dirty → discard confirm; Escape blocked while loading; Escape on confirm closes confirm only.
- Valid new file / **Discard new** / **Remove** clear notice/error as appropriate.
- Invalid file sets error only (pending unchanged).

### Vertical order

1. Title → helper → status line (limits / Not saved yet / Will be removed…)  
2. Warning / error banners  
3. Live region (`sr-only`)  
4. Media row  
5. Footer: **primary then dismiss** (DOM = visual = tab order)

### Responsive (`min-[400px]`)

- Media stays stacked (avatar + edge controls) at all widths.
- Narrow: footer column with Save/Remove on top, Cancel/Close below.
- Wide (`min-[400px]`): footer row `justify-end`, primary then dismiss (primary left of dismiss in the end group).

---

## States

| State | Preview | Media | Primary | Dismiss | Notes |
| --- | --- | --- | --- | --- | --- |
| **Empty** | Lime / icon | Camera | Save (disabled) | Cancel | Helper depends on `usage` |
| **Saved** | Saved photo | Camera + red × | Save (disabled) | Cancel | |
| **Pending new** | Preview; status line = Not saved yet | Camera + red × (discard new) | Save | Cancel → discard | × discards the new file only |
| **Pending remove** | Left placeholder; status line = Will be removed when you save | Camera only | Remove and save | Cancel → discard | Short helper; status line replaces limits |
| **Uploading** / **Saving** | Unchanged | Disabled | Spinner labels | Disabled | 30s timeout → error + retry; Cancel still disabled until timeout/error |
| **Warning** | Saved result | Per empty/saved | Save (disabled) | **Close** | Friendly mapped notice |

### Transitions

| From → To | Trigger |
| --- | --- |
| Empty / Saved → Pending new | Choose/Change + valid file |
| Pending new → Saved or Empty | **Discard new** (clears pending; restores prior preview) |
| Saved → Pending remove | **Remove** |
| Pending new (had account picture) → Pending remove | **not** via Remove — user must **Discard new** first, then **Remove** |
| Pending remove → Pending new | **Choose picture** + valid file |
| Pending remove → closed (not removed) | Cancel → Discard |
| Pending new → Uploading → Saving | Save (first attempt) |
| Pending new → Saving | Save with `uploadedUrl` (retry) |
| Pending remove → Saving | Remove and save |
| Uploading/Saving → Error (+ prior dirty) | Failure or 30s timeout |
| Dirty → Warning / closed | Save success with / without warnings |
| Warning/Error → Pending new | Valid file |
| Warning/Error → Pending remove | **Remove** (saved preview only) |
| Discard confirm → closed / prior dirty | Discard / Keep editing |

---

## Upload path and partial failure

1. Upload writes a **unique** object `{userId}/{uuid}.{ext}` (`upsert: false`) — never overwrites the committed URL.
2. Successful `PUT /api/profile` commits the new URL, then deletes the previous object and purges other folder files (existing server cleanup).
3. If PUT fails after upload: retry reuses `uploadedUrl` (no second upload). Discard/close leaves an unused object until a later successful picture commit purges extras — live apps keep showing the old URL.
4. Upload and PUT use a **30s** abort timeout (`PROFILE_PICTURE_REQUEST_TIMEOUT_MS`).

---

## Nested discard confirm

Escape closes only the confirm. Keep editing restores focus to primary if actionable, else Choose/Change. Discard closes parent; field returns focus to the trigger.

---

## Media

One layout for all states: left avatar with camera / red × on the circle’s right edge; pending cues share the status line under the helper (not under the avatar). Modal avatar **192×192** (`h-48`) with **md** edge controls (`h-11` / `gap-16`); Profile **144→160** (`h-36` / `sm:h-40`) with **sm** controls (`h-9` / `gap-10`); field thumbnail **96×96** (`h-24`). Cancel abandons pending remove (discard confirm).

---

## Buttons / a11y

- Footer `shape="rounded"` on both actions; DOM order primary → dismiss for save and remove (primary on top when stacked).
- Primary is `disabled` when nothing has changed (or while loading).
- Live region: clear then set (and include filename) so repeat picks re-announce.
- Initial focus camera (choose/change); close returns to field trigger (**Add profile picture** / **Manage picture**).

---

## Error / warning banners

Error: danger wash + `FiAlertCircle` + `role="alert"`.  
Warning: `--status-wash-notice` + `FiAlertTriangle` + `role="status"`.

---

## Related field

Yes/No only when a picture exists. Show → **Yes** only on first saved picture; remove → **No**; replace leaves toggle. Missing-picture notice (cool blue). Dashboard **Picture missing** badge → `/admin/profile` (account surface; modal there should use `usage="account"`).

---

## Known gaps

| Gap | Notes |
| --- | --- |
| Application count in helper | “Used on N applications” still needs a cheap count. |
| Cancel abort mid-request | Cancel stays disabled while in flight; **30s timeout** unblocks with retry copy. Full Cancel→AbortController still deferred. |
| Interactive crop | Circle `object-cover` preview only; no reposition/zoom. |
| Orphan after discard | Unique-path orphans are not live; purged on a later successful picture commit. No explicit “delete unused upload” control. |
| Primary shape product-wide | Footer uses `shape="rounded"`; elsewhere primary stays pill. |
| Profile page modal wiring | `usage="account"` is ready; Profile still uses inline upload UI today. |
