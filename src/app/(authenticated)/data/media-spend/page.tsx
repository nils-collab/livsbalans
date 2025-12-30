"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { formatCurrency, formatMonth } from "@/lib/utils";
import type { Tables } from "@/types/database";

type Country = Tables<"countries">;
type MediaChannel = Tables<"media_channels">;
type MediaSubChannel = Tables<"media_sub_channels">;
type Creative = Tables<"creatives">;
type Product = Tables<"products">;
type MediaSpend = Tables<"media_spend"> & {
  countries?: Country;
  media_channels?: MediaChannel;
  media_sub_channels?: MediaSubChannel | null;
  creatives?: Creative | null;
};
type MediaSpendProduct = Tables<"media_spend_products"> & {
  products?: Product;
};

export default function MediaSpendPage() {
  const [spendRecords, setSpendRecords] = useState<MediaSpend[]>([]);
  const [spendProducts, setSpendProducts] = useState<MediaSpendProduct[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [mediaChannels, setMediaChannels] = useState<MediaChannel[]>([]);
  const [subChannels, setSubChannels] = useState<MediaSubChannel[]>([]);
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSpend, setEditingSpend] = useState<MediaSpend | null>(null);
  const [formData, setFormData] = useState({
    country_id: "",
    month: "",
    amount_local: "",
    channel_id: "",
    sub_channel_id: "",
    creative_id: "",
    distribute_evenly: false,
    notes: "",
    product_ids: [] as string[],
  });

  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [
      spendResult,
      spendProductsResult,
      countriesResult,
      channelsResult,
      subChannelsResult,
      creativesResult,
      productsResult,
    ] = await Promise.all([
      supabase
        .from("media_spend")
        .select("*, countries(*), media_channels(*), media_sub_channels(*), creatives(*)")
        .order("month", { ascending: false }),
      supabase.from("media_spend_products").select("*, products(*)"),
      supabase.from("countries").select("*").order("name"),
      supabase.from("media_channels").select("*").order("name"),
      supabase.from("media_sub_channels").select("*").order("name"),
      supabase.from("creatives").select("*").order("name"),
      supabase.from("products").select("*").order("name"),
    ]);

    if (spendResult.error || countriesResult.error || channelsResult.error) {
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    } else {
      setSpendRecords(spendResult.data || []);
      setSpendProducts(spendProductsResult.data || []);
      setCountries(countriesResult.data || []);
      setMediaChannels(channelsResult.data || []);
      setSubChannels(subChannelsResult.data || []);
      setCreatives(creativesResult.data || []);
      setProducts(productsResult.data || []);
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const amount = parseFloat(formData.amount_local);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Error", description: "Please enter a valid amount", variant: "destructive" });
      return;
    }

    // Get products to allocate to (from creative or manual selection)
    let productIds = formData.product_ids;
    if (formData.creative_id && formData.creative_id !== "__none__") {
      const { data: creativeProducts } = await supabase
        .from("creative_products")
        .select("product_id")
        .eq("creative_id", formData.creative_id);
      productIds = creativeProducts?.map((cp) => cp.product_id) || [];
    }

    if (productIds.length === 0) {
      toast({ title: "Error", description: "Select products or a creative", variant: "destructive" });
      return;
    }

    if (editingSpend) {
      // Update spend record
      const { error: updateError } = await supabase
        .from("media_spend")
        .update({
          country_id: formData.country_id,
          month: formData.month,
          amount_local: amount,
          channel_id: formData.channel_id,
          sub_channel_id: formData.sub_channel_id && formData.sub_channel_id !== "__none__" ? formData.sub_channel_id : null,
          creative_id: formData.creative_id && formData.creative_id !== "__none__" ? formData.creative_id : null,
          distribute_evenly: formData.distribute_evenly,
          notes: formData.notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingSpend.id);

      if (updateError) {
        toast({ title: "Error", description: "Failed to update spend", variant: "destructive" });
        return;
      }

      // Delete existing allocations and re-create
      await supabase.from("media_spend_products").delete().eq("media_spend_id", editingSpend.id);

      const allocatedAmount = formData.distribute_evenly ? amount / productIds.length : amount / productIds.length;
      await supabase.from("media_spend_products").insert(
        productIds.map((productId) => ({
          media_spend_id: editingSpend.id,
          product_id: productId,
          allocated_amount_local: allocatedAmount,
        }))
      );

      toast({ title: "Success", description: "Media spend updated" });
    } else {
      // Create new spend record
      const { data: newSpend, error: createError } = await supabase
        .from("media_spend")
        .insert({
          country_id: formData.country_id,
          month: formData.month,
          amount_local: amount,
          channel_id: formData.channel_id,
          sub_channel_id: formData.sub_channel_id && formData.sub_channel_id !== "__none__" ? formData.sub_channel_id : null,
          creative_id: formData.creative_id && formData.creative_id !== "__none__" ? formData.creative_id : null,
          distribute_evenly: formData.distribute_evenly,
          notes: formData.notes || null,
        })
        .select()
        .single();

      if (createError || !newSpend) {
        toast({ title: "Error", description: "Failed to create spend", variant: "destructive" });
        return;
      }

      // Create product allocations
      const allocatedAmount = amount / productIds.length;
      await supabase.from("media_spend_products").insert(
        productIds.map((productId) => ({
          media_spend_id: newSpend.id,
          product_id: productId,
          allocated_amount_local: allocatedAmount,
        }))
      );

      toast({ title: "Success", description: "Media spend created" });
    }

    fetchData();
    setDialogOpen(false);
    resetForm();
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from("media_spend").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete spend", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Media spend deleted" });
      fetchData();
    }
  }

  function resetForm() {
    setFormData({
      country_id: "",
      month: "",
      amount_local: "",
      channel_id: "",
      sub_channel_id: "",
      creative_id: "",
      distribute_evenly: false,
      notes: "",
      product_ids: [],
    });
    setEditingSpend(null);
  }

  function openEditDialog(spend: MediaSpend) {
    const existingProducts = spendProducts
      .filter((sp) => sp.media_spend_id === spend.id)
      .map((sp) => sp.product_id);

    setEditingSpend(spend);
    setFormData({
      country_id: spend.country_id,
      month: spend.month,
      amount_local: spend.amount_local.toString(),
      channel_id: spend.channel_id,
      sub_channel_id: spend.sub_channel_id || "",
      creative_id: spend.creative_id || "",
      distribute_evenly: spend.distribute_evenly || false,
      notes: spend.notes || "",
      product_ids: existingProducts,
    });
    setDialogOpen(true);
  }

  function toggleProduct(productId: string) {
    setFormData((prev) => {
      const exists = prev.product_ids.includes(productId);
      return {
        ...prev,
        product_ids: exists
          ? prev.product_ids.filter((id) => id !== productId)
          : [...prev.product_ids, productId],
        creative_id: "", // Clear creative when manually selecting products
      };
    });
  }

  const filteredSubChannels = subChannels.filter(
    (sc) => sc.channel_id === formData.channel_id
  );

  const filteredCreatives = creatives.filter(
    (c) => c.country_id === formData.country_id
  );

  const selectedCountry = countries.find((c) => c.id === formData.country_id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Media Spend</h1>
          <p className="text-muted-foreground mt-1">
            Track advertising spend by channel and month
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button disabled={countries.length === 0 || mediaChannels.length === 0}>
              <Plus className="h-4 w-4 mr-2" />
              Add Spend
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingSpend ? "Edit Media Spend" : "Add Media Spend"}
                </DialogTitle>
                <DialogDescription>
                  Enter the spend details and select products to attribute
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Country</Label>
                    <Select
                      value={formData.country_id}
                      onValueChange={(value) => setFormData({ ...formData, country_id: value, creative_id: "" })}
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
                  <Label>Amount ({selectedCountry?.currency_code || "local currency"})</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount_local}
                    onChange={(e) => setFormData({ ...formData, amount_local: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Channel</Label>
                    <Select
                      value={formData.channel_id}
                      onValueChange={(value) => setFormData({ ...formData, channel_id: value, sub_channel_id: "" })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select channel" />
                      </SelectTrigger>
                      <SelectContent>
                        {mediaChannels.map((channel) => (
                          <SelectItem key={channel.id} value={channel.id}>
                            {channel.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Sub-Channel (optional)</Label>
                    <Select
                      value={formData.sub_channel_id}
                      onValueChange={(value) => setFormData({ ...formData, sub_channel_id: value })}
                      disabled={!formData.channel_id}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select sub-channel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">None</SelectItem>
                        {filteredSubChannels.map((sub) => (
                          <SelectItem key={sub.id} value={sub.id}>
                            {sub.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    checked={formData.distribute_evenly}
                    onCheckedChange={(checked) => setFormData({ ...formData, distribute_evenly: checked })}
                  />
                  <Label>Distribute evenly across products (e.g., Retail Media)</Label>
                </div>

                <div className="grid gap-2">
                  <Label>Creative (optional)</Label>
                  <Select
                    value={formData.creative_id}
                    onValueChange={(value) => setFormData({ ...formData, creative_id: value, product_ids: [] })}
                    disabled={!formData.country_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select creative or choose products below" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="__none__">Select manually below</SelectItem>
                      {filteredCreatives.map((creative) => (
                        <SelectItem key={creative.id} value={creative.id}>
                          {creative.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {(!formData.creative_id || formData.creative_id === "__none__") && (
                  <div className="grid gap-2">
                    <Label>Products ({formData.product_ids.length} selected)</Label>
                    <div className="border rounded-md max-h-36 overflow-y-auto p-2 space-y-1">
                      {products.map((product) => (
                        <label
                          key={product.id}
                          className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.product_ids.includes(product.id)}
                            onChange={() => toggleProduct(product.id)}
                            className="rounded border-input"
                          />
                          <span className="text-sm">{product.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid gap-2">
                  <Label>Notes (optional)</Label>
                  <Input
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Campaign name, etc."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={
                    !formData.country_id ||
                    !formData.channel_id ||
                    ((!formData.creative_id || formData.creative_id === "__none__") && formData.product_ids.length === 0)
                  }
                >
                  {editingSpend ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Media Spend</CardTitle>
          <CardDescription>
            Spend records with channel and product attribution
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : spendRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No media spend records yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Creative/Products</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {spendRecords.map((spend) => {
                  const productCount = spendProducts.filter(
                    (sp) => sp.media_spend_id === spend.id
                  ).length;
                  return (
                    <TableRow key={spend.id}>
                      <TableCell>{formatMonth(spend.month)}</TableCell>
                      <TableCell>{spend.countries?.name}</TableCell>
                      <TableCell>
                        {spend.media_channels?.name}
                        {spend.media_sub_channels && (
                          <span className="text-muted-foreground">
                            {" "}/ {spend.media_sub_channels.name}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono">
                        {formatCurrency(spend.amount_local, spend.countries?.currency_code)}
                      </TableCell>
                      <TableCell>
                        {spend.creatives ? (
                          <span className="text-sm">{spend.creatives.name}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {productCount} product{productCount !== 1 ? "s" : ""}
                          </span>
                        )}
                        {spend.distribute_evenly && (
                          <span className="ml-2 text-xs bg-muted px-1.5 py-0.5 rounded">
                            Even
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(spend)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(spend.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

