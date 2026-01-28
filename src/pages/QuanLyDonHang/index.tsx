import React, { useMemo, useState } from 'react';
import {
  Table,
  Tag,
  Input,
  Select,
  Row,
  Col,
  DatePicker,
  Divider,
} from 'antd';
import moment from 'moment';

/* =======================
   KIỂU DỮ LIỆU
======================= */
interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
}

interface OrderProduct {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

type OrderStatus = 'Chờ xử lý' | 'Đang giao' | 'Hoàn thành' | 'Đã hủy';

interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  products: OrderProduct[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
}

/* =======================
   DỮ LIỆU MẪU (CHUNG)
======================= */
const productData: Product[] = [
  { id: 1, name: 'Laptop Dell XPS 13', category: 'Laptop', price: 25000000, quantity: 15 },
  { id: 2, name: 'iPhone 15 Pro Max', category: 'Điện thoại', price: 30000000, quantity: 8 },
  { id: 3, name: 'Samsung Galaxy S24', category: 'Điện thoại', price: 22000000, quantity: 20 },
  { id: 4, name: 'iPad Air M2', category: 'Máy tính bảng', price: 18000000, quantity: 5 },
  { id: 5, name: 'MacBook Air M3', category: 'Laptop', price: 28000000, quantity: 12 },
  { id: 6, name: 'AirPods Pro 2', category: 'Phụ kiện', price: 6000000, quantity: 0 },
  { id: 7, name: 'Samsung Galaxy Tab S9', category: 'Máy tính bảng', price: 15000000, quantity: 7 },
  { id: 8, name: 'Logitech MX Master 3', category: 'Phụ kiện', price: 2500000, quantity: 25 },
];

const initialOrders: Order[] = [
  {
    id: 'DH001',
    customerName: 'Nguyễn Văn A',
    phone: '0912345678',
    address: '123 Nguyễn Huệ, Q1, TP.HCM',
    products: [
      {
        productId: 1,
        productName: 'Laptop Dell XPS 13',
        quantity: 1,
        price: 25000000,
      },
    ],
    totalAmount: 25000000,
    status: 'Chờ xử lý',
    createdAt: '2024-01-15',
  },
];

/* =======================
   COMPONENT CHÍNH
======================= */
const QuanLyDonHang: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>();
  const [dateRange, setDateRange] =
    useState<[moment.Moment, moment.Moment] | null>(null);

  /* =======================
     LỌC ĐƠN HÀNG
  ======================= */
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchSearch =
        o.id.toLowerCase().includes(searchText.toLowerCase()) ||
        o.customerName.toLowerCase().includes(searchText.toLowerCase());

      const matchStatus = statusFilter ? o.status === statusFilter : true;

      const matchDate = dateRange
        ? moment(o.createdAt).isBetween(
            dateRange[0],
            dateRange[1],
            'day',
            '[]'
          )
        : true;

      return matchSearch && matchStatus && matchDate;
    });
  }, [orders, searchText, statusFilter, dateRange]);

  /* =======================
     CỘT BẢNG
  ======================= */
  const columns = [
    { title: 'Mã đơn', dataIndex: 'id' },
    { title: 'Khách hàng', dataIndex: 'customerName' },
    {
      title: 'Số SP',
      render: (_: any, record: Order) => record.products.length,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      render: (v: number) => v.toLocaleString() + ' ₫',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (s: OrderStatus) => {
        const color =
          s === 'Hoàn thành'
            ? 'green'
            : s === 'Đang giao'
            ? 'blue'
            : s === 'Đã hủy'
            ? 'red'
            : 'orange';
        return <Tag color={color}>{s}</Tag>;
      },
    },
    { title: 'Ngày tạo', dataIndex: 'createdAt' },
  ];

  return (
    <>
      <h2>Quản lý Đơn hàng</h2>

      <Divider />

      {/* BỘ LỌC */}
      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Input
            placeholder="Tìm mã đơn / khách hàng"
            allowClear
            onChange={e => setSearchText(e.target.value)}
          />
        </Col>

        <Col span={5}>
          <Select
            allowClear
            placeholder="Trạng thái"
            style={{ width: '100%' }}
            onChange={v => setStatusFilter(v)}
          >
            <Select.Option value="Chờ xử lý">Chờ xử lý</Select.Option>
            <Select.Option value="Đang giao">Đang giao</Select.Option>
            <Select.Option value="Hoàn thành">Hoàn thành</Select.Option>
            <Select.Option value="Đã hủy">Đã hủy</Select.Option>
          </Select>
        </Col>

        <Col span={7}>
          <DatePicker.RangePicker
            style={{ width: '100%' }}
            onChange={v => setDateRange(v as any)}
          />
        </Col>
      </Row>

      {/* BẢNG ĐƠN HÀNG */}
      <Table<Order>
        rowKey="id"
        columns={columns}
        dataSource={filteredOrders}
        pagination={{ pageSize: 5 }}
      />
    </>
  );
};

export default QuanLyDonHang;
