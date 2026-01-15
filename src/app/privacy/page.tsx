"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-heading font-bold text-primary">
            Integritetspolicy
          </h1>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Personuppgiftsansvarig</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Personuppgiftsansvarig för behandlingen av personuppgifter är:
              </p>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>livsbalans.co</strong>
                </p>
                <p>Augustendalsvägen 33</p>
                <p>131 52 NACKA STRAND</p>
                <p>
                  E-post:{" "}
                  <a
                    href="mailto:info@livsbalans.co"
                    className="text-primary hover:underline"
                  >
                    info@livsbalans.co
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Vilka personuppgifter samlas in?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Vi samlar in och behandlar följande personuppgifter:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                <li>
                  <strong>E-postadress</strong> – för autentisering och
                  kommunikation
                </li>
                <li>
                  <strong>Användar-ID</strong> – för att identifiera din
                  användare i systemet
                </li>
                <li>
                  <strong>Bedömningar och data</strong> – dina poängbedömningar
                  (dimension_scores), orsaksanalyser (dimension_causes),
                  målbilder (dimension_goals) och handlingsplaner
                  (dimension_tasks)
                </li>
                <li>
                  <strong>Metadata</strong> – när kontot skapades och när
                  uppgifter senast uppdaterades
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Rättslig grund för behandlingen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Vi behandlar dina personuppgifter baserat på{" "}
                <strong>berättigat intresse</strong> enligt artikel 6.1 f i
                GDPR. Vårt berättigade intresse är att tillhandahålla en
                personlig livsbalans-tjänst där du kan bedöma och förbättra din
                livssituation.
              </p>
              <p className="text-sm text-muted-foreground">
                Du har rätt att invända mot behandlingen av dina
                personuppgifter baserat på berättigat intresse. Kontakta oss på{" "}
                <a
                  href="mailto:info@livsbalans.co"
                  className="text-primary hover:underline"
                >
                  info@livsbalans.co
                </a>{" "}
                om du vill invända.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Hur behandlas dina uppgifter?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Dina personuppgifter behandlas av Supabase, som fungerar som
                vår databehandlare (processor). Supabase lagrar dina uppgifter
                säkert och är GDPR-compliant enligt deras Data Processing
                Agreement (DPA).
              </p>
              <p className="text-sm text-muted-foreground">
                Alla tabeller i databasen har Row Level Security (RLS) för att
                säkerställa att endast du kan se och hantera din egen data.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Användning av tredjepartstjänster</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                För autentisering använder vi:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                <li>
                  <strong>Supabase Auth</strong> – för autentisering med
                  e-post/lösenord
                </li>
                <li>
                  <strong>Google OAuth</strong> – om du väljer att logga in med
                  Google-konto
                </li>
                <li>
                  <strong>Microsoft OAuth</strong> – om du väljer att logga in
                  med Microsoft-konto
                </li>
              </ul>
              <p className="text-sm text-muted-foreground">
                När du använder OAuth-tjänster (Google eller Microsoft) kan
                dessa leverantörer behandla vissa personuppgifter enligt deras
                egna integritetspolicyer. Vi rekommenderar att du läser deras
                policyer.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Cookies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Vi använder cookies endast för att:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                <li>
                  <strong>Autentisering</strong> – för att hålla dig inloggad
                  via Supabase Auth
                </li>
                <li>
                  <strong>Lokal lagring</strong> – för att spara inställningar
                  i din webbläsare (t.ex. onboarding-status)
                </li>
              </ul>
              <p className="text-sm text-muted-foreground">
                Vi använder inte tracking-cookies eller analytics-cookies som
                samlar in information om ditt användningsbeteende.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Dina rättigheter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enligt GDPR har du följande rättigheter:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                <li>
                  <strong>Rätt till åtkomst</strong> – Du har rätt att få
                  information om vilka personuppgifter vi behandlar om dig
                </li>
                <li>
                  <strong>Rätt till rättelse</strong> – Du har rätt att få
                  felaktiga personuppgifter rättade
                </li>
                <li>
                  <strong>Rätt till radering</strong> – Du har rätt att få dina
                  personuppgifter raderade. Du kan radera dina uppgifter i
                  inställningar
                </li>
                <li>
                  <strong>Rätt till dataportabilitet</strong> – Du har rätt att
                  få dina personuppgifter i ett strukturerat, allmänt använt och
                  maskinläsbart format. Du kan exportera dina data i
                  inställningar
                </li>
                <li>
                  <strong>Rätt att invända</strong> – Du har rätt att invända
                  mot behandlingen av dina personuppgifter baserat på
                  berättigat intresse
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Säkerhet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Vi vidtar lämpliga tekniska och organisatoriska åtgärder för
                att skydda dina personuppgifter, inklusive:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                <li>Kryptering av data under överföring (HTTPS)</li>
                <li>Kryptering av data i vila</li>
                <li>Row Level Security (RLS) i databasen</li>
                <li>Säker autentisering via Supabase Auth</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Kontakt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Om du har frågor om denna integritetspolicy eller vill
                utöva dina rättigheter, kontakta oss på:
              </p>
              <p className="text-sm">
                <a
                  href="mailto:info@livsbalans.co"
                  className="text-primary hover:underline"
                >
                  info@livsbalans.co
                </a>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Ändringar i integritetspolicyn</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Vi förbehåller oss rätten att ändra denna integritetspolicy.
                Eventuella ändringar kommer att publiceras på denna sida med
                uppdaterat datum. Vi rekommenderar att du regelbundet läser
                igenom denna policy för att hålla dig informerad om hur vi
                behandlar dina personuppgifter.
              </p>
              <p className="text-sm text-muted-foreground">
                Senast uppdaterad: {new Date().toLocaleDateString("sv-SE")}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
