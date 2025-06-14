// src/components/PriceDisplay.tsx
import React, { useEffect, useRef } from "react";
import {
  MetalPrices,
  MetalType,
  PriceCategory,
} from "../interfaces/types";
import { TradeType } from "../interfaces/TradeTypes";
import { Card, Row, Col, Statistic, Button, Divider } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons"; // For price change indication (optional)

interface PriceDisplayProps {
  prices: MetalPrices | null;
  loading: boolean;
  error: string | null;
  onInitiateTrade: (metal: MetalType, type: TradeType) => void;
  isTradingActive: boolean;
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({
  prices,
  loading,
  error,
  onInitiateTrade,
  isTradingActive,
}) => {
  const previousPriceRef = useRef(prices); // Use useRef to store the previous price without causing re-renders

  // Helper function (could be outside the component or within a utility file)
  const getPriceTrendColor = (
    currentValue: number,
    previousValue: number | undefined
  ): string => {
    if (previousValue === undefined) {
      return "#000"; // Default black if previous value is not available
    }
    if (currentValue > previousValue) {
      return "#3f8600"; // Green
    } else if (currentValue < previousValue) {
      return "#cf1322"; // Red
    } else {
      return "#000"; // Black
    }
  };

  const textColor = (metal: MetalType, type: PriceCategory): string => {
    const previousPrice = previousPriceRef.current;

    // Handle cases where previousPrice data is not yet available or incomplete
    if (!previousPrice) {
      return "#000"; // Default black if no previous price data
    }

    let currentPrice: number | undefined;
    let prevPrice: number | undefined;

    if (metal === "gold") {
      if (type === "bid") {
        currentPrice = prices?.gold?.bid;
        prevPrice = previousPrice?.gold?.bid;
      } else {
        // type === "ask"
        currentPrice = prices?.gold?.ask;
        prevPrice = previousPrice?.gold?.ask;
      }
    } else {
      // metal === "silver"
      if (type === "bid") {
        currentPrice = prices?.silver?.bid;
        prevPrice = previousPrice?.silver?.bid;
      } else {
        // type === "ask"
        currentPrice = prices?.silver?.ask;
        prevPrice = previousPrice?.silver?.ask;
      }
    }

    // --- Comparison Logic ---
    // Ensure both currentPrice and prevPrice are valid numbers before comparison
    if (typeof currentPrice !== "number" || typeof prevPrice !== "number") {
      return "#000"; // Return black if either value is missing or not a number
    }

    if (currentPrice > prevPrice) {
      return "#3f8600"; // Green
    } else if (currentPrice < prevPrice) {
      return "#cf1322"; // Red
    } else {
      return "#000"; // Black (no change)
    }
  };

  const getSuffix = (color: string) => {
    if (color === "#3f8600") {
      return <ArrowUpOutlined />;
    } else if (color === "#cf1322") {
      return <ArrowDownOutlined />;
    }
    return;
  };

  // Update the previous price ref AFTER the current render cycle has used it
  // This useEffect ensures previousPriceRef.current is updated for the NEXT render's comparison
  useEffect(() => {
    previousPriceRef.current = prices;
  }, [prices]);

  if (error) {
    return (
      <Row justify="center" style={{ margin: "20px 0" }}>
        <Col>
          <Statistic
            title="Error"
            value={error}
            valueStyle={{ color: "#cf1322" }}
          />
        </Col>
      </Row>
    );
  }

  if (!prices) {
    return (
      <Row justify="center" style={{ margin: "20px 0" }}>
        <Col>
          <Statistic title="No Data Available" value="N/A" />
        </Col>
      </Row>
    );
  }

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
      <Col xs={24} sm={12}>
        <Card
          title="Gold Rates (24K)"
          bordered={false}
          className="metal-rate-card"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Statistic
                loading={loading}
                valueStyle={{
                  color: textColor(MetalType.Gold, PriceCategory.Bid),
                }}
                title="Bid (INR/10gm)"
                value={prices.gold.bid?.toFixed(2) || "N/A"}
                suffix={getSuffix(textColor(MetalType.Gold, PriceCategory.Bid))}
                prefix="₹"
              />
            </Col>
            <Col span={12}>
              <Statistic
                loading={loading}
                title="Ask (INR/10gm)"
                valueStyle={{
                  color: textColor(MetalType.Gold, PriceCategory.Ask),
                }}
                value={prices.gold.ask?.toFixed(2) || "N/A"}
                prefix="₹"
                suffix={getSuffix(textColor(MetalType.Gold, PriceCategory.Ask))}
              />
            </Col>
          </Row>
          <Divider style={{ margin: "16px 0" }} />
          <p style={{ textAlign: "center", color: "#888", fontSize: "0.85em" }}>
            Last Updated: {new Date(prices.lastUpdated).toLocaleTimeString()}
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 10,
              marginTop: 15,
            }}
          >
            <Button
              type="primary"
              onClick={() => onInitiateTrade(MetalType.Gold, TradeType.Buy)}
              disabled={isTradingActive || !prices.gold.ask}
              icon={<ArrowUpOutlined />}
            >
              Buy Gold
            </Button>
            <Button
              type="default"
              danger
              onClick={() => onInitiateTrade(MetalType.Gold, TradeType.Sell)}
              disabled={isTradingActive || !prices.gold.bid}
              icon={<ArrowDownOutlined />}
            >
              Sell Gold
            </Button>
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={12}>
        <Card title="Silver Rates" bordered={false} className="metal-rate-card">
          <Row gutter={16}>
            <Col span={12}>
              <Statistic
                valueStyle={{
                  color: textColor(MetalType.Silver, PriceCategory.Bid),
                }}
                loading={loading}
                title="Bid (INR/kg)"
                value={prices.silver.bid?.toFixed(2) || "N/A"}
                prefix="₹"
                suffix={getSuffix(
                  textColor(MetalType.Silver, PriceCategory.Bid)
                )}
              />
            </Col>
            <Col span={12}>
              <Statistic
                loading={loading}
                valueStyle={{
                  color: textColor(MetalType.Silver, PriceCategory.Ask),
                }}
                title="Ask (INR/kg)"
                value={prices.silver.ask?.toFixed(2) || "N/A"}
                prefix="₹"
                suffix={getSuffix(
                  textColor(MetalType.Silver, PriceCategory.Ask)
                )}
              />
            </Col>
          </Row>
          <Divider style={{ margin: "16px 0" }} />
          <p style={{ textAlign: "center", color: "#888", fontSize: "0.85em" }}>
            Last Updated: {new Date(prices.lastUpdated).toLocaleTimeString()}
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 10,
              marginTop: 15,
            }}
          >
            <Button
              type="primary"
              onClick={() => onInitiateTrade(MetalType.Silver, TradeType.Buy)}
              disabled={isTradingActive || !prices.silver.ask}
              icon={<ArrowUpOutlined />}
            >
              Buy Silver
            </Button>
            <Button
              type="default"
              danger
              onClick={() => onInitiateTrade(MetalType.Silver, TradeType.Sell)}
              disabled={isTradingActive || !prices.silver.bid}
              icon={<ArrowDownOutlined />}
            >
              Sell Silver
            </Button>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default PriceDisplay;
