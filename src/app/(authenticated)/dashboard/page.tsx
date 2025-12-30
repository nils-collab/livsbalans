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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Target,
  Percent,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatNumber, formatPercent, formatMonth } from "@/lib/utils";
import {
  calculateMonthlyMetrics,
  aggregateCountryMetrics,
  consolidateMetrics,
  getUniqueMonths,
  type MonthlyMetrics,
  type CountryMetrics,
  type ConsolidatedMetrics,
} from "@/lib/calculations";
import type { Tables } from "@/types/database";

type Country = Tables<"countries">;
type Product = Tables<"products">;
type Sale = Tables<"sales">;
type MediaSpend = Tables<"media_spend">;
type MediaSpendProduct = Tables<"media_spend_products">;
type ExchangeRate = Tables<"exchange_rates">;

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            {trend === "up" && <TrendingUp className="h-3 w-3 text-green-500" />}
            {trend === "down" && <TrendingDown className="h-3 w-3 text-red-500" />}
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [countries, setCountries] = useState<Country[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [mediaSpend, setMediaSpend] = useState<MediaSpend[]>([]);
  const [mediaSpendProducts, setMediaSpendProducts] = useState<MediaSpendProduct[]>([]);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);

  const [selectedMonth, setSelectedMonth] = useState<string>("all");
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

  // Calculate metrics
  const allMonthlyMetrics: MonthlyMetrics[] = [];

  for (const country of countries) {
    const monthsToProcess = selectedMonth === "all" ? months : [selectedMonth];

    for (const month of monthsToProcess) {
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
      allMonthlyMetrics.push(metrics);
    }
  }

  // Filter by selected country if needed
  const filteredMetrics = selectedCountry === "all"
    ? allMonthlyMetrics
    : allMonthlyMetrics.filter((m) => m.country_id === selectedCountry);

  // Aggregate by country
  const countryMetricsMap = new Map<string, MonthlyMetrics[]>();
  for (const m of filteredMetrics) {
    const existing = countryMetricsMap.get(m.country_id) || [];
    existing.push(m);
    countryMetricsMap.set(m.country_id, existing);
  }

  const countryMetrics: CountryMetrics[] = [];
  for (const [countryId, metrics] of countryMetricsMap) {
    const country = countries.find((c) => c.id === countryId);
    if (country && metrics.length > 0) {
      countryMetrics.push(
        aggregateCountryMetrics(metrics, country.name, country.currency_code)
      );
    }
  }

  // Consolidated metrics
  const consolidated = consolidateMetrics(countryMetrics);

  // Check if we have data
  const hasData = sales.length > 0 || mediaSpend.length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Product margin overview consolidated in EUR
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
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              {months.map((month) => (
                <SelectItem key={month} value={month}>
                  {formatMonth(month)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!hasData ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground mb-4">
              No data yet. Start by adding countries, products, and sales/spend data.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Revenue (EUR)"
              value={formatCurrency(consolidated.total_revenue_eur)}
              subtitle={`${formatNumber(consolidated.total_units)} units sold`}
              icon={DollarSign}
            />
            <MetricCard
              title="Gross Profit (EUR)"
              value={formatCurrency(consolidated.gross_profit_eur)}
              subtitle={`${formatPercent(consolidated.gross_margin_pct)} margin`}
              icon={TrendingUp}
              trend={consolidated.gross_profit_eur >= 0 ? "up" : "down"}
            />
            <MetricCard
              title="Net Profit (EUR)"
              value={formatCurrency(consolidated.net_profit_eur)}
              subtitle={`${formatPercent(consolidated.net_margin_pct)} margin`}
              icon={Target}
              trend={consolidated.net_profit_eur >= 0 ? "up" : "down"}
            />
            <MetricCard
              title="ROAS"
              value={consolidated.roas.toFixed(2) + "x"}
              subtitle={`${formatCurrency(consolidated.total_media_spend_eur)} spent`}
              icon={Percent}
              trend={consolidated.roas >= 1 ? "up" : "down"}
            />
          </div>

          {/* Breakdown Cards */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Cost Breakdown</CardTitle>
                <CardDescription>COGS vs Media Spend in EUR</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-chart-1" />
                      <span className="text-sm">COGS</span>
                    </div>
                    <span className="font-mono font-medium">
                      {formatCurrency(consolidated.total_cogs_eur)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-chart-2" />
                      <span className="text-sm">Media Spend</span>
                    </div>
                    <span className="font-mono font-medium">
                      {formatCurrency(consolidated.total_media_spend_eur)}
                    </span>
                  </div>
                  <div className="border-t pt-4 flex items-center justify-between">
                    <span className="text-sm font-medium">Total Costs</span>
                    <span className="font-mono font-bold">
                      {formatCurrency(
                        consolidated.total_cogs_eur + consolidated.total_media_spend_eur
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>By Country</CardTitle>
                <CardDescription>Revenue and profit by market</CardDescription>
              </CardHeader>
              <CardContent>
                {countryMetrics.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No country data available</p>
                ) : (
                  <div className="space-y-4">
                    {countryMetrics.map((cm) => (
                      <div key={cm.country_id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{cm.country_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatNumber(cm.total_units)} units
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-medium">
                            {formatCurrency(cm.total_revenue_eur)}
                          </p>
                          <p
                            className={`text-xs ${
                              cm.net_profit_eur >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {formatCurrency(cm.net_profit_eur)} profit
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Monthly Summary Table */}
          {selectedMonth === "all" && months.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Monthly Summary</CardTitle>
                <CardDescription>Performance by month (consolidated EUR)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2 font-medium">Month</th>
                        <th className="text-right py-3 px-2 font-medium">Revenue</th>
                        <th className="text-right py-3 px-2 font-medium">Units</th>
                        <th className="text-right py-3 px-2 font-medium">COGS</th>
                        <th className="text-right py-3 px-2 font-medium">Spend</th>
                        <th className="text-right py-3 px-2 font-medium">Gross Profit</th>
                        <th className="text-right py-3 px-2 font-medium">Net Profit</th>
                        <th className="text-right py-3 px-2 font-medium">Margin</th>
                      </tr>
                    </thead>
                    <tbody>
                      {months.map((month) => {
                        const monthMetrics = filteredMetrics.filter((m) => m.month === month);
                        const revenue = monthMetrics.reduce((s, m) => s + m.revenue_eur, 0);
                        const units = monthMetrics.reduce((s, m) => s + m.units, 0);
                        const cogs = monthMetrics.reduce((s, m) => s + m.cogs_eur, 0);
                        const spend = monthMetrics.reduce((s, m) => s + m.media_spend_eur, 0);
                        const gross = revenue - cogs;
                        const net = gross - spend;
                        const margin = revenue > 0 ? (net / revenue) * 100 : 0;

                        return (
                          <tr key={month} className="border-b">
                            <td className="py-3 px-2">{formatMonth(month)}</td>
                            <td className="text-right py-3 px-2 font-mono">
                              {formatCurrency(revenue)}
                            </td>
                            <td className="text-right py-3 px-2 font-mono">
                              {formatNumber(units)}
                            </td>
                            <td className="text-right py-3 px-2 font-mono">
                              {formatCurrency(cogs)}
                            </td>
                            <td className="text-right py-3 px-2 font-mono">
                              {formatCurrency(spend)}
                            </td>
                            <td className="text-right py-3 px-2 font-mono">
                              {formatCurrency(gross)}
                            </td>
                            <td
                              className={`text-right py-3 px-2 font-mono ${
                                net >= 0 ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {formatCurrency(net)}
                            </td>
                            <td
                              className={`text-right py-3 px-2 font-mono ${
                                margin >= 0 ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {formatPercent(margin)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}


