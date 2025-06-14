import React, { useState, useEffect, useCallback, useMemo } from "react";
import PriceDisplay from "./PriceDisplay";
import TradeForm from "./TradeForm";
import PortfolioSummary from "./PortfolioSummary"; // Correct path
import TradeHistory from "./TradeHistory";
import {
  MetalPrices,
  TraderMadeApiResponse,
  PortfolioItem,
  ActiveTradeFormState,
  MetalType,
  UserHoldings,
} from "../interfaces/types";
import { Layout, Button, Space, message, Typography } from "antd"; // Import AntD components
import { ReloadOutlined, LogoutOutlined } from "@ant-design/icons";
import axios from "axios";
import { Header, Content, Footer } from "antd/es/layout/layout";
import tradingService from "../apiService/tradingService";
import {
  Trade,
  TradeRequest,
  TradeResponse,
  TradeType,
} from "../interfaces/TradeTypes";
import PendingOrders from "./PendingOrders";

const { Title } = Typography;

// API Details for TraderMade
const TRADERMADE_API_KEY = "WSCHKYlsUPBIb8O0LbHO";
const TRADERMADE_API_URL = "https://marketdata.tradermade.com/api/v1/live";

// Constants for conversion
const GRAMS_PER_TROY_OUNCE = 31.1035;
const GRAMS_IN_10_GRAM_UNIT = 10;
const GRAMS_IN_1_KG_UNIT = 1000;

