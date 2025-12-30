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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { formatMonth } from "@/lib/utils";
import type { Tables } from "@/types/database";

type Country = Tables<"countries">;
type ExchangeRate = Tables<"exchange_rates"> & {
  countries?: Country;
};

export default function ExchangeRatesPage() {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<ExchangeRate | null>(null);
  const [formData, setFormData] = useState({
    country_id: "",
    month: "",
    rate_to_eur: "",
  });

  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [ratesResult, countriesResult] = await Promise.all([
      supabase
        .from("exchange_rates")
        .select("*, countries(*)")
        .order("month", { ascending: false }),
      supabase.from("countries").select("*").order("name"),
    ]);

    if (ratesResult.error || countriesResult.error) {
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    } else {
      setRates(ratesResult.data || []);
      setCountries(countriesResult.data || []);
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const rateValue = parseFloat(formData.rate_to_eur);
    if (isNaN(rateValue) || rateValue <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid exchange rate",
        variant: "destructive",
      });
      return;
    }

    if (editingRate) {
      const { error } = await supabase
        .from("exchange_rates")
        .update({
          country_id: formData.country_id,
          month: formData.month,
          rate_to_eur: rateValue,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingRate.id);

      if (error) {
        toast({
          title: "Error",
          description: error.message.includes("duplicate")
            ? "Rate for this country/month already exists"
            : "Failed to update rate",
          variant: "destructive",
        });
      } else {
        toast({ title: "Success", description: "Exchange rate updated" });
        fetchData();
      }
    } else {
      const { error } = await supabase.from("exchange_rates").insert({
        country_id: formData.country_id,
        month: formData.month,
        rate_to_eur: rateValue,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message.includes("duplicate")
            ? "Rate for this country/month already exists"
            : "Failed to create rate",
          variant: "destructive",
        });
      } else {
        toast({ title: "Success", description: "Exchange rate created" });
        fetchData();
      }
    }

    setDialogOpen(false);
    resetForm();
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from("exchange_rates").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete rate",
        variant: "destructive",
      });
    } else {
      toast({ title: "Success", description: "Exchange rate deleted" });
      fetchData();
    }
  }

  function resetForm() {
    setFormData({ country_id: "", month: "", rate_to_eur: "" });
    setEditingRate(null);
  }

  function openEditDialog(rate: ExchangeRate) {
    setEditingRate(rate);
    setFormData({
      country_id: rate.country_id,
      month: rate.month,
      rate_to_eur: rate.rate_to_eur.toString(),
    });
    setDialogOpen(true);
  }

  // Get current month in YYYY-MM-DD format
  const currentMonth = new Date().toISOString().slice(0, 7) + "-01";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Exchange Rates</h1>
          <p className="text-muted-foreground mt-1">
            Monthly exchange rates to EUR for currency conversion
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Rate
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingRate ? "Edit Exchange Rate" : "Add Exchange Rate"}
                </DialogTitle>
                <DialogDescription>
                  Enter the exchange rate to convert local currency to EUR
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="country">Country</Label>
                  <Select
                    value={formData.country_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, country_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.id} value={country.id}>
                          {country.name} ({country.currency_code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Month</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      value={formData.month ? formData.month.slice(5, 7) : ""}
                      onValueChange={(month) => {
                        const year = formData.month ? formData.month.slice(0, 4) : new Date().getFullYear().toString();
                        setFormData({ ...formData, month: `${year}-${month}-01` });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="01">January</SelectItem>
                        <SelectItem value="02">February</SelectItem>
                        <SelectItem value="03">March</SelectItem>
                        <SelectItem value="04">April</SelectItem>
                        <SelectItem value="05">May</SelectItem>
                        <SelectItem value="06">June</SelectItem>
                        <SelectItem value="07">July</SelectItem>
                        <SelectItem value="08">August</SelectItem>
                        <SelectItem value="09">September</SelectItem>
                        <SelectItem value="10">October</SelectItem>
                        <SelectItem value="11">November</SelectItem>
                        <SelectItem value="12">December</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={formData.month ? formData.month.slice(0, 4) : ""}
                      onValueChange={(year) => {
                        const month = formData.month ? formData.month.slice(5, 7) : "01";
                        setFormData({ ...formData, month: `${year}-${month}-01` });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => {
                          const year = new Date().getFullYear() - 5 + i;
                          return (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="rate">Rate to EUR</Label>
                  <Input
                    id="rate"
                    type="number"
                    step="0.000001"
                    value={formData.rate_to_eur}
                    onChange={(e) =>
                      setFormData({ ...formData, rate_to_eur: e.target.value })
                    }
                    placeholder="e.g., 11.5 for SEK (1 EUR = 11.5 SEK)"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    How many units of local currency equals 1 EUR
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={!formData.country_id}>
                  {editingRate ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Exchange Rates</CardTitle>
          <CardDescription>
            Rates are used to convert local currency amounts to EUR for reporting
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading...
            </div>
          ) : countries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Add countries first before setting exchange rates.
            </div>
          ) : rates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No exchange rates yet. Add rates for each country/month combination.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Country</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Month</TableHead>
                  <TableHead>Rate to EUR</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rates.map((rate) => (
                  <TableRow key={rate.id}>
                    <TableCell className="font-medium">
                      {rate.countries?.name}
                    </TableCell>
                    <TableCell>{rate.countries?.currency_code}</TableCell>
                    <TableCell>{formatMonth(rate.month)}</TableCell>
                    <TableCell>{rate.rate_to_eur}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(rate)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(rate.id)}
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

