# Supabase Auth Setup Guide

This guide walks you through configuring Supabase Authentication for MyHireView: enabling the Email provider and optionally customizing email templates.

---

## 1. Enable the Email provider

1. Open your [Supabase Dashboard](https://app.supabase.com) and select your project.
2. In the left sidebar, go to **Authentication** → **Providers**.
3. Find **Email** in the list and click it to expand.
4. Turn **Enable Email provider** **ON** (toggle to the right).
5. (Optional) Configure:
   - **Confirm email**: Turn **ON** if you want users to verify their email before signing in. When ON, Supabase sends a confirmation link; users must click it before they can sign in. For development you can leave this **OFF** so signup works immediately.
   - **Secure email change**: Turn **ON** to require confirmation when users change their email.
6. Click **Save** (or ensure the page has auto-saved).

Your app can now use **Sign up** and **Sign in with password** (email + password). Sign up also collects first and last name (stored in Auth `user_metadata` along with an opaque `public_id` for share URLs; a `profiles` row is created later on first profile save).

---

## 2. (Optional) Configure email templates

Supabase sends transactional emails for signup confirmation, password reset, and magic links. You can customize the content and styling.

1. In the dashboard, go to **Authentication** → **Email Templates**.
2. Select a template from the dropdown and edit as needed.

### Templates overview

| Template | When it's sent | Typical use |
|----------|----------------|-------------|
| **Confirm signup** | After a user signs up (when "Confirm email" is enabled) | Verify email address |
| **Magic Link** | When using "Sign in with magic link" | Passwordless sign-in |
| **Change Email Address** | When a user requests an email change | Confirm new email |
| **Reset Password** | When a user requests a password reset | Set new password |

### Variables you can use

Inside templates you can use these placeholders (syntax may be `{{ .Variable }}` or similar in your dashboard):

- `{{ .ConfirmationURL }}` – Link user must click (e.g. confirm signup, reset password)
- `{{ .Email }}` – User’s email
- `{{ .Token }}` – Raw token (used in custom flows)
- `{{ .TokenHash }}` – Hash of the token
- `{{ .SiteURL }}` – Site URL from your project settings

### Example: Confirm signup

**Subject (example):**
```
Confirm your signup for MyHireView
```

**Body (example):**
```html
<h2>Confirm your signup</h2>
<p>Follow this link to confirm your account:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm my email</a></p>
<p>If you didn't sign up for MyHireView, you can ignore this email.</p>
```

### Site URL (required for links in emails)

For confirmation and password-reset links to work, Supabase must know your app URL:

1. Go to **Authentication** → **URL Configuration** (or **Project Settings** → **Authentication**).
2. Set **Site URL** to:
   - Development: `http://localhost:3000`
   - Production: `https://your-domain.com`
3. (Optional) Add **Redirect URLs** if you use custom callback paths, e.g.:
   - `http://localhost:3000/**`
   - `https://your-domain.com/**`

Save the changes.

### Auth callback route (required for email links)

MyHireView exchanges Supabase email confirmation and password-reset codes on:

- `http://localhost:3000/auth/callback`
- `https://your-domain.com/auth/callback`

Make sure this path is included in **Redirect URLs** in Supabase so the callback can complete.

---

## 3. Quick checklist

- [ ] **Authentication** → **Providers** → **Email** is **Enabled**.
- [ ] **Confirm email** is set as you want (ON for production, OFF is fine for local dev).
- [ ] **Authentication** → **URL Configuration**: **Site URL** is set (e.g. `http://localhost:3000` for dev).
- [ ] (Optional) **Email Templates** updated for Confirm signup, Magic Link, Reset Password, etc.

After this, sign up and sign in with email/password in your app will use the Email provider and, if enabled, the confirmation and password-reset emails you configured.