// Main Dashboard component (will be rendered after login)
const Dashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  // HIGHLIGHT START: New state for local auth details
  const [localAuthToken, setLocalAuthToken] = useState<string | null>(null);
  const [localUsername, setLocalUsername] = useState<string | null>(null);
  // HIGHLIGHT END

  const [prices, setPrices] = useState<MetalPrices | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Pseudo-trading state - now initialized from UserHoldings
  const [userHoldings, setUserHoldings] = useState<UserHoldings | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);

  // State for managing the active trade form
  const [activeTradeForm, setActiveTradeForm] =
    useState<ActiveTradeFormState | null>(null);

  // HIGHLIGHT START: Fetch auth token and username from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const user = localStorage.getItem("username");
    if (token && user) {
      setLocalAuthToken(token);
      setLocalUsername(user);
    } else {
      // If token/username not found, force logout (should ideally be handled by App.tsx redirect)
      onLogout();
    }
  }, [onLogout]);
  // HIGHLIGHT END

  const fetchUserHoldings = useCallback(async () => {
    try {
      if (!localAuthToken) {
        console.warn("Attempted to fetch holdings without an auth token.");
        return;
      }
      const holdings = await tradingService.getHoldings();
      setUserHoldings(holdings);
      message.success("Holdings updated from backend.");
    } catch (err: any) {
      console.error("Failed to fetch user holdings:", err);
      message.error(`Failed to load holdings: ${err.message}`);
    }
  }, [localAuthToken]);

  const fetchTrades = useCallback(async () => {
    try {
      if (!localAuthToken) {
        console.warn("Attempted to fetch holdings without an auth token.");
        return;
      }
      const history = await tradingService.getHistory();
      setTrades(history);
    } catch (err: any) {
      setTrades([]);
    }
  }, [localAuthToken]);

  const fetchMetalPrices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!TRADERMADE_API_KEY) {
        throw new Error(
          "TraderMade API key is not defined. Please set VITE_TRADERMADE_API_KEY in your .env.local file."
        );
      }

      const response = await axios.get<TraderMadeApiResponse>(
        `${TRADERMADE_API_URL}?currency=XAUINR,XAGINR&api_key=${TRADERMADE_API_KEY}`
      );

      const data = response.data;

      if (data.quotes && data.quotes.length > 0) {
        const goldQuote = data.quotes.find(
          (q) => q.base_currency + q.quote_currency == "XAUINR"
        );
        const silverQuote = data.quotes.find(
          (q) => q.base_currency + q.quote_currency == "XAGINR"
        );

        if (!goldQuote || !silverQuote) {
          throw new Error(
            "Missing Gold, Silver, or USDINR data from TraderMade API."
          );
        }

        // --- Gold Conversion ---
        const goldBidINRPerOunce = goldQuote.bid;
        const goldBidINRPer10Grams =
          (goldBidINRPerOunce / GRAMS_PER_TROY_OUNCE) * GRAMS_IN_10_GRAM_UNIT;

        const goldAskINRPerOunce = goldQuote.ask;
        const goldAskINRPer10Grams =
          (goldAskINRPerOunce / GRAMS_PER_TROY_OUNCE) * GRAMS_IN_10_GRAM_UNIT;

        // --- Silver Conversion ---
        const silverBidINRPerOunce = silverQuote.bid;
        const silverBidINRPerKg =
          (silverBidINRPerOunce / GRAMS_PER_TROY_OUNCE) * GRAMS_IN_1_KG_UNIT;

        const silverAskINRPerOunce = silverQuote.ask;
        const silverAskINRPerKg =
          (silverAskINRPerOunce / GRAMS_PER_TROY_OUNCE) * GRAMS_IN_1_KG_UNIT;

        setPrices({
          gold: {
            bid: goldBidINRPer10Grams,
            ask: goldAskINRPer10Grams,
            unit: "INR/10gm (24K)",
            currency: "INR",
          },
          silver: {
            bid: silverBidINRPerKg,
            ask: silverAskINRPerKg,
            unit: "INR/kg",
            currency: "INR",
          },
          lastUpdated: new Date().toISOString(),
        });
      } else {
        setError("Failed to fetch rates from TraderMade API.");
      }
    } catch (err: any) {
      console.error("Failed to fetch metal prices:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetalPrices(); // Fetch on initial mount
    // HIGHLIGHT: Only fetch holdings if localAuthToken is available
    if (localAuthToken) {
      fetchUserHoldings();
      fetchTrades();
    }
    const interval = setInterval(fetchMetalPrices, 30000);
    return () => clearInterval(interval);
  }, [fetchMetalPrices, fetchTrades, fetchUserHoldings, localAuthToken]);

  const handleTrade = useCallback(
    async (requestData: TradeRequest) => {
      if (!prices) {
        message.error("Cannot trade: Live prices not available.");
        return;
      }

      try {
        let tradeResponse: TradeResponse;
        if (requestData.action === "buy") {
          tradeResponse = await tradingService.buy(requestData);
        } else {
          // action is sell
          tradeResponse = await tradingService.sell(requestData);
        }

        message.success(tradeResponse.message);

        if (tradeResponse.trade) {
          setTrades((prevTrades) => [tradeResponse.trade, ...prevTrades]);
          if (tradeResponse.holdings) {
            setUserHoldings(tradeResponse.holdings);
          }
        } else if (tradeResponse.order) {
          // Pending order placed
          // No direct trade history entry or immediate holdings update for a pending order
          message.info(
            `Pending ${tradeResponse.order.type} ${tradeResponse.order.action} order placed for ${tradeResponse.order.quantity} ${tradeResponse.order.metal} at ₹${tradeResponse.order.triggerPrice}`
          );
        }
      } catch (err: any) {
        console.error("Trade/Order operation failed:", err);
        message.error(
          err.message || "Operation failed due to an unexpected error."
        );
      }
    },
    [prices]
  );

  const handleInitiateTrade = useCallback(
    (metal: MetalType, tradeType: TradeType) => {
      setActiveTradeForm({ metal, tradeType });
    },
    []
  );

  const handleCloseTradeForm = useCallback(() => {
    setActiveTradeForm(null);
  }, []);

  const memoizedGoldHolding: PortfolioItem = useMemo(() => {
    return {
      quantity: userHoldings?.goldHolding || 0,
      avgPrice: userHoldings?.averageGoldPrice || 0,
    };
  }, [userHoldings]); // Re-compute only when userHoldings changes

  const memoizedSilverHolding: PortfolioItem = useMemo(() => {
    return {
      quantity: userHoldings?.silverHolding || 0,
      avgPrice: userHoldings?.averageSilverPrice || 0,
    };
  }, [userHoldings]); // Re-compute only when userHoldings changes

  const memoizedPortfolioBalance: number = useMemo(() => {
    return userHoldings?.cashReserve || 0;
  }, [userHoldings]); // Re-compute only when userHoldings changes
  // HIGHLIGHT END

  return (
    <Layout className="antd-layout">
      <Header className="antd-header">
        <Title level={3} style={{ color: "white", margin: 0, float: "left" }}>
          Gold and Silver Pseudo-Trading
        </Title>
        <div style={{ float: "right" }}>
          <Space>
            <span style={{ color: "white", marginRight: "10px" }}>
              Welcome, {localUsername}
            </span>
            <Button type="default" icon={<LogoutOutlined />} onClick={onLogout}>
              Logout
            </Button>
          </Space>
        </div>
      </Header>
      <Content style={{ padding: "0 50px" }}>
        <div className="site-layout-content">
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <PriceDisplay
              prices={prices}
              loading={loading}
              error={error}
              onInitiateTrade={handleInitiateTrade}
              isTradingActive={activeTradeForm !== null}
            />

            <Button
              onClick={fetchMetalPrices}
              loading={loading}
              icon={<ReloadOutlined />}
              style={{ marginBottom: 20 }}
            >
              Refresh Rates
            </Button>

            {activeTradeForm && prices && (
              <TradeForm
                metal={activeTradeForm.metal}
                tradeType={activeTradeForm.tradeType}
                priceDetail={
                  activeTradeForm.metal === MetalType.Gold
                    ? prices.gold
                    : prices.silver
                }
                onTrade={(request) => {
                  // Pass the full TradeRequest from TradeForm
                  handleTrade(request);
                  handleCloseTradeForm();
                }}
                onClose={handleCloseTradeForm}
                isLoading={loading}
              />
            )}

            <PortfolioSummary
              prices={prices}
              balance={memoizedPortfolioBalance}
              gold={memoizedGoldHolding}
              silver={memoizedSilverHolding}
            />
            <PendingOrders />
            <TradeHistory trades={trades} />
          </Space>
        </div>
      </Content>
      <Footer style={{ textAlign: "center" }}>
        Ant Design Pseudo-Trading Dashboard ©{new Date().getFullYear()}
      </Footer>
    </Layout>
  );
};

export default Dashboard;
