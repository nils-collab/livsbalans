import type { Tables } from "@/types/database";

type Sale = Tables<"sales">;
type Product = Tables<"products">;
type MediaSpendProduct = Tables<"media_spend_products">;
type ExchangeRate = Tables<"exchange_rates">;

export interface MonthlyMetrics {
  month: string;
  country_id: string;
  revenue_local: number;
  revenue_eur: number;
  units: number;
  cogs_eur: number;
  media_spend_local: number;
  media_spend_eur: number;
  gross_profit_eur: number;
  net_profit_eur: number;
  gross_margin_pct: number;
  net_margin_pct: number;
  roas: number;
}

export interface CountryMetrics {
  country_id: string;
  country_name: string;
  currency_code: string;
  total_revenue_eur: number;
  total_units: number;
  total_cogs_eur: number;
  total_media_spend_eur: number;
  gross_profit_eur: number;
  net_profit_eur: number;
  gross_margin_pct: number;
  net_margin_pct: number;
  roas: number;
}

export interface ConsolidatedMetrics {
  total_revenue_eur: number;
  total_units: number;
  total_cogs_eur: number;
  total_media_spend_eur: number;
  gross_profit_eur: number;
  net_profit_eur: number;
  gross_margin_pct: number;
  net_margin_pct: number;
  roas: number;
}

/**
 * Get the exchange rate for a specific country and month
 * Returns 1 if EUR country or no rate found
 */
export function getExchangeRate(
  countryId: string,
  month: string,
  exchangeRates: ExchangeRate[],
  countryCurrency: string
): number {
  // EUR countries don't need conversion
  if (countryCurrency === "EUR") return 1;

  // Find rate for this country/month
  const rate = exchangeRates.find(
    (r) => r.country_id === countryId && r.month === month
  );

  // Return rate or 1 as fallback
  return rate?.rate_to_eur || 1;
}

/**
 * Convert local currency to EUR
 */
export function toEur(
  amount: number,
  countryId: string,
  month: string,
  exchangeRates: ExchangeRate[],
  countryCurrency: string
): number {
  const rate = getExchangeRate(countryId, month, exchangeRates, countryCurrency);
  return amount / rate;
}

/**
 * Calculate metrics for a specific month and country
 */
export function calculateMonthlyMetrics(
  sales: Sale[],
  products: Product[],
  mediaSpendProducts: MediaSpendProduct[],
  mediaSpendRecords: Array<Tables<"media_spend">>,
  exchangeRates: ExchangeRate[],
  countryCurrency: string,
  countryId: string,
  month: string
): MonthlyMetrics {
  // Filter data for this country/month
  const monthSales = sales.filter(
    (s) => s.country_id === countryId && s.month === month
  );

  const monthSpend = mediaSpendRecords.filter(
    (m) => m.country_id === countryId && m.month === month
  );

  const monthSpendIds = monthSpend.map((m) => m.id);
  const monthSpendProducts = mediaSpendProducts.filter((msp) =>
    monthSpendIds.includes(msp.media_spend_id)
  );

  const rate = getExchangeRate(countryId, month, exchangeRates, countryCurrency);

  // Calculate revenue
  const revenue_local = monthSales.reduce((sum, s) => sum + s.revenue_local, 0);
  const revenue_eur = revenue_local / rate;

  // Calculate units
  const units = monthSales.reduce((sum, s) => sum + s.units, 0);

  // Calculate COGS (already in EUR)
  let cogs_eur = 0;
  for (const sale of monthSales) {
    const product = products.find((p) => p.id === sale.product_id);
    if (product) {
      cogs_eur += sale.units * product.cogs_eur;
    }
  }

  // Calculate media spend
  const media_spend_local = monthSpend.reduce((sum, m) => sum + m.amount_local, 0);
  const media_spend_eur = media_spend_local / rate;

  // Calculate profits
  const gross_profit_eur = revenue_eur - cogs_eur;
  const net_profit_eur = gross_profit_eur - media_spend_eur;

  // Calculate margins
  const gross_margin_pct = revenue_eur > 0 ? (gross_profit_eur / revenue_eur) * 100 : 0;
  const net_margin_pct = revenue_eur > 0 ? (net_profit_eur / revenue_eur) * 100 : 0;

  // Calculate ROAS
  const roas = media_spend_eur > 0 ? revenue_eur / media_spend_eur : 0;

  return {
    month,
    country_id: countryId,
    revenue_local,
    revenue_eur,
    units,
    cogs_eur,
    media_spend_local,
    media_spend_eur,
    gross_profit_eur,
    net_profit_eur,
    gross_margin_pct,
    net_margin_pct,
    roas,
  };
}

