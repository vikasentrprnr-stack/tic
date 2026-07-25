import { NextRequest, NextResponse } from "next/server";

export const COUNTRIES = [
  { id: "us", name: "United States", flag: "🇺🇸", currency: "USD", authority: "Federal Reserve", gdp: "$31.8T", perCapita: 92883, eq: "^GSPC", eqName: "S&P 500", eq2: "^IXIC", eq2Name: "NASDAQ", fx: "DX-Y.NYB" },
  { id: "cn", name: "China", flag: "🇨🇳", currency: "CNY", authority: "PBOC", gdp: "$20.7T", perCapita: 14730, eq: "000001.SS", eqName: "SSE Composite", fx: "CNY=X" },
  { id: "de", name: "Germany", flag: "🇩🇪", currency: "EUR", authority: "Bundesbank", gdp: "$5.3T", perCapita: 63600, eq: "^GDAXI", eqName: "DAX 40", fx: "EUR=X" },
  { id: "in", name: "India", flag: "🇮🇳", currency: "INR", authority: "Reserve Bank of India", gdp: "$4.5T", perCapita: 3051, eq: "^BSESN", eqName: "BSE Sensex", eq2: "^NSEI", eq2Name: "NIFTY 50", fx: "INR=X" },
  { id: "jp", name: "Japan", flag: "🇯🇵", currency: "JPY", authority: "Bank of Japan", gdp: "$4.5T", perCapita: 36391, eq: "^N225", eqName: "Nikkei 225", fx: "JPY=X" },
  { id: "uk", name: "United Kingdom", flag: "🇬🇧", currency: "GBP", authority: "Bank of England", gdp: "$4.2T", perCapita: 60011, eq: "^FTSE", eqName: "FTSE 100", fx: "GBP=X" },
  { id: "fr", name: "France", flag: "🇫🇷", currency: "EUR", authority: "Bank of France", gdp: "$3.6T", perCapita: 51708, eq: "^FCHI", eqName: "CAC 40", fx: "EUR=X" },
  { id: "ca", name: "Canada", flag: "🇨🇦", currency: "CAD", authority: "Bank of Canada", gdp: "$2.4T", perCapita: 58244, eq: "^GSPTSE", eqName: "S&P/TSX", fx: "CAD=X" },
  { id: "it", name: "Italy", flag: "🇮🇹", currency: "EUR", authority: "Bank of Italy", gdp: "$2.7T", perCapita: 45883, eq: "FTSEMIB.MI", eqName: "FTSE MIB", fx: "EUR=X" },
  { id: "br", name: "Brazil", flag: "🇧🇷", currency: "BRL", authority: "Central Bank of Brazil", gdp: "$2.3T", perCapita: 10709, eq: "^BVSP", eqName: "Bovespa", fx: "BRL=X" },
  { id: "au", name: "Australia", flag: "🇦🇺", currency: "AUD", authority: "RBA", gdp: "$1.9T", perCapita: 69358, eq: "^AXJO", eqName: "ASX 200", fx: "AUD=X" },
  { id: "kr", name: "South Korea", flag: "🇰🇷", currency: "KRW", authority: "Bank of Korea", gdp: "$1.9T", perCapita: 37523, eq: "^KS11", eqName: "KOSPI", fx: "KRW=X" },
  { id: "ch", name: "Switzerland", flag: "🇨🇭", currency: "CHF", authority: "SNB", gdp: "$1.1T", perCapita: 118173, eq: "^SSMI", eqName: "SMI", fx: "CHF=X" },
  { id: "sg", name: "Singapore", flag: "🇸🇬", currency: "SGD", authority: "MAS", gdp: "$606B", perCapita: 99042, eq: "^STI", eqName: "STI Index", fx: "SGD=X" },
  { id: "za", name: "South Africa", flag: "🇿🇦", currency: "ZAR", authority: "SARB", gdp: "$400B", perCapita: 6000, eq: "^J203.JO", eqName: "Top 40", fx: "ZAR=X" },
  { id: "es", name: "Spain", flag: "🇪🇸", currency: "EUR", authority: "Bank of Spain", gdp: "$2.0T", perCapita: 40582, eq: "^IBEX", eqName: "IBEX 35", fx: "EUR=X" },
  { id: "nl", name: "Netherlands", flag: "🇳🇱", currency: "EUR", authority: "DNB", gdp: "$1.4T", perCapita: 77881, eq: "^AEX", eqName: "AEX Index", fx: "EUR=X" },
  { id: "se", name: "Sweden", flag: "🇸🇪", currency: "SEK", authority: "Riksbank", gdp: "$711B", perCapita: 66124, eq: "^OMX", eqName: "OMX Stockholm", fx: "SEK=X" },
  { id: "mx", name: "Mexico", flag: "🇲🇽", currency: "MXN", authority: "Bank of Mexico", gdp: "$2.0T", perCapita: 15111, eq: "^MXX", eqName: "IPC Mexico", fx: "MXN=X" },
  { id: "id", name: "Indonesia", flag: "🇮🇩", currency: "IDR", authority: "Bank Indonesia", gdp: "$1.5T", perCapita: 5398, eq: "^JKSE", eqName: "IDX Composite", fx: "IDR=X" },
  { id: "ae", name: "UAE", flag: "🇦🇪", currency: "AED", authority: "CBUAE", gdp: "$601B", perCapita: 53842, eq: "DFMGI.AE", eqName: "DFM General", fx: "AED=X" }
].map(c => ({ ...c, perCapitaFormatted: `$${c.perCapita.toLocaleString()}` }));

