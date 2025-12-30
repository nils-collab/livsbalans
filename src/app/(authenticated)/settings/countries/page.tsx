"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/types/database";

type Country = Tables<"countries">;

export default function CountriesPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    currency_code: "",
  });

  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    fetchCountries();
  }, []);

  async function fetchCountries() {
    const { data, error } = await supabase
      .from("countries")
      .select("*")
      .order("name");

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch countries",
        variant: "destructive",
      });
    } else {
      setCountries(data || []);
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (editingCountry) {
      const { error } = await supabase
        .from("countries")
        .update({
          name: formData.name,
          code: formData.code.toUpperCase(),
          currency_code: formData.currency_code.toUpperCase(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingCountry.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update country",
          variant: "destructive",
        });
      } else {
        toast({ title: "Success", description: "Country updated" });
        fetchCountries();
      }
    } else {
      const { error } = await supabase.from("countries").insert({
        name: formData.name,
        code: formData.code.toUpperCase(),
        currency_code: formData.currency_code.toUpperCase(),
      });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to create country",
          variant: "destructive",
        });
      } else {
        toast({ title: "Success", description: "Country created" });
        fetchCountries();
      }
    }

    setDialogOpen(false);
    resetForm();
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from("countries").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete country. It may have related data.",
        variant: "destructive",
      });
    } else {
      toast({ title: "Success", description: "Country deleted" });
      fetchCountries();
    }
  }

  function resetForm() {
    setFormData({ name: "", code: "", currency_code: "" });
    setEditingCountry(null);
  }

  function openEditDialog(country: Country) {
    setEditingCountry(country);
    setFormData({
      name: country.name,
      code: country.code,
      currency_code: country.currency_code,
    });
    setDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Countries</h1>
          <p className="text-muted-foreground mt-1">
            Manage countries and their currencies
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Country
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingCountry ? "Edit Country" : "Add Country"}
                </DialogTitle>
                <DialogDescription>
                  Enter the country details below
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Country Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Sweden"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="code">Country Code</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    placeholder="SE"
                    maxLength={3}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="currency">Currency Code</Label>
                  <Input
                    id="currency"
                    value={formData.currency_code}
                    onChange={(e) =>
                      setFormData({ ...formData, currency_code: e.target.value })
                    }
                    placeholder="SEK"
                    maxLength={3}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">
                  {editingCountry ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Countries</CardTitle>
          <CardDescription>
            Countries determine the currency for sales and media spend
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading...
            </div>
          ) : countries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No countries yet. Add your first country to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {countries.map((country) => (
                  <TableRow key={country.id}>
                    <TableCell className="font-medium">{country.name}</TableCell>
                    <TableCell>{country.code}</TableCell>
                    <TableCell>{country.currency_code}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(country)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(country.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}




