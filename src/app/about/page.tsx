"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-heading font-bold text-primary">
            Om livsbalans.co
          </h1>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  Livsbalans.co är mitt drömprojekt, skapat ur en personlig övertygelse: ett gott liv kräver balans. Inte perfektion, utan medvetenhet.
                </p>

                <p>
                  Jag har själv lärt mig vikten av balans den hårda vägen. Att skapa balans är ett ständigt arbete – livet händer, planer ändras och ibland behöver vi stanna upp. Hur mår jag egentligen? Vad vill jag? Och hur når jag dit?
                </p>

                <p>
                  Det här verktyget är en hjälp för dig att börja reflektera. Det är en startpunkt. Vill du fördjupa din resa genom coaching? Jag hjälper dig gärna vidare.
                </p>
              </div>

              <div className="flex flex-col items-center gap-4 pt-4">
                <div className="relative w-32 h-32 sm:w-40 sm:h-40">
                  <Image
                    src="/pia-photo.jpg"
                    alt="Pia"
                    fill
                    className="rounded-full object-cover"
                    sizes="(max-width: 640px) 128px, 160px"
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Kontakt:</p>
                  <a
                    href="mailto:pia@livsbalans.co"
                    className="text-primary hover:underline font-medium"
                  >
                    pia@livsbalans.co
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
