"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Gauge, 
  Search, 
  Target, 
  Star,
  LayoutDashboard,
  ChevronRight,
  ChevronLeft,
  X
} from "lucide-react";

const ONBOARDING_KEY = "livsbalans_onboarding_completed";

interface OnboardingGuideProps {
  onComplete?: () => void;
}

export function OnboardingGuide({ onComplete }: OnboardingGuideProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if onboarding has been shown
    const hasCompleted = localStorage.getItem(ONBOARDING_KEY);
    if (!hasCompleted) {
      // Small delay to let the page load first
      const timer = setTimeout(() => setIsOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setIsOpen(false);
    onComplete?.();
  };

  const handleSkip = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setIsOpen(false);
  };

  const steps = [
    {
      icon: <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
        <span className="text-4xl">和</span>
      </div>,
      title: "Välkommen till Livsbalans",
      description: "En enkel metod för att reflektera över din livssituation och skapa positiv förändring – ett steg i taget.",
      highlight: null,
    },
    {
      icon: <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
        <Gauge className="w-8 h-8 text-primary" />
      </div>,
      title: "1. Bedöm ditt nuläge",
      description: "Hur nöjd är du inom sex viktiga livsområden? Dra i reglagen för att sätta din poäng.",
      highlight: "nulage",
    },
    {
      icon: <div className="w-16 h-16 rounded-2xl bg-yellow-100 flex items-center justify-center">
        <Star className="w-8 h-8 text-yellow-500" />
      </div>,
      title: "2. Välj fokusområden",
      description: "Klicka på stjärnan ⭐ vid 1-2 områden du vill fokusera på först. Att fokusera ger bättre resultat än att försöka ändra allt på en gång.",
      highlight: "nulage",
    },
    {
      icon: <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
        <Search className="w-8 h-8 text-primary" />
      </div>,
      title: "3. Förstå orsakerna",
      description: "Varför ser det ut som det gör? Att förstå orsakerna hjälper dig hitta rätt lösningar.",
      highlight: "orsaker",
    },
    {
      icon: <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
        <Target className="w-8 h-8 text-primary" />
      </div>,
      title: "4. Skapa en plan",
      description: "Vad vill du börja, sluta eller fortsätta med? Lägg till konkreta aktiviteter och prioritera.",
      highlight: "mal",
    },
    {
      icon: <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
        <LayoutDashboard className="w-8 h-8 text-primary" />
      </div>,
      title: "5. Följ upp i Översikten",
      description: "I Översikt-fliken ser du dina fokusområden och kan ladda ner en PDF-sammanställning. Återkom regelbundet för att se dina framsteg!",
      highlight: "oversikt",
    },
  ];

  if (!isOpen) return null;

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleSkip}
      />

      {/* Modal */}
      <div className="relative bg-card rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors z-10"
          aria-label="Stäng"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 pt-6">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentStep 
                  ? "w-6 bg-primary" 
                  : index < currentStep 
                    ? "bg-primary/50" 
                    : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="p-8 pt-6 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            {step.icon}
          </div>

          {/* Title */}
          <h2 className="text-2xl font-heading font-semibold text-foreground mb-3">
            {step.title}
          </h2>

          {/* Description */}
          <p className="text-muted-foreground leading-relaxed mb-6">
            {step.description}
          </p>

          {/* Features list (for menu step) */}
          {step.features && (
            <div className="space-y-3 mb-6">
              {step.features.map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 bg-muted/50 rounded-xl p-3 text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    {feature.icon}
                  </div>
                  <span className="text-sm text-foreground">{feature.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="px-8 pb-8 flex gap-3">
          {!isFirstStep && (
            <Button
              variant="outline"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="flex-1"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Tillbaka
            </Button>
          )}
          
          {isLastStep ? (
            <Button
              onClick={handleComplete}
              className="flex-1"
            >
              Kom igång!
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="flex-1"
            >
              Nästa
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>

        {/* Skip link */}
        {!isLastStep && (
          <div className="pb-6 text-center">
            <button
              onClick={handleSkip}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Hoppa över introduktionen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Hook to reset onboarding (useful for testing)
export function useResetOnboarding() {
  return () => {
    localStorage.removeItem(ONBOARDING_KEY);
    window.location.reload();
  };
}

