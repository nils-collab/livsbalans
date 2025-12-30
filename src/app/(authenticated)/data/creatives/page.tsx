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
import { Plus, Pencil, Trash2, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/types/database";

type Country = Tables<"countries">;
type Product = Tables<"products">;
type Creative = Tables<"creatives"> & {
  countries?: Country;
};
type CreativeProduct = Tables<"creative_products"> & {
  products?: Product;
};

export default function CreativesPage() {
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [creativeProducts, setCreativeProducts] = useState<CreativeProduct[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCreative, setEditingCreative] = useState<Creative | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    country_id: "",
    product_ids: [] as string[],
  });

  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [creativesResult, creativeProductsResult, countriesResult, productsResult] = await Promise.all([
      supabase.from("creatives").select("*, countries(*)").order("name"),
      supabase.from("creative_products").select("*, products(*)"),
      supabase.from("countries").select("*").order("name"),
      supabase.from("products").select("*").order("name"),
    ]);

    if (creativesResult.error || creativeProductsResult.error || countriesResult.error || productsResult.error) {
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    } else {
      setCreatives(creativesResult.data || []);
      setCreativeProducts(creativeProductsResult.data || []);
      setCountries(countriesResult.data || []);
      setProducts(productsResult.data || []);
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (editingCreative) {
      // Update creative
      const { error: updateError } = await supabase
        .from("creatives")
        .update({
          name: formData.name,
          country_id: formData.country_id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingCreative.id);

      if (updateError) {
        toast({ title: "Error", description: "Failed to update creative", variant: "destructive" });
        return;
      }

      // Delete existing products and re-add
      await supabase.from("creative_products").delete().eq("creative_id", editingCreative.id);

      if (formData.product_ids.length > 0) {
        const { error: insertError } = await supabase.from("creative_products").insert(
          formData.product_ids.map((productId) => ({
            creative_id: editingCreative.id,
            product_id: productId,
          }))
        );

        if (insertError) {
          toast({ title: "Warning", description: "Creative updated but failed to update products", variant: "destructive" });
        }
      }

      toast({ title: "Success", description: "Creative updated" });
      fetchData();
    } else {
      // Create new creative
      const { data: newCreative, error: createError } = await supabase
        .from("creatives")
        .insert({
          name: formData.name,
          country_id: formData.country_id,
        })
        .select()
        .single();

      if (createError || !newCreative) {
        toast({ title: "Error", description: "Failed to create creative", variant: "destructive" });
        return;
      }

      // Add products
      if (formData.product_ids.length > 0) {
        const { error: insertError } = await supabase.from("creative_products").insert(
          formData.product_ids.map((productId) => ({
            creative_id: newCreative.id,
            product_id: productId,
          }))
        );

        if (insertError) {
          toast({ title: "Warning", description: "Creative created but failed to add products", variant: "destructive" });
        }
      }

      toast({ title: "Success", description: "Creative created" });
      fetchData();
    }

    setDialogOpen(false);
    resetForm();
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from("creatives").delete().eq("id", id);
    if (error) {
      toast({
        title: "Error",
        description: "Creative has media spend data and cannot be deleted",
        variant: "destructive",
      });
    } else {
      toast({ title: "Success", description: "Creative deleted" });
      fetchData();
    }
  }

  function resetForm() {
    setFormData({ name: "", country_id: "", product_ids: [] });
    setEditingCreative(null);
  }

  function openEditDialog(creative: Creative) {
    const productIds = creativeProducts
      .filter((cp) => cp.creative_id === creative.id)
      .map((cp) => cp.product_id);

    setEditingCreative(creative);
    setFormData({
      name: creative.name,
      country_id: creative.country_id,
      product_ids: productIds,
    });
    setDialogOpen(true);
  }

  function getCreativeProducts(creativeId: string) {
    return creativeProducts
      .filter((cp) => cp.creative_id === creativeId)
      .map((cp) => cp.products?.name)
      .filter(Boolean);
  }

  function toggleProduct(productId: string) {
    setFormData((prev) => {
      const exists = prev.product_ids.includes(productId);
      return {
        ...prev,
        product_ids: exists
          ? prev.product_ids.filter((id) => id !== productId)
          : [...prev.product_ids, productId],
      };
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Creatives</h1>
          <p className="text-muted-foreground mt-1">
            Saved presets of products for media spend attribution
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button disabled={countries.length === 0 || products.length === 0}>
              <Plus className="h-4 w-4 mr-2" />
              Add Creative
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingCreative ? "Edit Creative" : "Add Creative"}
                </DialogTitle>
                <DialogDescription>
                  A creative is a saved preset of products you advertise together
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Summer Campaign 2024"
                    required
                  />
                </div>
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
                  <Label>Products ({formData.product_ids.length} selected)</Label>
                  <div className="border rounded-md max-h-48 overflow-y-auto p-2 space-y-1">
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
                        {product.sku && (
                          <span className="text-xs text-muted-foreground">({product.sku})</span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={!formData.country_id || formData.product_ids.length === 0}>
                  {editingCreative ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : countries.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Add countries first before creating creatives.
          </CardContent>
        </Card>
      ) : products.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Add products first before creating creatives.
          </CardContent>
        </Card>
      ) : creatives.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No creatives yet. Create a creative to save a preset of products for media spend.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {creatives.map((creative) => {
            const productNames = getCreativeProducts(creative.id);
            return (
              <Card key={creative.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{creative.name}</CardTitle>
                      <CardDescription>{creative.countries?.name}</CardDescription>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(creative)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(creative.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Package className="h-4 w-4" />
                    <span>{productNames.length} products</span>
                  </div>
                  {productNames.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {productNames.slice(0, 5).map((name, i) => (
                        <span
                          key={i}
                          className="bg-muted px-2 py-0.5 rounded text-xs"
                        >
                          {name}
                        </span>
                      ))}
                      {productNames.length > 5 && (
                        <span className="text-xs text-muted-foreground">
                          +{productNames.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}




