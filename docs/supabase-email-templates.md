# Supabase Email Templates

Följ dessa steg för att uppdatera e-postmallarna i Supabase så att de matchar Livsbalans designprofil.

## Instruktioner

1. Gå till [Supabase Dashboard](https://supabase.com/dashboard)
2. Välj ditt Livsbalans-projekt
3. Navigera till **Authentication** → **Email Templates**
4. Uppdatera varje mall (Confirm signup, Magic Link, Change Email, Reset Password) med HTML-koden nedan

---

## Confirm signup (Bekräfta registrering)

Kopiera och klistra in denna HTML i "Confirm signup"-mallen:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bekräfta din e-post - Livsbalans</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F2F5F7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F2F5F7;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 480px; background-color: #ffffff; border-radius: 24px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);">
          
          <!-- Header with Logo -->
          <tr>
            <td align="center" style="padding: 40px 40px 24px 40px;">
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="background: linear-gradient(135deg, #1a7a8a 0%, #125E6A 100%); width: 56px; height: 56px; border-radius: 14px; text-align: center; vertical-align: middle;">
                    <span style="font-size: 32px; color: white; font-weight: bold; line-height: 56px;">和</span>
                  </td>
                  <td style="padding-left: 12px;">
                    <span style="font-size: 24px; color: #2D3436; font-weight: 300; letter-spacing: -0.5px;">livsbalans.co</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 0 40px 24px 40px;">
              <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; color: #2D3436; text-align: center;">
                Välkommen till Livsbalans!
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #636E72; text-align: center;">
                Tack för att du registrerade dig. Klicka på knappen nedan för att bekräfta din e-postadress och komma igång.
              </p>
            </td>
          </tr>
          
          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding: 0 40px 32px 40px;">
              <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: linear-gradient(135deg, #1a7a8a 0%, #125E6A 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; padding: 14px 32px; border-radius: 12px;">
                Bekräfta e-post
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px 40px 40px; border-top: 1px solid #E1E8EB;">
              <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #636E72; text-align: center;">
                Om du inte registrerade dig på Livsbalans kan du ignorera detta mail.
              </p>
              <p style="margin: 16px 0 0 0; font-size: 13px; color: #636E72; text-align: center;">
                © {{ .SiteURL }} Livsbalans
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

**Subject:** Bekräfta din e-post - Livsbalans

---

## Reset Password (Återställ lösenord)

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Återställ lösenord - Livsbalans</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F2F5F7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F2F5F7;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 480px; background-color: #ffffff; border-radius: 24px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);">
          
          <!-- Header with Logo -->
          <tr>
            <td align="center" style="padding: 40px 40px 24px 40px;">
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="background: linear-gradient(135deg, #1a7a8a 0%, #125E6A 100%); width: 56px; height: 56px; border-radius: 14px; text-align: center; vertical-align: middle;">
                    <span style="font-size: 32px; color: white; font-weight: bold; line-height: 56px;">和</span>
                  </td>
                  <td style="padding-left: 12px;">
                    <span style="font-size: 24px; color: #2D3436; font-weight: 300; letter-spacing: -0.5px;">livsbalans.co</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 0 40px 24px 40px;">
              <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; color: #2D3436; text-align: center;">
                Återställ ditt lösenord
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #636E72; text-align: center;">
                Du har begärt att återställa ditt lösenord. Klicka på knappen nedan för att välja ett nytt lösenord.
              </p>
            </td>
          </tr>
          
          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding: 0 40px 32px 40px;">
              <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: linear-gradient(135deg, #1a7a8a 0%, #125E6A 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; padding: 14px 32px; border-radius: 12px;">
                Återställ lösenord
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px 40px 40px; border-top: 1px solid #E1E8EB;">
              <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #636E72; text-align: center;">
                Om du inte begärde en lösenordsåterställning kan du ignorera detta mail.
              </p>
              <p style="margin: 16px 0 0 0; font-size: 13px; color: #636E72; text-align: center;">
                © {{ .SiteURL }} Livsbalans
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

**Subject:** Återställ ditt lösenord - Livsbalans

---

## Magic Link

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Logga in - Livsbalans</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F2F5F7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F2F5F7;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 480px; background-color: #ffffff; border-radius: 24px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);">
          
          <!-- Header with Logo -->
          <tr>
            <td align="center" style="padding: 40px 40px 24px 40px;">
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="background: linear-gradient(135deg, #1a7a8a 0%, #125E6A 100%); width: 56px; height: 56px; border-radius: 14px; text-align: center; vertical-align: middle;">
                    <span style="font-size: 32px; color: white; font-weight: bold; line-height: 56px;">和</span>
                  </td>
                  <td style="padding-left: 12px;">
                    <span style="font-size: 24px; color: #2D3436; font-weight: 300; letter-spacing: -0.5px;">livsbalans.co</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 0 40px 24px 40px;">
              <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; color: #2D3436; text-align: center;">
                Din inloggningslänk
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #636E72; text-align: center;">
                Klicka på knappen nedan för att logga in på Livsbalans.
              </p>
            </td>
          </tr>
          
          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding: 0 40px 32px 40px;">
              <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: linear-gradient(135deg, #1a7a8a 0%, #125E6A 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; padding: 14px 32px; border-radius: 12px;">
                Logga in
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px 40px 40px; border-top: 1px solid #E1E8EB;">
              <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #636E72; text-align: center;">
                Om du inte begärde denna inloggningslänk kan du ignorera detta mail.
              </p>
              <p style="margin: 16px 0 0 0; font-size: 13px; color: #636E72; text-align: center;">
                © {{ .SiteURL }} Livsbalans
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

**Subject:** Din inloggningslänk - Livsbalans

---

## Change Email Address

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bekräfta ny e-post - Livsbalans</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F2F5F7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F2F5F7;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 480px; background-color: #ffffff; border-radius: 24px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);">
          
          <!-- Header with Logo -->
          <tr>
            <td align="center" style="padding: 40px 40px 24px 40px;">
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="background: linear-gradient(135deg, #1a7a8a 0%, #125E6A 100%); width: 56px; height: 56px; border-radius: 14px; text-align: center; vertical-align: middle;">
                    <span style="font-size: 32px; color: white; font-weight: bold; line-height: 56px;">和</span>
                  </td>
                  <td style="padding-left: 12px;">
                    <span style="font-size: 24px; color: #2D3436; font-weight: 300; letter-spacing: -0.5px;">livsbalans.co</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 0 40px 24px 40px;">
              <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; color: #2D3436; text-align: center;">
                Bekräfta din nya e-postadress
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #636E72; text-align: center;">
                Du har begärt att byta e-postadress. Klicka på knappen nedan för att bekräfta din nya adress.
              </p>
            </td>
          </tr>
          
          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding: 0 40px 32px 40px;">
              <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: linear-gradient(135deg, #1a7a8a 0%, #125E6A 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; padding: 14px 32px; border-radius: 12px;">
                Bekräfta e-post
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px 40px 40px; border-top: 1px solid #E1E8EB;">
              <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #636E72; text-align: center;">
                Om du inte begärde att byta e-postadress kan du ignorera detta mail.
              </p>
              <p style="margin: 16px 0 0 0; font-size: 13px; color: #636E72; text-align: center;">
                © {{ .SiteURL }} Livsbalans
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

**Subject:** Bekräfta din nya e-postadress - Livsbalans

---

## Viktiga noter

1. **Logotypen** är inline-stylad med CSS-gradienter för att undvika externa bildlänkar (som inte alltid fungerar i e-postklienter)
2. **Färgerna** matchar appens styleguide:
   - Bakgrund: `#F2F5F7` (mist)
   - Primär: `#125E6A` (teal)
   - Text: `#2D3436` (main) och `#636E72` (sub)
   - Border: `#E1E8EB` (soft)
3. **Variablerna** `{{ .ConfirmationURL }}` och `{{ .SiteURL }}` ersätts automatiskt av Supabase

