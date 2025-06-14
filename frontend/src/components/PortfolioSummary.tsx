/* eslint-disable react/jsx-no-undef */
// src/components/PortfolioSummary.tsx
import React from "react";
import { MetalPrices, PortfolioItem } from "../interfaces/types";
import { Card, Col, Divider, Row, Statistic, Typography } from "antd";
import { DollarOutlined, GoldOutlined, WalletOutlined} from "@ant-design/icons";
const { Text } = Typography;

interface PortfolioSummaryProps {
  prices: MetalPrices | null;
  balance: number;
  gold: PortfolioItem;
  silver: PortfolioItem;
}

const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({
  prices,
  balance,
  gold,
  silver,
}) => {
  const TotalValue = prices
    ? balance +
      gold.quantity * prices?.gold.bid +
      silver.quantity * prices!.silver.bid
    : -1;
  return (
    <Card title="Your Portfolio" bordered={false} style={{ marginBottom: 20 }}>
      {TotalValue != -1 ? (
        <Statistic
          title="Total Portfolio Value"
          value={TotalValue.toFixed(2)}
          prefix="₹"
        />
      ) : (
        <Text> Can not evaluate exact value of your portfolio </Text>
      )}
      <Row gutter={[16, 16]} justify="center">
        {" "}
        {/* Use Ant Design Row and Col for responsive layout */}
        <Col xs={24} sm={12} md={8} lg={8}>
          <Statistic
            title={
              <Text type="secondary">
                <DollarOutlined /> Cash Reserve
              </Text>
            } // HIGHLIGHT: Icon and secondary text
            value={balance}
            precision={2}
            prefix="₹"
            valueStyle={{ color: "#3f8600", fontSize: "28px" }} // Green color for positive balance
          />
        </Col>
        
        <Col xs={24} sm={12} md={8} lg={8}>
          <Statistic
            title={
              <Text type="secondary">
                <GoldOutlined /> Gold Holdings
              </Text>
            } // HIGHLIGHT: Icon
            value={gold.quantity*10}
            precision={2}
            suffix="gm"
            valueStyle={{ fontSize: "28px" }}
          />
          <Statistic
            title={<Text type="secondary">Avg. Price</Text>}
            value={gold.avgPrice}
            precision={4}
            prefix="₹"
            suffix="/10gm"
            valueStyle={{ fontSize: "18px" }}
          />
           <Statistic
            title={<Text type="secondary">Total Value</Text>}
            value={gold.avgPrice * gold.quantity}
            precision={4}
            prefix="₹"
            suffix=""
            valueStyle={{ fontSize: "18px" }}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={8}>
          <Statistic
            title={
              <Text type="secondary">
                <WalletOutlined /> Silver Holdings
              </Text>
            } // HIGHLIGHT: Icon
            value={silver.quantity}
            precision={2}
            suffix="kg"
            valueStyle={{ fontSize: "28px" }}
          />
          <Statistic
            title={<Text type="secondary">Avg. Price</Text>}
            value={silver.avgPrice}
            precision={4}
            prefix="₹"
            suffix="/kg"
            valueStyle={{ fontSize: "18px" }}
          />
            <Statistic
            title={<Text type="secondary">Total Value</Text>}
            value={silver.avgPrice * silver.quantity}
            precision={4}
            prefix="₹"
            suffix=""
            valueStyle={{ fontSize: "18px" }}
          />
        </Col>
      </Row>
      <Divider style={{ margin: "24px 0" }} /> {/* Add margin to divider */}
      <Text
        type="secondary"
        style={{ display: "block", textAlign: "center", marginTop: "10px" }}
      >
        Holdings and Cash Reserve are updated in real-time with your trades.
      </Text>
    </Card>
  );
};

export default PortfolioSummary;
