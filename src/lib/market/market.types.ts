export type MarketDirection = "up" | "down" | "flat";

export interface MarketInstrument {
  id: string;
  symbol: string;
  displayName: string;
  price: string;
  rawPrice: number;
  change: string;
  changePercent: string;
  direction: MarketDirection;
  icon?: string;
  displayOrder: number;
  enabled: boolean;
  lastUpdated: string;
}

export interface MarketApiResponse {
  success: boolean;
  timestamp: string;
  data: MarketInstrument[];
}

export interface MarketTickerAdminConfig {
  refreshIntervalMs: number;
  enabledMarkets: string[];
  displayOrders: Record<string, number>;
}