/**
 * Aggregate metrics across months for a country
 */
export function aggregateCountryMetrics(
  monthlyMetrics: MonthlyMetrics[],
  countryName: string,
  currencyCode: string
): CountryMetrics {
  const total_revenue_eur = monthlyMetrics.reduce((sum, m) => sum + m.revenue_eur, 0);
  const total_units = monthlyMetrics.reduce((sum, m) => sum + m.units, 0);
  const total_cogs_eur = monthlyMetrics.reduce((sum, m) => sum + m.cogs_eur, 0);
  const total_media_spend_eur = monthlyMetrics.reduce((sum, m) => sum + m.media_spend_eur, 0);

  const gross_profit_eur = total_revenue_eur - total_cogs_eur;
  const net_profit_eur = gross_profit_eur - total_media_spend_eur;

  const gross_margin_pct = total_revenue_eur > 0 ? (gross_profit_eur / total_revenue_eur) * 100 : 0;
  const net_margin_pct = total_revenue_eur > 0 ? (net_profit_eur / total_revenue_eur) * 100 : 0;
  const roas = total_media_spend_eur > 0 ? total_revenue_eur / total_media_spend_eur : 0;

  return {
    country_id: monthlyMetrics[0]?.country_id || "",
    country_name: countryName,
    currency_code: currencyCode,
    total_revenue_eur,
    total_units,
    total_cogs_eur,
    total_media_spend_eur,
    gross_profit_eur,
    net_profit_eur,
    gross_margin_pct,
    net_margin_pct,
    roas,
  };
}

/**
 * Consolidate metrics across all countries
 */
export function consolidateMetrics(
  countryMetrics: CountryMetrics[]
): ConsolidatedMetrics {
  const total_revenue_eur = countryMetrics.reduce((sum, m) => sum + m.total_revenue_eur, 0);
  const total_units = countryMetrics.reduce((sum, m) => sum + m.total_units, 0);
  const total_cogs_eur = countryMetrics.reduce((sum, m) => sum + m.total_cogs_eur, 0);
  const total_media_spend_eur = countryMetrics.reduce((sum, m) => sum + m.total_media_spend_eur, 0);

  const gross_profit_eur = total_revenue_eur - total_cogs_eur;
  const net_profit_eur = gross_profit_eur - total_media_spend_eur;

  const gross_margin_pct = total_revenue_eur > 0 ? (gross_profit_eur / total_revenue_eur) * 100 : 0;
  const net_margin_pct = total_revenue_eur > 0 ? (net_profit_eur / total_revenue_eur) * 100 : 0;
  const roas = total_media_spend_eur > 0 ? total_revenue_eur / total_media_spend_eur : 0;

  return {
    total_revenue_eur,
    total_units,
    total_cogs_eur,
    total_media_spend_eur,
    gross_profit_eur,
    net_profit_eur,
    gross_margin_pct,
    net_margin_pct,
    roas,
  };
}

/**
 * Get unique months from data, sorted
 */
export function getUniqueMonths(sales: Sale[], mediaSpend: Tables<"media_spend">[]): string[] {
  const months = new Set<string>();
  sales.forEach((s) => months.add(s.month));
  mediaSpend.forEach((m) => months.add(m.month));
  return Array.from(months).sort();
}




