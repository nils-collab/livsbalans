# Supabase Email Templates

Följ dessa steg för att uppdatera e-postmallarna i Supabase så att de matchar Livsbalans designprofil.

## Instruktioner

1. Gå till [Supabase Dashboard](https://supabase.com/dashboard)
2. Välj ditt Livsbalans-projekt
3. Navigera till **Authentication** → **Email Templates**
4. Uppdatera varje mall (Confirm signup, Magic Link, Change Email, Reset Password) med HTML-koden nedan

---

## Confirm signup (Bekräfta registrering)

**Subject:** `Bekräfta din e-post - Livsbalans`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Bekräfta din e-post</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="480" cellspacing="0" cellpadding="0" border="0" style="max-width: 480px; width: 100%; background-color: #ffffff; border-radius: 16px;">
          
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 40px 40px 24px 40px;">
              <span style="font-size: 20px; color: #333333; font-weight: 400;">livsbalans.co</span>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 0 40px 24px 40px;">
              <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 700; color: #333333; text-align: center; line-height: 1.3;">
                Välkommen till Livsbalans!
              </h1>
              <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.6; color: #666666; text-align: center;">
                Tack för att du registrerade dig. Klicka på knappen nedan för att bekräfta din e-postadress.
              </p>
            </td>
          </tr>
          
          <!-- Button -->
          <tr>
            <td align="center" style="padding: 0 40px 40px 40px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="background-color: #125E6A; border-radius: 8px;">
                    <a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=signup" target="_blank" style="display: inline-block; padding: 16px 32px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px;">
                      Bekräfta e-post
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="border-top: 1px solid #eeeeee;"></div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px 40px 40px;">
              <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #999999; text-align: center;">
                Om du inte registrerade dig på Livsbalans kan du ignorera detta mail.
              </p>
              <p style="margin: 16px 0 0 0; font-size: 14px; color: #999999; text-align: center;">
                © <a href="https://livsbalans.co" style="color: #125E6A; text-decoration: none;">livsbalans.co</a>
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

---

## Reset Password (Återställ lösenord)

**Subject:** `Återställ ditt lösenord - Livsbalans`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Återställ lösenord</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="480" cellspacing="0" cellpadding="0" border="0" style="max-width: 480px; width: 100%; background-color: #ffffff; border-radius: 16px;">
          
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 40px 40px 24px 40px;">
              <span style="font-size: 20px; color: #333333; font-weight: 400;">livsbalans.co</span>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 0 40px 24px 40px;">
              <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 700; color: #333333; text-align: center; line-height: 1.3;">
                Återställ ditt lösenord
              </h1>
              <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.6; color: #666666; text-align: center;">
                Du har begärt att återställa ditt lösenord. Klicka på knappen nedan för att välja ett nytt lösenord.
              </p>
            </td>
          </tr>
          
          <!-- Button -->
          <tr>
            <td align="center" style="padding: 0 40px 40px 40px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="background-color: #125E6A; border-radius: 8px;">
                    <a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=recovery" target="_blank" style="display: inline-block; padding: 16px 32px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px;">
                      Återställ lösenord
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="border-top: 1px solid #eeeeee;"></div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px 40px 40px;">
              <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #999999; text-align: center;">
                Om du inte begärde en lösenordsåterställning kan du ignorera detta mail.
              </p>
              <p style="margin: 16px 0 0 0; font-size: 14px; color: #999999; text-align: center;">
                © <a href="https://livsbalans.co" style="color: #125E6A; text-decoration: none;">livsbalans.co</a>
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

---

## Magic Link

**Subject:** `Din inloggningslänk - Livsbalans`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Logga in</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="480" cellspacing="0" cellpadding="0" border="0" style="max-width: 480px; width: 100%; background-color: #ffffff; border-radius: 16px;">
          
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 40px 40px 24px 40px;">
              <span style="font-size: 20px; color: #333333; font-weight: 400;">livsbalans.co</span>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 0 40px 24px 40px;">
              <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 700; color: #333333; text-align: center; line-height: 1.3;">
                Din inloggningslänk
              </h1>
              <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.6; color: #666666; text-align: center;">
                Klicka på knappen nedan för att logga in på Livsbalans.
              </p>
            </td>
          </tr>
          
          <!-- Button -->
          <tr>
            <td align="center" style="padding: 0 40px 40px 40px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="background-color: #125E6A; border-radius: 8px;">
                    <a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=magiclink" target="_blank" style="display: inline-block; padding: 16px 32px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px;">
                      Logga in
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="border-top: 1px solid #eeeeee;"></div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px 40px 40px;">
              <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #999999; text-align: center;">
                Om du inte begärde denna inloggningslänk kan du ignorera detta mail.
              </p>
              <p style="margin: 16px 0 0 0; font-size: 14px; color: #999999; text-align: center;">
                © <a href="https://livsbalans.co" style="color: #125E6A; text-decoration: none;">livsbalans.co</a>
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

---

## Change Email Address

**Subject:** `Bekräfta din nya e-postadress - Livsbalans`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Bekräfta ny e-post</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="480" cellspacing="0" cellpadding="0" border="0" style="max-width: 480px; width: 100%; background-color: #ffffff; border-radius: 16px;">
          
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 40px 40px 24px 40px;">
              <span style="font-size: 20px; color: #333333; font-weight: 400;">livsbalans.co</span>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 0 40px 24px 40px;">
              <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 700; color: #333333; text-align: center; line-height: 1.3;">
                Bekräfta din nya e-postadress
              </h1>
              <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.6; color: #666666; text-align: center;">
                Du har begärt att byta e-postadress. Klicka på knappen nedan för att bekräfta din nya adress.
              </p>
            </td>
          </tr>
          
          <!-- Button -->
          <tr>
            <td align="center" style="padding: 0 40px 40px 40px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="background-color: #125E6A; border-radius: 8px;">
                    <a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email_change" target="_blank" style="display: inline-block; padding: 16px 32px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px;">
                      Bekräfta e-post
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="border-top: 1px solid #eeeeee;"></div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px 40px 40px;">
              <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #999999; text-align: center;">
                Om du inte begärde att byta e-postadress kan du ignorera detta mail.
              </p>
              <p style="margin: 16px 0 0 0; font-size: 14px; color: #999999; text-align: center;">
                © <a href="https://livsbalans.co" style="color: #125E6A; text-decoration: none;">livsbalans.co</a>
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

---

## Viktiga förbättringar i dessa templates

1. **"Bulletproof" knappar** - Bakgrundsfärgen är på en `<td>` istället för `<a>`, vilket fungerar i alla mailklienter
2. **Forcerad light mode** - `color-scheme: light` och `supported-color-schemes: light` förhindrar dark mode-invertering
3. **Token-based URLs** - Använder `token_hash` istället för `ConfirmationURL` för bättre kompatibilitet
4. **Inga gradienter** - Solid färg (`#125E6A`) som fungerar överallt
5. **Explicit `border="0"`** - Förhindrar oönskade borders i äldre mailklienter
6. **Enklare design** - Renare HTML som renderas konsekvent

