"use client";

import useSWR from "swr";
import { MarketApiResponse, MarketInstrument } from "@/lib/market/market.types";
import { INITIAL_MARKET_DATA, DEFAULT_TICKER_REFRESH_INTERVAL_MS } from "@/lib/market/market.constants";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export interface UseMarketTickerResult {
  instruments: MarketInstrument[];
  isLoading: boolean;
  isError: boolean;
  lastUpdated: string | null;
  mutate: () => void;
}

export function useMarketTicker(): UseMarketTickerResult {
  const { data, error, isLoading, mutate } = useSWR<MarketApiResponse>(
    "/api/market",
    fetcher,
    {
      refreshInterval: DEFAULT_TICKER_REFRESH_INTERVAL_MS,
      revalidateOnFocus: true,
      dedupingInterval: 10000,
      fallbackData: {
        success: true,
        timestamp: new Date().toISOString(),
        data: INITIAL_MARKET_DATA,
      },
    }
  );

  return {
    instruments: data?.data || INITIAL_MARKET_DATA,
    isLoading: isLoading && !data,
    isError: !!error,
    lastUpdated: data?.timestamp || null,
    mutate,
  };
}
