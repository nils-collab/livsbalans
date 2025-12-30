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
import { formatCurrency, formatMonth, formatNumber } from "@/lib/utils";
import type { Tables } from "@/types/database";

type Country = Tables<"countries">;
type Product = Tables<"products">;
type SalesChannel = Tables<"sales_channels">;
type Sale = Tables<"sales"> & {
  countries?: Country;
  products?: Product;
  sales_channels?: SalesChannel;
};

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [salesChannels, setSalesChannels] = useState<SalesChannel[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [formData, setFormData] = useState({
    country_id: "",
    product_id: "",
    sales_channel_id: "",
    month: "",
    revenue_local: "",
    units: "",
    notes: "",
  });

  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [salesResult, countriesResult, productsResult, channelsResult] = await Promise.all([
      supabase
        .from("sales")
        .select("*, countries(*), products(*), sales_channels(*)")
        .order("month", { ascending: false }),
      supabase.from("countries").select("*").order("name"),
      supabase.from("products").select("*").order("name"),
      supabase.from("sales_channels").select("*").order("name"),
    ]);

    if (salesResult.error || countriesResult.error || productsResult.error || channelsResult.error) {
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    } else {
      setSales(salesResult.data || []);
      setCountries(countriesResult.data || []);
      setProducts(productsResult.data || []);
      setSalesChannels(channelsResult.data || []);
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const revenue = parseFloat(formData.revenue_local);
    const units = parseInt(formData.units);

    if (isNaN(revenue) || revenue < 0) {
      toast({ title: "Error", description: "Please enter a valid revenue", variant: "destructive" });
      return;
    }

    if (isNaN(units) || units < 0) {
      toast({ title: "Error", description: "Please enter valid units", variant: "destructive" });
      return;
    }

    if (editingSale) {
      const { error } = await supabase
        .from("sales")
        .update({
          country_id: formData.country_id,
          product_id: formData.product_id,
          sales_channel_id: formData.sales_channel_id,
          month: formData.month,
          revenue_local: revenue,
          units: units,
          notes: formData.notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingSale.id);

      if (error) {
        toast({ title: "Error", description: "Failed to update sale", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Sale updated" });
        fetchData();
      }
    } else {
      const { error } = await supabase.from("sales").insert({
        country_id: formData.country_id,
        product_id: formData.product_id,
        sales_channel_id: formData.sales_channel_id,
        month: formData.month,
        revenue_local: revenue,
        units: units,
        notes: formData.notes || null,
      });

      if (error) {
        toast({ title: "Error", description: "Failed to create sale", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Sale created" });
        fetchData();
      }
    }

    setDialogOpen(false);
    resetForm();
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from("sales").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete sale", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Sale deleted" });
      fetchData();
    }
  }

  function resetForm() {
    setFormData({
      country_id: "",
      product_id: "",
      sales_channel_id: "",
      month: "",
      revenue_local: "",
      units: "",
      notes: "",
    });
    setEditingSale(null);
  }

  function openEditDialog(sale: Sale) {
    setEditingSale(sale);
    setFormData({
      country_id: sale.country_id,
      product_id: sale.product_id,
      sales_channel_id: sale.sales_channel_id,
      month: sale.month,
      revenue_local: sale.revenue_local.toString(),
      units: sale.units.toString(),
      notes: sale.notes || "",
    });
    setDialogOpen(true);
  }

  const selectedCountry = countries.find((c) => c.id === formData.country_id);
  const selectedProduct = products.find((p) => p.id === formData.product_id);

  // Calculate gross profit for display
  function calculateGrossProfit(sale: Sale) {
    if (!sale.products) return null;
    const revenue = sale.revenue_local;
    const cogs = sale.units * sale.products.cogs_eur;
    // Note: This is simplified - we'd need exchange rate for proper conversion
    return revenue - cogs;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sales</h1>
          <p className="text-muted-foreground mt-1">
            Track monthly product sales by channel
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button disabled={countries.length === 0 || products.length === 0 || salesChannels.length === 0}>
              <Plus className="h-4 w-4 mr-2" />
              Add Sale
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingSale ? "Edit Sale" : "Add Sale"}
                </DialogTitle>
                <DialogDescription>
                  Enter the monthly sales data for a product
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Country</Label>
                    <Select
                      value={formData.country_id}
                      onValueChange={(value) => setFormData({ ...formData, country_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.id} value={country.id}>
                            {country.name}
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
                </div>

                <div className="grid gap-2">
                  <Label>Product</Label>
                  <Select
                    value={formData.product_id}
                    onValueChange={(value) => setFormData({ ...formData, product_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                          {product.sku && ` (${product.sku})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedProduct && (
                    <p className="text-xs text-muted-foreground">
                      COGS: {formatCurrency(selectedProduct.cogs_eur)}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label>Sales Channel</Label>
                  <Select
                    value={formData.sales_channel_id}
                    onValueChange={(value) => setFormData({ ...formData, sales_channel_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select channel" />
                    </SelectTrigger>
                    <SelectContent>
                      {salesChannels.map((channel) => (
                        <SelectItem key={channel.id} value={channel.id}>
                          {channel.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Revenue ({selectedCountry?.currency_code || "local"})</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.revenue_local}
                      onChange={(e) => setFormData({ ...formData, revenue_local: e.target.value })}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Units Sold</Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.units}
                      onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                      placeholder="0"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Notes (optional)</Label>
                  <Input
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={
                    !formData.country_id ||
                    !formData.product_id ||
                    !formData.sales_channel_id
                  }
                >
                  {editingSale ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Sales</CardTitle>
          <CardDescription>
            Monthly sales data by product and channel
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : sales.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No sales records yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Units</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>{formatMonth(sale.month)}</TableCell>
                    <TableCell>{sale.countries?.name}</TableCell>
                    <TableCell className="font-medium">{sale.products?.name}</TableCell>
                    <TableCell>{sale.sales_channels?.name}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(sale.revenue_local, sale.countries?.currency_code)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatNumber(sale.units)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(sale)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(sale.id)}>
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

