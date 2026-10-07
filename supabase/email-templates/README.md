# Supabase Auth email templates (MECE branding, 2026-10-08)

Supabase sends the sign-up confirmation, password reset, magic link, email-change
and invite emails itself, from the templates in the Supabase dashboard — NOT from
lib/email/templates.ts. These files give them the same look as the site's own emails
(navy header with the MECE logo, red rule, Team MECE footer). Images are served from
https://www.mece.in/signature/ (public/signature/).

Where: Supabase -> your project -> Authentication -> Emails (Templates).
For each template: set the Subject, open the message body (source/HTML), replace it
with the file below, Save.

| Supabase template      | File                    | Subject                        |
|------------------------|-------------------------|--------------------------------|
| Confirm signup         | confirm-signup.html     | Confirm your MECE account      |
| Change email address   | change-email.html       | Confirm your email for MECE    |
| Reset password         | reset-password.html     | Reset your MECE password       |
| Magic link             | magic-link.html         | Your MECE login link           |
| Invite user            | invite-user.html        | You're invited to MECE         |
| Reauthentication       | reauthentication.html   | Your MECE verification code    |

The button link is `{{ .ConfirmationURL }}` — Supabase's standard link, which ends at
/auth/callback on the site (PKCE). If a CURRENT template uses a different link (for
example one containing `token_hash`), keep that link: replace both
`{{ .ConfirmationURL }}` occurrences in the new file with it before saving.
"Change email address" is also what a guest receives when they save their work with
email + password (GuestSaveWall), so its wording fits both cases.
