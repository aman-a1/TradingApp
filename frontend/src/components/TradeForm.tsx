// src/components/TradeForm.tsx

import React, { useState, useEffect, useMemo } from "react";
import {
  Form,
  InputNumber,
  Button,
  Radio,
  Card,
  Typography,
  Input,
  Select,
} from "antd"; // HIGHLIGHT: Added Input, Select
import { CloseOutlined } from "@ant-design/icons";
import { MetalPriceDetail, MetalType } from "../interfaces/types";
import { TradeRequest, OrderType, OrderMode, TradeType } from "../interfaces/TradeTypes"; // HIGHLIGHT: Import OrderType

const { Title, Text } = Typography;
const { Option } = Select; // HIGHLIGHT: Destructure Option from Select

interface TradeFormProps {
  metal: "gold" | "silver";
  tradeType: "buy" | "sell";
  priceDetail: MetalPriceDetail;
  onTrade: (tradeRequest: TradeRequest) => void; // HIGHLIGHT: onTrade now accepts full TradeRequest
  onClose: () => void;
  isLoading: boolean;
}

const TradeForm: React.FC<TradeFormProps> = ({
  metal,
  tradeType,
  priceDetail,
  onTrade,
  onClose,
  isLoading,
}) => {
  const [form] = Form.useForm();
  const [orderMode, setOrderMode] = useState<OrderMode>(OrderMode.Market);
  const [pendingOrderType, setPendingOrderType] = useState<OrderType>(OrderType.Limit); // Only relevant if orderMode is 'pending'
  const quantity = Form.useWatch('quantity', form);
  const triggerPrice = Form.useWatch('triggerPrice', form);

  useEffect(() => {
    // Reset form fields and state when tradeType or metal changes
    form.resetFields();
    setOrderMode(OrderMode.Market);
    setPendingOrderType(OrderType.Limit);
  }, [metal, tradeType, form]);

  // Set initial quantity or trigger price if needed (e.g., if re-opening form)
  useEffect(() => {
    // Optional: Set default quantity to 1 for convenience
    form.setFieldsValue({ quantity: 1 });
  }, [form]);

  const onFinish = (values: any) => {
    const commonRequest: TradeRequest = {
      metal,
      action: tradeType,
      quantity: values.quantity,
      // Always include the current market price, even for pending orders,
      // as the backend API's TradeRequest expects it.
      price: tradeType === TradeType.Buy ? priceDetail.ask : priceDetail.bid,
    };

    if (orderMode === OrderMode.Market) {
      onTrade(commonRequest); // Execute immediate market trade
    } else {
      const pendingRequest: TradeRequest = {
        ...commonRequest,
        triggerPrice: values.triggerPrice,
        type: pendingOrderType,
      };
      onTrade(pendingRequest); // Place pending order
    }
  };

  const getPendingOrderTypeText = () => {
    if (tradeType === TradeType.Buy) {
      return "Limit Buy: Buy when price <= Trigger Price";
    } else {
      // sell
      if (pendingOrderType === OrderType.Limit) {
        return "Limit Sell: Sell when price >= Trigger Price";
      } else {
        // StopLoss
        return "Stop Loss: Sell when price <= Trigger Price";
      }
    }
  };

  const estimatedTotal = useMemo(() => {
    const qty = form.getFieldValue('quantity') || 1;
    let priceUsedForCalculation = 0;

    if (orderMode === OrderMode.Market) {
      priceUsedForCalculation = tradeType === TradeType.Buy ? priceDetail.ask : priceDetail.bid;
    } else { // pending order
      priceUsedForCalculation = form.getFieldValue('triggerPrice') || 0;
    }

    return (qty * priceUsedForCalculation);
  }, [quantity, triggerPrice, orderMode, tradeType, priceDetail.ask, priceDetail.bid, form]); // Dependencies for re-calculation
  // HIGHLIGHT END
  
  return (
    <Card
      title={
        <Title level={4} style={{ textAlign: "center", margin: 0 }}>
          {tradeType === TradeType.Buy ? "Buy" : "Sell"}{" "}
          {metal === MetalType.Gold ? "Gold" : "Silver"}
        </Title>
      }
      extra={<Button type="text" icon={<CloseOutlined />} onClick={onClose} />}
      bordered={false}
      style={{
        width: "100%",
        borderRadius: 12,
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
        padding: "16px 0",
        marginBottom: 20,
      }}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Metal"
          initialValue={metal === MetalType.Gold ? "Gold" : "Silver"}
        >
          <Input
            value={metal === MetalType.Gold ? "Gold" : "Silver"}
            readOnly
            bordered={false}
            style={{ fontWeight: "bold" }}
          />
        </Form.Item>

        <Form.Item
          label="Action"
          initialValue={tradeType === TradeType.Buy ? "Buy" : "Sell"}
        >
          <Input
            value={tradeType === TradeType.Buy ? "Buy" : "Sell"}
            readOnly
            bordered={false}
            style={{ fontWeight: "bold" }}
          />
        </Form.Item>

        <Form.Item label="Order Execution Mode">
          <Radio.Group
            onChange={(e) =>
              setOrderMode(e.target.value as OrderMode)
            }
            value={orderMode}
          >
            <Radio value={OrderMode.Market}>Market Order</Radio>
            <Radio value={OrderMode.Pending}>Pending Order (Limit/Stop-Loss)</Radio>
          </Radio.Group>
          <Text
            type="secondary"
            style={{ fontSize: "0.85em", display: "block", marginTop: "5px" }}
          >
            {orderMode === OrderMode.Market
              ? "Execute immediately at current market price."
              : "Execute when market price reaches your specified Trigger Price."}
          </Text>
        </Form.Item>
        <Form.Item
          label="Quantity"
          name="quantity"
          rules={[{ required: true, message: "Please input quantity!" }]}
        >
          <InputNumber
            min={1}
            step={1}
            style={{ width: "100%" }}
            placeholder={`Enter quantity in ${
              metal === MetalType.Gold ? "grams" : "kilograms"
            }`}
                        // parser={(value) => (value || "").replace(/( gm| kg)$/g, "")}
          />
        </Form.Item>

        {orderMode === OrderMode.Pending && (
          <>
            <Form.Item label="Pending Order Type">
              <Radio.Group
                onChange={(e) =>
                  setPendingOrderType(e.target.value as OrderType)
                }
                value={pendingOrderType}
              >
                <Radio value={OrderType.Limit}>Limit</Radio>
                {tradeType === "sell" && (
                  <Radio value={OrderType.StopLoss}>Stop Loss</Radio>
                )}{" "}
                {/* Stop Loss only for sell */}
              </Radio.Group>
              <Text
                type="secondary"
                style={{
                  display: "block",
                  fontSize: "0.85em",
                  marginTop: "5px",
                }}
              >
                {getPendingOrderTypeText()}
              </Text>
            </Form.Item>

            <Form.Item
              label="Trigger Price"
              name="triggerPrice"
              rules={[
                { required: true, message: "Please input trigger price!" },
              ]}
            >
              <InputNumber
                min={0.1}
                step={0.1}
                precision={4}
                style={{ width: "100%" }}
                placeholder="Enter trigger price"
                formatter={(value) =>
                  `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                // parser={(value) =>
                //   parseFloat(value!.replace(/₹\s?|(,*)/g, "") || "0")
                // }
              />
            </Form.Item>
          </>
        )}

        <div style={{ marginTop: 20, padding: '10px 0', borderTop: '1px solid #f0f0f0' }}>
          <Text strong>Estimated Total:</Text>
          <Title level={4} style={{ margin: '0', color: '#1890ff' }}>
            ₹ {estimatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
          </Title>
          <Text type="secondary" style={{ fontSize: '0.85em' }}>
            (Based on {orderMode === 'market' ? 'current market price' : 'your trigger price'})
          </Text>
        </div>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            block
            size="large"
          >
            {orderMode === OrderMode.Market
              ? "Execute Market Trade"
              : "Place Pending Order"}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default TradeForm;
