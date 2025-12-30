"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatMonth } from "@/lib/utils";
import {
  calculateMonthlyMetrics,
  getUniqueMonths,
  type MonthlyMetrics,
} from "@/lib/calculations";
import type { Tables } from "@/types/database";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts";

type Country = Tables<"countries">;
type Product = Tables<"products">;
type Sale = Tables<"sales">;
type MediaSpend = Tables<"media_spend">;
type MediaSpendProduct = Tables<"media_spend_products">;
type ExchangeRate = Tables<"exchange_rates">;

interface ChartDataPoint {
  month: string;
  monthLabel: string;
  revenue: number;
  cogs: number;
  mediaSpend: number;
  grossProfit: number;
  netProfit: number;
  grossMargin: number;
  netMargin: number;
  roas: number;
}

export default function TrendsPage() {
  const [loading, setLoading] = useState(true);
  const [countries, setCountries] = useState<Country[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [mediaSpend, setMediaSpend] = useState<MediaSpend[]>([]);
  const [mediaSpendProducts, setMediaSpendProducts] = useState<MediaSpendProduct[]>([]);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);

  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<string>("all");

  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [
      countriesResult,
      productsResult,
      salesResult,
      mediaSpendResult,
      mediaSpendProductsResult,
      exchangeRatesResult,
    ] = await Promise.all([
      supabase.from("countries").select("*").order("name"),
      supabase.from("products").select("*"),
      supabase.from("sales").select("*"),
      supabase.from("media_spend").select("*"),
      supabase.from("media_spend_products").select("*"),
      supabase.from("exchange_rates").select("*"),
    ]);

    if (countriesResult.error || productsResult.error || salesResult.error) {
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    } else {
      setCountries(countriesResult.data || []);
      setProducts(productsResult.data || []);
      setSales(salesResult.data || []);
      setMediaSpend(mediaSpendResult.data || []);
      setMediaSpendProducts(mediaSpendProductsResult.data || []);
      setExchangeRates(exchangeRatesResult.data || []);
    }
    setLoading(false);
  }

  // Get available months
  const months = getUniqueMonths(sales, mediaSpend);

  // Filter sales by product if selected
  const filteredSales = selectedProduct === "all"
    ? sales
    : sales.filter((s) => s.product_id === selectedProduct);

  // Filter media spend products by product if selected
  const filteredMediaSpendProducts = selectedProduct === "all"
    ? mediaSpendProducts
    : mediaSpendProducts.filter((msp) => msp.product_id === selectedProduct);

  // Filter media spend to only include records that have the selected product (if filtering)
  const filteredMediaSpend = selectedProduct === "all"
    ? mediaSpend
    : mediaSpend.filter((ms) => {
        const relatedProducts = filteredMediaSpendProducts.filter(
          (msp) => msp.media_spend_id === ms.id
        );
        return relatedProducts.length > 0;
      });

  // Calculate chart data
  const chartData: ChartDataPoint[] = months.map((month) => {
    let revenue = 0;
    let cogs = 0;
    let spend = 0;

    const countriesToProcess =
      selectedCountry === "all"
        ? countries
        : countries.filter((c) => c.id === selectedCountry);

    for (const country of countriesToProcess) {
      const metrics = calculateMonthlyMetrics(
        filteredSales,
        products,
        filteredMediaSpendProducts,
        filteredMediaSpend,
        exchangeRates,
        country.currency_code,
        country.id,
        month
      );

      revenue += metrics.revenue_eur;
      cogs += metrics.cogs_eur;
      spend += metrics.media_spend_eur;
    }

    const grossProfit = revenue - cogs;
    const netProfit = grossProfit - spend;
    const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
    const netMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
    const roas = spend > 0 ? revenue / spend : 0;

    return {
      month,
      monthLabel: formatMonth(month),
      revenue,
      cogs,
      mediaSpend: spend,
      grossProfit,
      netProfit,
      grossMargin,
      netMargin,
      roas,
    };
  });

  const hasData = chartData.length > 0 && chartData.some((d) => d.revenue > 0 || d.mediaSpend > 0);

  const formatAxisValue = (value: number) => {
    if (value >= 1000000) return `€${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `€${(value / 1000).toFixed(0)}K`;
    return `€${value.toFixed(0)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading trends...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Trends</h1>
          <p className="text-muted-foreground mt-1">
            Time series analysis of performance metrics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Countries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {countries.map((country) => (
                <SelectItem key={country.id} value={country.id}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedProduct} onValueChange={setSelectedProduct}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Products" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!hasData ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">
              No trend data available. Add sales and media spend data to see charts.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Revenue & Profit Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue & Profit</CardTitle>
              <CardDescription>Monthly revenue and profit trends in EUR</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="monthLabel"
                      className="text-xs"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis
                      tickFormatter={formatAxisValue}
                      className="text-xs"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue"
                      stroke="hsl(var(--chart-1))"
                      fill="hsl(var(--chart-1))"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="grossProfit"
                      name="Gross Profit"
                      stroke="hsl(var(--chart-2))"
                      fill="hsl(var(--chart-2))"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="netProfit"
                      name="Net Profit"
                      stroke="hsl(var(--chart-3))"
                      fill="hsl(var(--chart-3))"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Costs Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>Costs Breakdown</CardTitle>
              <CardDescription>COGS vs Media Spend over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="monthLabel"
                      className="text-xs"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis
                      tickFormatter={formatAxisValue}
                      className="text-xs"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend />
                    <Bar
                      dataKey="cogs"
                      name="COGS"
                      fill="hsl(var(--chart-4))"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="mediaSpend"
                      name="Media Spend"
                      fill="hsl(var(--chart-5))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Margin & ROAS Over Time */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Margins</CardTitle>
                <CardDescription>Gross and net margin percentages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="monthLabel"
                        className="text-xs"
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                      />
                      <YAxis
                        tickFormatter={(v) => `${v.toFixed(0)}%`}
                        className="text-xs"
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)",
                        }}
                        formatter={(value: number) => `${value.toFixed(1)}%`}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="grossMargin"
                        name="Gross Margin"
                        stroke="hsl(var(--chart-2))"
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--chart-2))" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="netMargin"
                        name="Net Margin"
                        stroke="hsl(var(--chart-3))"
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--chart-3))" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ROAS</CardTitle>
                <CardDescription>Return on ad spend over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="monthLabel"
                        className="text-xs"
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                      />
                      <YAxis
                        tickFormatter={(v) => `${v.toFixed(1)}x`}
                        className="text-xs"
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)",
                        }}
                        formatter={(value: number) => `${value.toFixed(2)}x`}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="roas"
                        name="ROAS"
                        stroke="hsl(var(--chart-1))"
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--chart-1))" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}


