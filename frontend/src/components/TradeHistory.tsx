// src/components/TradeHistory.tsx
import React from 'react';
import { Trade } from '../interfaces/TradeTypes';
import { Card, Table, Tag } from 'antd';

interface TradeHistoryProps {
  trades: Trade[];
}

const TradeHistory: React.FC<TradeHistoryProps> = ({ trades }) => {
  const columns = [
    {
      title: 'Time',
      dataIndex: 'dateTime',
      key: 'timestamp',
      render: (text: string) => new Date(text).toLocaleTimeString(),
      sorter: (a: Trade, b: Trade) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime(),
    },
    {
      title: 'Metal',
      dataIndex: 'metal',
      key: 'metal',
      render: (text: string) => text.charAt(0).toUpperCase() + text.slice(1),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (type: 'buy' | 'sell') => (
        <Tag color={type === 'buy' ? 'green' : 'red'}>{type.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Qty',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (qty: number, record: Trade) => (
        `${qty.toFixed(2)} ${record.metal === 'gold' ? '10gm' : 'kg'}`
      ),
    },
    {
      title: 'Price/Unit',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `₹${price.toFixed(2)}`,
    }
  ];

  return (
    <Card title="Trade History" bordered={false} >
      <Table
        columns={columns}
        dataSource={trades}
        rowKey="id"
        pagination={{ pageSize: 5 }} // Show 5 trades per page
        scroll={{ x: 'max-content' }} // Enable horizontal scroll for smaller screens
      />
    </Card>
  );
};

export default TradeHistory;