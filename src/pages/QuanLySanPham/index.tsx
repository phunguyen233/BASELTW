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
  Tag,
  Select,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';

/* ================= TYPE ================= */
interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
}

// Form KHÔNG có id
type ProductForm = Omit<Product, 'id'>;

/* ================= MOCK DATA ================= */
const initialProducts: Product[] = [
  { id: 1, name: 'Laptop Dell XPS 13', category: 'Laptop', price: 25000000, quantity: 15 },
  { id: 2, name: 'iPhone 15 Pro Max', category: 'Điện thoại', price: 30000000, quantity: 8 },
  { id: 3, name: 'Samsung Galaxy S24', category: 'Điện thoại', price: 22000000, quantity: 20 },
  { id: 4, name: 'iPad Air M2', category: 'Máy tính bảng', price: 18000000, quantity: 5 },
  { id: 5, name: 'MacBook Air M3', category: 'Laptop', price: 28000000, quantity: 12 },
  { id: 6, name: 'AirPods Pro 2', category: 'Phụ kiện', price: 6000000, quantity: 0 },
  { id: 7, name: 'Samsung Galaxy Tab S9', category: 'Máy tính bảng', price: 15000000, quantity: 7 },
  { id: 8, name: 'Logitech MX Master 3', category: 'Phụ kiện', price: 2500000, quantity: 4 },
];

/* ================= COMPONENT ================= */
const QuanLySanPham: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [keyword, setKeyword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form] = Form.useForm<ProductForm>();

  /* ===== TRẠNG THÁI ===== */
  const renderStatus = (quantity: number) => {
    if (quantity === 0) return <Tag color="red">Hết hàng</Tag>;
    if (quantity <= 10) return <Tag color="orange">Sắp hết</Tag>;
    return <Tag color="green">Còn hàng</Tag>;
  };

  /* ===== THÊM / SỬA ===== */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingProduct) {
        setProducts(prev =>
          prev.map(p =>
            p.id === editingProduct.id
              ? { ...editingProduct, ...values }
              : p
          )
        );
        message.success('Cập nhật sản phẩm thành công');
      } else {
        setProducts(prev => [
          ...prev,
          {
            id: Date.now(),
            ...values,
          },
        ]);
        message.success('Thêm sản phẩm thành công');
      }

      form.resetFields();
      setEditingProduct(null);
      setIsModalOpen(false);
    } catch {
      // validate error
    }
  };

  /* ===== XÓA ===== */
  const handleDelete = (id: number) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    message.success('Xóa sản phẩm thành công');
  };

  /* ===== SỬA ===== */
  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    form.setFieldsValue({
      name: product.name,
      category: product.category,
      price: product.price,
      quantity: product.quantity,
    });
    setIsModalOpen(true);
  };

  /* ===== TÌM KIẾM ===== */
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(keyword.toLowerCase())
  );

  /* ===== TABLE ===== */
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
      title: 'Danh mục',
      dataIndex: 'category',
    },
    {
      title: 'Giá (VNĐ)',
      dataIndex: 'price',
      render: (price: number) => price.toLocaleString(),
    },
    {
      title: 'Tồn kho',
      dataIndex: 'quantity',
    },
    {
      title: 'Trạng thái',
      render: (_, record) => renderStatus(record.quantity),
    },
    {
      title: 'Thao tác',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger type="link">
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2>Quản lý Sản phẩm</h2>

      {/* SEARCH + ADD */}
      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Tìm theo tên sản phẩm"
          allowClear
          onChange={e => setKeyword(e.target.value)}
        />
        <Button
          type="primary"
          onClick={() => {
            setEditingProduct(null);
            form.resetFields();
            setIsModalOpen(true);
          }}
        >
          Thêm sản phẩm
        </Button>
      </Space>

      {/* TABLE */}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredProducts}
        pagination={{ pageSize: 5 }}
      />

      {/* MODAL */}
      <Modal
        title={editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
        visible={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
          form.resetFields();
        }}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tên sản phẩm"
            name="name"
            rules={[{ required: true, message: 'Nhập tên sản phẩm' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Danh mục"
            name="category"
            rules={[{ required: true, message: 'Chọn danh mục' }]}
          >
            <Select placeholder="Chọn danh mục">
              <Select.Option value="Laptop">Laptop</Select.Option>
              <Select.Option value="Điện thoại">Điện thoại</Select.Option>
              <Select.Option value="Máy tính bảng">Máy tính bảng</Select.Option>
              <Select.Option value="Phụ kiện">Phụ kiện</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Giá"
            name="price"
            rules={[{ required: true, type: 'number', min: 1 }]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Số lượng tồn kho"
            name="quantity"
            rules={[{ required: true, type: 'number', min: 0 }]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default QuanLySanPham;
