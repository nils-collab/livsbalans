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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import type { Tables } from "@/types/database";

type Product = Tables<"products">;
type ProductGroup = Tables<"product_groups">;
type ProductGroupMember = Tables<"product_group_members"> & {
  products?: Product;
  product_groups?: ProductGroup;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [groups, setGroups] = useState<ProductGroup[]>([]);
  const [groupMembers, setGroupMembers] = useState<ProductGroupMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Product dialog state
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    sku: "",
    cogs_eur: "",
  });

  // Group dialog state
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ProductGroup | null>(null);
  const [groupForm, setGroupForm] = useState({
    name: "",
    description: "",
  });

  // Assign to group dialog
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");

  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [productsResult, groupsResult, membersResult] = await Promise.all([
      supabase.from("products").select("*").order("name"),
      supabase.from("product_groups").select("*").order("name"),
      supabase
        .from("product_group_members")
        .select("*, products(*), product_groups(*)")
        .order("created_at"),
    ]);

    if (productsResult.error || groupsResult.error || membersResult.error) {
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    } else {
      setProducts(productsResult.data || []);
      setGroups(groupsResult.data || []);
      setGroupMembers(membersResult.data || []);
    }
    setLoading(false);
  }

  // Product handlers
  async function handleProductSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cogsValue = parseFloat(productForm.cogs_eur);

    if (editingProduct) {
      const { error } = await supabase
        .from("products")
        .update({
          name: productForm.name,
          sku: productForm.sku || null,
          cogs_eur: cogsValue,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingProduct.id);

      if (error) {
        toast({ title: "Error", description: "Failed to update product", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Product updated" });
        fetchData();
      }
    } else {
      const { error } = await supabase.from("products").insert({
        name: productForm.name,
        sku: productForm.sku || null,
        cogs_eur: cogsValue,
      });

      if (error) {
        console.error("Supabase error:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to create product",
          variant: "destructive",
        });
      } else {
        toast({ title: "Success", description: "Product created" });
        fetchData();
      }
    }

    setProductDialogOpen(false);
    resetProductForm();
  }

  async function handleProductDelete(id: string) {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast({
        title: "Error",
        description: "Product has sales or spend data and cannot be deleted",
        variant: "destructive",
      });
    } else {
      toast({ title: "Success", description: "Product deleted" });
      fetchData();
    }
  }

  function resetProductForm() {
    setProductForm({ name: "", sku: "", cogs_eur: "" });
    setEditingProduct(null);
  }

  // Group handlers
  async function handleGroupSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (editingGroup) {
      const { error } = await supabase
        .from("product_groups")
        .update({
          name: groupForm.name,
          description: groupForm.description || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingGroup.id);

      if (error) {
        toast({ title: "Error", description: "Failed to update group", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Group updated" });
        fetchData();
      }
    } else {
      const { error } = await supabase.from("product_groups").insert({
        name: groupForm.name,
        description: groupForm.description || null,
      });

      if (error) {
        toast({ title: "Error", description: "Failed to create group", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Group created" });
        fetchData();
      }
    }

    setGroupDialogOpen(false);
    resetGroupForm();
  }

  async function handleGroupDelete(id: string) {
    const { error } = await supabase.from("product_groups").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete group", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Group deleted" });
      fetchData();
    }
  }

  function resetGroupForm() {
    setGroupForm({ name: "", description: "" });
    setEditingGroup(null);
  }

  // Assignment handlers
  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase.from("product_group_members").insert({
      product_id: selectedProductId,
      group_id: selectedGroupId,
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message.includes("duplicate")
          ? "Product already in this group"
          : "Failed to assign product",
        variant: "destructive",
      });
    } else {
      toast({ title: "Success", description: "Product assigned to group" });
      fetchData();
    }

    setAssignDialogOpen(false);
    setSelectedProductId("");
    setSelectedGroupId("");
  }

  async function handleRemoveFromGroup(memberId: string) {
    const { error } = await supabase.from("product_group_members").delete().eq("id", memberId);
    if (error) {
      toast({ title: "Error", description: "Failed to remove from group", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Removed from group" });
      fetchData();
    }
  }

  function getProductGroups(productId: string) {
    return groupMembers
      .filter((m) => m.product_id === productId)
      .map((m) => m.product_groups?.name)
      .filter(Boolean)
      .join(", ");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Products</h1>
        <p className="text-muted-foreground mt-1">
          Manage products and product groups
        </p>
      </div>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="groups">Product Groups</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>All Products</CardTitle>
                <CardDescription>Products with their COGS in EUR</CardDescription>
              </div>
              <div className="flex gap-2">
                <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" disabled={products.length === 0 || groups.length === 0}>
                      Assign to Group
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <form onSubmit={handleAssign}>
                      <DialogHeader>
                        <DialogTitle>Assign Product to Group</DialogTitle>
                        <DialogDescription>Products can belong to multiple groups</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label>Product</Label>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={selectedProductId}
                            onChange={(e) => setSelectedProductId(e.target.value)}
                            required
                          >
                            <option value="">Select product</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="grid gap-2">
                          <Label>Group</Label>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={selectedGroupId}
                            onChange={(e) => setSelectedGroupId(e.target.value)}
                            required
                          >
                            <option value="">Select group</option>
                            {groups.map((g) => (
                              <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={!selectedProductId || !selectedGroupId}>
                          Assign
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>

                <Dialog open={productDialogOpen} onOpenChange={(open) => {
                  setProductDialogOpen(open);
                  if (!open) resetProductForm();
                }}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <form onSubmit={handleProductSubmit}>
                      <DialogHeader>
                        <DialogTitle>{editingProduct ? "Edit" : "Add"} Product</DialogTitle>
                        <DialogDescription>COGS is set centrally in EUR</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name">Product Name</Label>
                          <Input
                            id="name"
                            value={productForm.name}
                            onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="sku">SKU (optional)</Label>
                          <Input
                            id="sku"
                            value={productForm.sku}
                            onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="cogs">COGS (EUR)</Label>
                          <Input
                            id="cogs"
                            type="number"
                            step="0.01"
                            min="0"
                            value={productForm.cogs_eur}
                            onChange={(e) => setProductForm({ ...productForm, cogs_eur: e.target.value })}
                            placeholder="0.00"
                            required
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">{editingProduct ? "Update" : "Create"}</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : products.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No products yet.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>COGS (EUR)</TableHead>
                      <TableHead>Groups</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.sku || "-"}</TableCell>
                        <TableCell>{formatCurrency(product.cogs_eur)}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {getProductGroups(product.id) || "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => {
                              setEditingProduct(product);
                              setProductForm({
                                name: product.name,
                                sku: product.sku || "",
                                cogs_eur: product.cogs_eur.toString(),
                              });
                              setProductDialogOpen(true);
                            }}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleProductDelete(product.id)}>
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
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Product Groups</CardTitle>
                <CardDescription>Products can belong to multiple groups</CardDescription>
              </div>
              <Dialog open={groupDialogOpen} onOpenChange={(open) => {
                setGroupDialogOpen(open);
                if (!open) resetGroupForm();
              }}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />Add Group
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleGroupSubmit}>
                    <DialogHeader>
                      <DialogTitle>{editingGroup ? "Edit" : "Add"} Product Group</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="group-name">Name</Label>
                        <Input
                          id="group-name"
                          value={groupForm.name}
                          onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Description (optional)</Label>
                        <Input
                          id="description"
                          value={groupForm.description}
                          onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">{editingGroup ? "Update" : "Create"}</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : groups.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No groups yet.</div>
              ) : (
                <div className="space-y-6">
                  {groups.map((group) => {
                    const members = groupMembers.filter((m) => m.group_id === group.id);
                    return (
                      <div key={group.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-semibold">{group.name}</h3>
                            {group.description && (
                              <p className="text-sm text-muted-foreground">{group.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => {
                              setEditingGroup(group);
                              setGroupForm({
                                name: group.name,
                                description: group.description || "",
                              });
                              setGroupDialogOpen(true);
                            }}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleGroupDelete(group.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {members.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {members.map((member) => (
                              <div
                                key={member.id}
                                className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-sm"
                              >
                                <span>{member.products?.name}</span>
                                <button
                                  onClick={() => handleRemoveFromGroup(member.id)}
                                  className="ml-1 text-muted-foreground hover:text-foreground"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No products in this group</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


