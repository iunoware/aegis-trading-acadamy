"use client";

import { useEffect, useRef } from "react";

export default function TradingTicker() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.async = true;

    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: "FOREXCOM:SPXUSD", title: "S&P 500 Index" },
        { proName: "FOREXCOM:NSXUSD", title: "US 100 Cash CFD" },
        { proName: "FX_IDC:EURUSD", title: "EUR to USD" },
        { proName: "BITSTAMP:BTCUSD", title: "Bitcoin" },
        { proName: "BITSTAMP:ETHUSD", title: "Ethereum" },
        { description: "GBP/JPY", proName: "OANDA:GBPJPY" },
        { description: "EUR/USD", proName: "FX:EURUSD" },
        { description: "XAU/USD", proName: "OANDA:XAUUSD" },
        { description: "XAG/USD", proName: "OANDA:XAGUSD" },
        { description: "EURJPY", proName: "OANDA:EURJPY" },
        { description: "GBP/USD", proName: "OANDA:GBPUSD" },
        { description: "GBP/AUD", proName: "OANDA:GBPAUD" },
        { description: "USOIL", proName: "TVC:USOIL" },
        { description: "EUR/NZD", proName: "OANDA:EURNZD" },
      ],
      showSymbolLogo: true,
      colorTheme: "dark",
      isTransparent: false,
      displayMode: "compact",
      locale: "en",
    });

    containerRef.current.appendChild(script);
  }, []);

  return (
    <div className="w-full bg-black border-t border-white/10">
      <div ref={containerRef} />
    </div>
  );
}