const RANKED_COUNTRIES = [...COUNTRIES].sort((a, b) => b.perCapita - a.perCapita).map((c, i) => ({ ...c, rank: i + 1 }));

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tfParam = (searchParams.get("tf") || "1Y").toUpperCase();
  const countryId = searchParams.get("country");
  const rawTickerParam = searchParams.get("ticker");

  const generateMacroSeries = (base: number, volatility: number, suffix = "%") => {
    const data = Array.from({ length: 30 }, (_, i) => Number((base + Math.sin(i / 2) * volatility).toFixed(2)));
    const current = data[data.length - 1];
    const prev = data[0];
    const delta = ((current - prev) / prev) * 100;
    return {
      rawPrice: current, value: `${current}${suffix}`, delta: `${delta >= 0 ? "+" : ""}${delta.toFixed(2)}%`,
      isPositive: delta <= 0, data, fullChart: data.map((v, i) => ({ date: `Pt ${i}`, value: v }))
    };
  };

  const fetchMarketSeries = async (ticker: string) => {
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=${tfParam === '1D' ? '1d' : tfParam === '5D' ? '5d' : '1y'}&interval=${tfParam === '1D' ? '5m' : '1d'}`;
      const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" }, next: { revalidate: 300 } });
      if (!res.ok) throw new Error();
      const json = await res.json();
      const closeValues = json.chart.result[0].indicators.quote[0].close.filter((v: any) => v !== null);
      const current = closeValues[closeValues.length - 1];
      const prev = closeValues[0];
      const delta = ((current - prev) / prev) * 100;
      return {
        rawPrice: current, value: current, delta: `${delta >= 0 ? "+" : ""}${delta.toFixed(2)}%`,
        isPositive: delta >= 0, data: closeValues, fullChart: closeValues.map((v: any, i: number) => ({ date: `Day ${i}`, value: v }))
      };
    } catch {
      const base = ticker.includes("=") ? 80 : 5000;
      return { rawPrice: base, value: base, delta: "+1.2%", isPositive: true, data: Array(30).fill(base), fullChart: [] };
    }
  };

  // 1. Single Ticker Fetch
  if (rawTickerParam) {
    const cleanTicker = decodeURIComponent(rawTickerParam).replace(/^%5E/, '^');
    const cIdMatch = cleanTicker.split("-")[0].toLowerCase();
    const c = COUNTRIES.find(x => x.id === cIdMatch);

    if (cleanTicker.includes("-INF")) return NextResponse.json({ title: `${c?.name || 'Macro'} Inflation Rate`, countryId: c?.id, country: c?.name, flag: c?.flag, category: "Macro Indicator", nativeCurrency: "USD", ...generateMacroSeries(4.0, 0.5) });
    if (cleanTicker.includes("-UNP")) return NextResponse.json({ title: `${c?.name || 'Macro'} Unemployment`, countryId: c?.id, country: c?.name, flag: c?.flag, category: "Macro Indicator", nativeCurrency: "USD", ...generateMacroSeries(5.2, 0.3) });
    if (cleanTicker.includes("-POL")) return NextResponse.json({ title: `${c?.name || 'Macro'} Policy Rate`, countryId: c?.id, country: c?.name, flag: c?.flag, category: "Central Bank Policy", nativeCurrency: "USD", ...generateMacroSeries(4.5, 0.1) });

    const cEq = COUNTRIES.find(x => x.eq === cleanTicker || x.eq2 === cleanTicker || x.fx === cleanTicker);
    const title = cEq?.eq === cleanTicker ? cEq.eqName : cEq?.eq2 === cleanTicker ? cEq.eq2Name : cEq?.fx === cleanTicker ? `${cEq.currency} vs USD` : cleanTicker;
    
    const data = await fetchMarketSeries(cleanTicker);
    return NextResponse.json({ title, countryId: cEq?.id, country: cEq?.name, flag: cEq?.flag, category: "Market Asset", nativeCurrency: cEq?.currency || "USD", ...data });
  }

  // 2. Country Profile Fetch
  if (countryId) {
    const c = RANKED_COUNTRIES.find(c => c.id === countryId);
    if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });
    
    const [eqData, fxData] = await Promise.all([fetchMarketSeries(c.eq), fetchMarketSeries(c.fx)]);
    const indicators = [
      { id: `${c.id}-eq`, category: "Equities", nativeCurrency: c.currency, ticker: c.eq, title: c.eqName, country: c.name, flag: c.flag, gdp: c.gdp, perCapita: c.perCapitaFormatted, ...eqData },
      { id: `${c.id}-fx`, category: "Forex", nativeCurrency: "USD", ticker: c.fx, title: `${c.currency} vs USD`, country: c.name, flag: c.flag, gdp: c.gdp, perCapita: c.perCapitaFormatted, ...fxData },
      { id: `${c.id}-inf`, category: "Macro", nativeCurrency: "USD", ticker: `${c.id.toUpperCase()}-INF`, title: "Inflation Rate", country: c.name, flag: c.flag, gdp: c.gdp, perCapita: c.perCapitaFormatted, ...generateMacroSeries(4.2, 0.5) },
      { id: `${c.id}-pol`, category: "Macro", nativeCurrency: "USD", ticker: `${c.id.toUpperCase()}-POL`, title: "Policy Rate", country: c.name, flag: c.flag, gdp: c.gdp, perCapita: c.perCapitaFormatted, ...generateMacroSeries(4.5, 0.1) }
    ];

    if (c.eq2) {
      const eq2Data = await fetchMarketSeries(c.eq2);
      indicators.splice(1, 0, { id: `${c.id}-eq2`, category: "Equities", nativeCurrency: c.currency, ticker: c.eq2, title: c.eq2Name, country: c.name, flag: c.flag, gdp: c.gdp, perCapita: c.perCapitaFormatted, ...eq2Data });
    }

    return NextResponse.json({ profile: c, rankedList: RANKED_COUNTRIES, indicators });
  }

  // 3. Massive 80+ Card Dashboard Fetch (High-Speed Concurrent Batching)
  const fetchPromises = RANKED_COUNTRIES.map(async (c) => {
    const promises = [
      fetchMarketSeries(c.eq).then(eqData => ({ id: `${c.id}-eq`, category: "Equities", nativeCurrency: c.currency, ticker: c.eq, title: c.eqName, country: c.name, flag: c.flag, authority: c.authority, gdp: c.gdp, perCapita: c.perCapitaFormatted, ...eqData }))
    ];
    
    if (c.eq2) {
      promises.push(fetchMarketSeries(c.eq2).then(eq2Data => ({ id: `${c.id}-eq2`, category: "Equities", nativeCurrency: c.currency, ticker: c.eq2, title: c.eq2Name, country: c.name, flag: c.flag, authority: c.authority, gdp: c.gdp, perCapita: c.perCapitaFormatted, ...eq2Data })));
    }

    promises.push(fetchMarketSeries(c.fx).then(fxData => ({ id: `${c.id}-fx`, category: "Forex", nativeCurrency: "USD", ticker: c.fx, title: `${c.currency} vs USD`, country: c.name, flag: c.flag, authority: c.authority, gdp: c.gdp, perCapita: c.perCapitaFormatted, ...fxData })));
    
    promises.push(Promise.resolve({ id: `${c.id}-inf`, category: "Macro", nativeCurrency: "USD", ticker: `${c.id.toUpperCase()}-INF`, title: "Inflation Rate", country: c.name, flag: c.flag, authority: c.authority, gdp: c.gdp, perCapita: c.perCapitaFormatted, ...generateMacroSeries(4.2, 0.5) }));
    
    return Promise.all(promises);
  });

  // Await all countries and their sub-indicators concurrently, then flatten the array
  const nestedData = await Promise.all(fetchPromises);
  const allData = nestedData.flat();
  
  return NextResponse.json({ list: allData, countries: RANKED_COUNTRIES });
}