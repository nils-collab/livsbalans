"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Trash2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { deleteUserAccount } from "@/lib/api";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/auth/login");
      } else {
        setUser(user);
        setLoading(false);
      }
    });
  }, [router]);

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "RADERA") {
      alert('Skriv "RADERA" för att bekräfta');
      return;
    }

    setIsDeleting(true);
    const success = await deleteUserAccount();

    if (success) {
      router.push("/auth/login");
    } else {
      alert("Något gick fel. Försök igen eller kontakta support.");
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Inställningar</h1>
        </div>

        <div className="space-y-6">
          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle>Kontoinformation</CardTitle>
              <CardDescription>Din kontoinformation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">E-post</Label>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Konto skapat</Label>
                <p className="font-medium">
                  {new Date(user?.created_at).toLocaleDateString("sv-SE")}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Share App */}
          <Card>
            <CardHeader>
              <CardTitle>Dela appen</CardTitle>
              <CardDescription>
                Dela Livsbalans med andra personer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={typeof window !== "undefined" ? window.location.origin : ""}
                  className="flex-1"
                />
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.origin);
                    alert("Länk kopierad!");
                  }}
                >
                  Kopiera
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Farlig zon
              </CardTitle>
              <CardDescription>
                Åtgärder här kan inte ångras
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Radera mitt konto
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-5 w-5" />
                      Radera konto
                    </DialogTitle>
                    <DialogDescription>
                      Detta kommer att permanent radera ditt konto och all din data.
                      Denna åtgärd kan inte ångras.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <p className="text-sm">
                      Följande data kommer att raderas:
                    </p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      <li>Dina poängbedömningar</li>
                      <li>Dina orsaksanalyser</li>
                      <li>Dina målbilder</li>
                      <li>Dina uppgifter och planer</li>
                    </ul>
                    <div className="space-y-2">
                      <Label htmlFor="confirm">
                        Skriv <strong>RADERA</strong> för att bekräfta
                      </Label>
                      <Input
                        id="confirm"
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        placeholder="RADERA"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setDialogOpen(false);
                        setDeleteConfirmation("");
                      }}
                    >
                      Avbryt
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirmation !== "RADERA" || isDeleting}
                    >
                      {isDeleting ? "Raderar..." : "Radera permanent"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

