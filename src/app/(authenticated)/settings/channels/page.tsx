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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/types/database";

type MediaChannel = Tables<"media_channels">;
type MediaSubChannel = Tables<"media_sub_channels"> & {
  media_channels?: MediaChannel;
};
type SalesChannel = Tables<"sales_channels">;

export default function ChannelsPage() {
  const [mediaChannels, setMediaChannels] = useState<MediaChannel[]>([]);
  const [subChannels, setSubChannels] = useState<MediaSubChannel[]>([]);
  const [salesChannels, setSalesChannels] = useState<SalesChannel[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const [subDialogOpen, setSubDialogOpen] = useState(false);
  const [salesDialogOpen, setSalesDialogOpen] = useState(false);

  // Editing states
  const [editingMedia, setEditingMedia] = useState<MediaChannel | null>(null);
  const [editingSub, setEditingSub] = useState<MediaSubChannel | null>(null);
  const [editingSales, setEditingSales] = useState<SalesChannel | null>(null);

  // Form data
  const [mediaForm, setMediaForm] = useState({ name: "" });
  const [subForm, setSubForm] = useState({ name: "", channel_id: "" });
  const [salesForm, setSalesForm] = useState({ name: "" });

  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [mediaResult, subResult, salesResult] = await Promise.all([
      supabase.from("media_channels").select("*").order("name"),
      supabase.from("media_sub_channels").select("*, media_channels(*)").order("name"),
      supabase.from("sales_channels").select("*").order("name"),
    ]);

    if (mediaResult.error || subResult.error || salesResult.error) {
      toast({
        title: "Error",
        description: "Failed to fetch channels",
        variant: "destructive",
      });
    } else {
      setMediaChannels(mediaResult.data || []);
      setSubChannels(subResult.data || []);
      setSalesChannels(salesResult.data || []);
    }
    setLoading(false);
  }

  // Media Channel handlers
  async function handleMediaSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingMedia) {
      const { error } = await supabase
        .from("media_channels")
        .update({ name: mediaForm.name, updated_at: new Date().toISOString() })
        .eq("id", editingMedia.id);
      if (error) {
        toast({ title: "Error", description: "Failed to update", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Channel updated" });
        fetchData();
      }
    } else {
      const { error } = await supabase.from("media_channels").insert({ name: mediaForm.name });
      if (error) {
        toast({ title: "Error", description: "Failed to create", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Channel created" });
        fetchData();
      }
    }
    setMediaDialogOpen(false);
    setMediaForm({ name: "" });
    setEditingMedia(null);
  }

  async function handleMediaDelete(id: string) {
    const { error } = await supabase.from("media_channels").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Channel has sub-channels or spend data", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Channel deleted" });
      fetchData();
    }
  }

  // Sub-channel handlers
  async function handleSubSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingSub) {
      const { error } = await supabase
        .from("media_sub_channels")
        .update({ name: subForm.name, channel_id: subForm.channel_id, updated_at: new Date().toISOString() })
        .eq("id", editingSub.id);
      if (error) {
        toast({ title: "Error", description: "Failed to update", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Sub-channel updated" });
        fetchData();
      }
    } else {
      const { error } = await supabase.from("media_sub_channels").insert({
        name: subForm.name,
        channel_id: subForm.channel_id,
      });
      if (error) {
        toast({ title: "Error", description: "Failed to create", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Sub-channel created" });
        fetchData();
      }
    }
    setSubDialogOpen(false);
    setSubForm({ name: "", channel_id: "" });
    setEditingSub(null);
  }

  async function handleSubDelete(id: string) {
    const { error } = await supabase.from("media_sub_channels").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Sub-channel has spend data", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Sub-channel deleted" });
      fetchData();
    }
  }

  // Sales channel handlers
  async function handleSalesSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingSales) {
      const { error } = await supabase
        .from("sales_channels")
        .update({ name: salesForm.name, updated_at: new Date().toISOString() })
        .eq("id", editingSales.id);
      if (error) {
        toast({ title: "Error", description: "Failed to update", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Channel updated" });
        fetchData();
      }
    } else {
      const { error } = await supabase.from("sales_channels").insert({ name: salesForm.name });
      if (error) {
        toast({ title: "Error", description: "Failed to create", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Channel created" });
        fetchData();
      }
    }
    setSalesDialogOpen(false);
    setSalesForm({ name: "" });
    setEditingSales(null);
  }

  async function handleSalesDelete(id: string) {
    const { error } = await supabase.from("sales_channels").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Channel has sales data", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Channel deleted" });
      fetchData();
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Channels</h1>
        <p className="text-muted-foreground mt-1">
          Manage media and sales channels for attribution
        </p>
      </div>

      <Tabs defaultValue="media" className="space-y-4">
        <TabsList>
          <TabsTrigger value="media">Media Channels</TabsTrigger>
          <TabsTrigger value="sub">Sub-Channels</TabsTrigger>
          <TabsTrigger value="sales">Sales Channels</TabsTrigger>
        </TabsList>

        <TabsContent value="media" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Media Channels</CardTitle>
                <CardDescription>Top-level advertising channels (Meta, Google, etc.)</CardDescription>
              </div>
              <Dialog open={mediaDialogOpen} onOpenChange={(open) => {
                setMediaDialogOpen(open);
                if (!open) { setMediaForm({ name: "" }); setEditingMedia(null); }
              }}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="h-4 w-4 mr-2" />Add Channel</Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleMediaSubmit}>
                    <DialogHeader>
                      <DialogTitle>{editingMedia ? "Edit" : "Add"} Media Channel</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="media-name">Name</Label>
                        <Input
                          id="media-name"
                          value={mediaForm.name}
                          onChange={(e) => setMediaForm({ name: e.target.value })}
                          placeholder="e.g., Meta, Google, Retail Media"
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">{editingMedia ? "Update" : "Create"}</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : mediaChannels.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No media channels yet.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mediaChannels.map((channel) => (
                      <TableRow key={channel.id}>
                        <TableCell className="font-medium">{channel.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => {
                              setEditingMedia(channel);
                              setMediaForm({ name: channel.name });
                              setMediaDialogOpen(true);
                            }}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleMediaDelete(channel.id)}>
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

        <TabsContent value="sub" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Sub-Channels</CardTitle>
                <CardDescription>Specific channels under each media channel</CardDescription>
              </div>
              <Dialog open={subDialogOpen} onOpenChange={(open) => {
                setSubDialogOpen(open);
                if (!open) { setSubForm({ name: "", channel_id: "" }); setEditingSub(null); }
              }}>
                <DialogTrigger asChild>
                  <Button size="sm" disabled={mediaChannels.length === 0}>
                    <Plus className="h-4 w-4 mr-2" />Add Sub-Channel
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleSubSubmit}>
                    <DialogHeader>
                      <DialogTitle>{editingSub ? "Edit" : "Add"} Sub-Channel</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label>Parent Channel</Label>
                        <Select value={subForm.channel_id} onValueChange={(v) => setSubForm({ ...subForm, channel_id: v })}>
                          <SelectTrigger><SelectValue placeholder="Select channel" /></SelectTrigger>
                          <SelectContent>
                            {mediaChannels.map((c) => (
                              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="sub-name">Name</Label>
                        <Input
                          id="sub-name"
                          value={subForm.name}
                          onChange={(e) => setSubForm({ ...subForm, name: e.target.value })}
                          placeholder="e.g., Instagram, Search, Shopping"
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={!subForm.channel_id}>{editingSub ? "Update" : "Create"}</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : subChannels.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No sub-channels yet.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Parent Channel</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subChannels.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell className="font-medium">{sub.name}</TableCell>
                        <TableCell>{sub.media_channels?.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => {
                              setEditingSub(sub);
                              setSubForm({ name: sub.name, channel_id: sub.channel_id });
                              setSubDialogOpen(true);
                            }}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleSubDelete(sub.id)}>
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

        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Sales Channels</CardTitle>
                <CardDescription>Where products are sold (Grocery, Pharmacy, DTC, etc.)</CardDescription>
              </div>
              <Dialog open={salesDialogOpen} onOpenChange={(open) => {
                setSalesDialogOpen(open);
                if (!open) { setSalesForm({ name: "" }); setEditingSales(null); }
              }}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="h-4 w-4 mr-2" />Add Channel</Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleSalesSubmit}>
                    <DialogHeader>
                      <DialogTitle>{editingSales ? "Edit" : "Add"} Sales Channel</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="sales-name">Name</Label>
                        <Input
                          id="sales-name"
                          value={salesForm.name}
                          onChange={(e) => setSalesForm({ name: e.target.value })}
                          placeholder="e.g., Grocery, Pharmacy, Online"
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">{editingSales ? "Update" : "Create"}</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : salesChannels.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No sales channels yet.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesChannels.map((channel) => (
                      <TableRow key={channel.id}>
                        <TableCell className="font-medium">{channel.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => {
                              setEditingSales(channel);
                              setSalesForm({ name: channel.name });
                              setSalesDialogOpen(true);
                            }}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleSalesDelete(channel.id)}>
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
      </Tabs>
    </div>
  );
}




