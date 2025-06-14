import React, { useState, useEffect, useCallback } from 'react';
import { Table, Typography, Button, Spin, Alert, message, Tag, Collapse } from 'antd'; // HIGHLIGHT: Import Collapse
import { ReloadOutlined } from '@ant-design/icons';
import { PendingOrder } from '../interfaces/TradeTypes';
import tradingService from '../apiService/tradingService';

const { Title, Text } = Typography;
const { Panel } = Collapse; // HIGHLIGHT: Destructure Panel from Collapse

const PendingOrders: React.FC = () => {
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const orders = await tradingService.getPendingOrders();
      setPendingOrders(orders);
      message.success('Pending orders loaded.');
    } catch (err: any) {
      console.error("Failed to fetch pending orders:", err);
      setError(err.message || 'Failed to load pending orders.');
      message.error(err.message || 'Failed to load pending orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingOrders();
    // Refresh pending orders every 60 seconds (adjust as needed)
    const interval = setInterval(fetchPendingOrders, 60000);
    return () => clearInterval(interval);
  }, [fetchPendingOrders]);

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'orderId',
      key: 'orderId',
    },
    {
      title: 'Metal',
      dataIndex: 'metal',
      key: 'metal',
      render: (text: string) => <Tag color={text === 'gold' ? 'gold' : 'blue'}>{text.toUpperCase()}</Tag>,
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (text: string) => <Tag color={text === 'buy' ? 'green' : 'red'}>{text.toUpperCase()}</Tag>,
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (value: number, record: PendingOrder) => `${value} ${record.metal === 'gold' ? 'gm' : 'kg'}`,
    },
    {
      title: 'Trigger Price',
      dataIndex: 'triggerPrice',
      key: 'triggerPrice',
      render: (value: number) => `₹ ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`,
    },
    {
      title: 'Order Type',
      dataIndex: 'type',
      key: 'type',
      render: (text: string) => <Tag color={text === 'Limit' ? 'geekblue' : 'volcano'}>{text}</Tag>,
    },
    {
      title: 'Placed At',
      dataIndex: 'placedAt',
      key: 'placedAt',
      render: (dateString: string) => new Date(dateString).toLocaleString(),
    },
  ];

  return (
    <Collapse
      defaultActiveKey={['1']} 
      style={{
        width: '100%',
        borderRadius: 12,
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
        marginBottom: 20
      }}
      expandIconPosition="end" 
    >
      <Panel
        header={<Title level={4} style={{ margin: 0 }}>Pending Orders</Title>}
        key="1"
        extra={ 
          <Button
            onClick={(e) => {
              e.stopPropagation();
              fetchPendingOrders();
            }}
            loading={loading}
            icon={<ReloadOutlined />}
            size="small"
          >
            Refresh
          </Button>
        }
      >
        <div style={{ padding: '16px 0' }}> {/* Inner padding for content */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <Spin size="large" tip="Loading pending orders..." />
            </div>
          )}
          {error && <Alert message="Error" description={error} type="error" showIcon style={{ marginBottom: 20 }} />}
          {!loading && !error && (
            <Table
              columns={columns}
              dataSource={pendingOrders.map(item => ({ ...item, key: item.orderId }))}
              pagination={{ pageSize: 5 }}
              scroll={{ x: 'max-content' }}
              locale={{ emptyText: <Text type="secondary">No pending orders found.</Text> }}
            />
          )}
        </div>
      </Panel>
    </Collapse>
  );
};

export default PendingOrders;
