import React, { useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  message,
  Space,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';

/* ================= TYPE ================= */
interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

/* ================= MOCK DATA ================= */
const initialProducts: Product[] = [
  { id: 1, name: 'Laptop Dell XPS 13', price: 25000000, quantity: 10 },
  { id: 2, name: 'iPhone 15 Pro Max', price: 30000000, quantity: 15 },
  { id: 3, name: 'Samsung Galaxy S24', price: 22000000, quantity: 20 },
  { id: 4, name: 'iPad Air M2', price: 18000000, quantity: 12 },
  { id: 5, name: 'MacBook Air M3', price: 28000000, quantity: 8 },
];

/* ================= COMPONENT ================= */
const QuanLySanPham: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [keyword, setKeyword] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [form] = Form.useForm<Product>();

  /* ===== THÊM SẢN PHẨM ===== */
  const handleAddProduct = async () => {
    try {
      const values = await form.validateFields();

      const newProduct: Product = {
        id: Date.now(),
        name: values.name,
        price: values.price,
        quantity: values.quantity,
      };

      setProducts(prev => [...prev, newProduct]);
      message.success('Thêm sản phẩm thành công');
      form.resetFields();
      setIsModalOpen(false);
    } catch (error) {
      // Validation fail
    }
  };

  /* ===== XÓA SẢN PHẨM ===== */
  const handleDelete = (id: number) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    message.success('Xóa sản phẩm thành công');
  };

  /* ===== TÌM KIẾM ===== */
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(keyword.toLowerCase())
  );

  /* ===== TABLE COLUMNS ===== */
  const columns: ColumnsType<Product> = [
    {
      title: 'STT',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
    },
    {
      title: 'Giá (VNĐ)',
      dataIndex: 'price',
      render: (price: number) => price.toLocaleString(),
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
    },
    {
      title: 'Thao tác',
      render: (_, record) => (
        <Popconfirm
          title="Bạn có chắc chắn muốn xóa?"
          onConfirm={() => handleDelete(record.id)}
        >
          <Button danger>Xóa</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2>Quản lý Sản phẩm</h2>

      {/* ===== SEARCH + ADD ===== */}
      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Tìm kiếm theo tên sản phẩm"
          allowClear
          onChange={e => setKeyword(e.target.value)}
        />
        <Button type="primary" onClick={() => setIsModalOpen(true)}>
          Thêm sản phẩm
        </Button>
      </Space>

      {/* ===== TABLE ===== */}
      <Table<Product>
        rowKey="id"
        columns={columns}
        dataSource={filteredProducts}
      />

      {/* ===== MODAL ADD ===== */}
      <Modal
        title="Thêm sản phẩm mới"
        visible={isModalOpen}
        onOk={handleAddProduct}
        onCancel={() => setIsModalOpen(false)}
        okText="Thêm"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tên sản phẩm"
            name="name"
            rules={[
              { required: true, message: 'Vui lòng nhập tên sản phẩm' },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Giá"
            name="price"
            rules={[
              { required: true, message: 'Vui lòng nhập giá' },
              { type: 'number', min: 1, message: 'Giá phải là số dương' },
            ]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Số lượng"
            name="quantity"
            rules={[
              { required: true, message: 'Vui lòng nhập số lượng' },
              {
                type: 'number',
                min: 1,
                message: 'Số lượng phải là số nguyên dương',
              },
            ]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default QuanLySanPham;
