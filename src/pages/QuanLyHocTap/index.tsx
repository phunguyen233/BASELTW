import React, { useEffect, useState } from "react";
import {
  Layout,
  Card,
  Input,
  Button,
  Modal,
  Form,
  DatePicker,
  InputNumber,
  Typography,
  Progress,
  Popconfirm,
  message,
  Tabs,
  Select,
  Table,
  Row,
  Col,
  Space,
} from "antd";
import dayjs from "dayjs";

const { Header, Content } = Layout;
const { Title } = Typography;
const { TabPane } = Tabs;

interface MonHoc {
  id: string;
  ten: string;
  mucTieuThang: number;
}

interface LichHoc {
  id: string;
  monHocId: string;
  thoiGian: string;
  thoiLuong: number;
  noiDung: string;
  ghiChu: string;
}

const QuanLyHocTap: React.FC = () => {
  const [danhSachMon, setDanhSachMon] = useState<MonHoc[]>([]);
  const [danhSachLich, setDanhSachLich] = useState<LichHoc[]>([]);
  const [monDangSua, setMonDangSua] = useState<MonHoc | null>(null);
  const [lichDangSua, setLichDangSua] = useState<LichHoc | null>(null);
  const [moModalMon, setMoModalMon] = useState(false);
  const [moModalLich, setMoModalLich] = useState(false);
  const [mucTieuTongThang, setMucTieuTongThang] = useState<number>(0);

  const [form] = Form.useForm();
  const [formMon] = Form.useForm();

  // ================= LOCAL STORAGE =================
  useEffect(() => {
    const mon = localStorage.getItem("monHoc");
    const lich = localStorage.getItem("lichHoc");
    const mucTieuTong = localStorage.getItem("mucTieuTong");

    if (mon) setDanhSachMon(JSON.parse(mon));
    if (lich) setDanhSachLich(JSON.parse(lich));
    if (mucTieuTong) setMucTieuTongThang(JSON.parse(mucTieuTong));
  }, []);

  useEffect(() => {
    localStorage.setItem("monHoc", JSON.stringify(danhSachMon));
    localStorage.setItem("lichHoc", JSON.stringify(danhSachLich));
    localStorage.setItem("mucTieuTong", JSON.stringify(mucTieuTongThang));
  }, [danhSachMon, danhSachLich, mucTieuTongThang]);

  // ================= CRUD MÔN =================
  const luuMon = (values: any) => {
    if (monDangSua) {
      setDanhSachMon(
        danhSachMon.map((m) =>
          m.id === monDangSua.id ? { ...m, ten: values.ten } : m
        )
      );
      message.success("Đã cập nhật môn");
    } else {
      setDanhSachMon([
        ...danhSachMon,
        { id: Date.now().toString(), ten: values.ten, mucTieuThang: 0 },
      ]);
      message.success("Đã thêm môn");
    }
    setMoModalMon(false);
  };

  const xoaMon = (id: string) => {
    setDanhSachMon(danhSachMon.filter((m) => m.id !== id));
    setDanhSachLich(danhSachLich.filter((l) => l.monHocId !== id));
    message.success("Đã xóa môn");
  };

  // ================= CRUD LỊCH =================
  const luuLich = (values: any) => {
    if (lichDangSua) {
      setDanhSachLich(
        danhSachLich.map((l) =>
          l.id === lichDangSua.id
            ? { ...l, ...values, thoiGian: values.thoiGian.format() }
            : l
        )
      );
      message.success("Đã cập nhật lịch");
    } else {
      setDanhSachLich([
        ...danhSachLich,
        {
          id: Date.now().toString(),
          ...values,
          thoiGian: values.thoiGian.format(),
        },
      ]);
      message.success("Đã thêm lịch");
    }
    setMoModalLich(false);
  };

  const xoaLich = (id: string) => {
    setDanhSachLich(danhSachLich.filter((l) => l.id !== id));
    message.success("Đã xóa lịch");
  };

  const tongGioMon = (monId: string) =>
    danhSachLich
      .filter((l) => l.monHocId === monId)
      .reduce((sum, l) => sum + l.thoiLuong, 0);

  const tongGioTatCa = () =>
    danhSachLich.reduce((sum, l) => sum + l.thoiLuong, 0);

  // ================= COLUMNS TABLE =================
  const columnsMon = [
    { title: "Tên môn", dataIndex: "ten" },
    {
      title: "Hành động",
      render: (_: any, record: MonHoc) => (
        <Space>
          <Button
            size="small"
            onClick={() => {
              setMonDangSua(record);
              formMon.setFieldsValue({ ten: record.ten });
              setMoModalMon(true);
            }}
          >
            Sửa
          </Button>
          <Popconfirm title="Xóa môn?" onConfirm={() => xoaMon(record.id)}>
            <Button danger size="small">
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const columnsLich = [
    {
      title: "Môn",
      render: (_: any, record: LichHoc) =>
        danhSachMon.find((m) => m.id === record.monHocId)?.ten,
    },
    {
      title: "Thời gian",
      render: (_: any, record: LichHoc) =>
        dayjs(record.thoiGian).format("DD/MM/YYYY HH:mm"),
    },
    { title: "Giờ", dataIndex: "thoiLuong" },
    { title: "Nội dung", dataIndex: "noiDung" },
    { title: "Ghi chú", dataIndex: "ghiChu" },
    {
      title: "Hành động",
      render: (_: any, record: LichHoc) => (
        <Space>
          <Button
            size="small"
            onClick={() => {
              setLichDangSua(record);
              form.setFieldsValue({
                ...record,
                thoiGian: dayjs(record.thoiGian),
              });
              setMoModalLich(true);
            }}
          >
            Sửa
          </Button>
          <Popconfirm title="Xóa?" onConfirm={() => xoaLich(record.id)}>
            <Button danger size="small">
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Layout>
      <Header style={{ color: "white", fontSize: 20 }}>
        Quản Lý Học Tập
      </Header>

      <Content style={{ padding: 30 }}>
        <Tabs defaultActiveKey="1">

          {/* TAB 1 */}
          <TabPane tab="Quản Lý Danh Mục" key="1">
            <Button
              type="primary"
              style={{ marginBottom: 15 }}
              onClick={() => {
                setMonDangSua(null);
                formMon.resetFields();
                setMoModalMon(true);
              }}
            >
              Thêm Môn
            </Button>

            <Table
              dataSource={danhSachMon}
              columns={columnsMon}
              rowKey="id"
              bordered
              pagination={false}
            />
          </TabPane>

          {/* TAB 2 */}
          <TabPane tab="Quản Lý Tiến Độ" key="2">
            <Button
              type="primary"
              style={{ marginBottom: 15 }}
              onClick={() => {
                if (danhSachMon.length === 0) {
                  message.warning("Thêm môn trước!");
                  return;
                }
                setLichDangSua(null);
                form.resetFields();
                setMoModalLich(true);
              }}
            >
              Thêm Lịch
            </Button>

            <Table
              dataSource={danhSachLich}
              columns={columnsLich}
              rowKey="id"
              bordered
            />
          </TabPane>

          {/* TAB 3 */}
          <TabPane tab="Mục Tiêu Hàng Tháng" key="3">
            <Card size="small" style={{ marginBottom: 20 }}>
              <Title level={5}>Mục tiêu tổng tháng</Title>
              <InputNumber
                value={mucTieuTongThang}
                onChange={(v) => setMucTieuTongThang(v || 0)}
              />
              {mucTieuTongThang > 0 && (
                <Progress
                  percent={Math.min(
                    (tongGioTatCa() / mucTieuTongThang) * 100,
                    100
                  )}
                />
              )}
            </Card>

            <Row gutter={[16, 16]}>
              {danhSachMon.map((mon) => {
                const tong = tongGioMon(mon.id);
                const percent =
                  mon.mucTieuThang > 0
                    ? Math.min((tong / mon.mucTieuThang) * 100, 100)
                    : 0;

                return (
                  <Col span={8} key={mon.id}>
                    <Card size="small" title={mon.ten}>
                      <InputNumber
                        placeholder="Mục tiêu"
                        value={mon.mucTieuThang}
                        style={{ width: "100%" }}
                        onChange={(v) =>
                          setDanhSachMon(
                            danhSachMon.map((m) =>
                              m.id === mon.id
                                ? { ...m, mucTieuThang: v || 0 }
                                : m
                            )
                          )
                        }
                      />
                      {mon.mucTieuThang > 0 && (
                        <Progress percent={percent} />
                      )}
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </TabPane>
        </Tabs>

        {/* MODAL MÔN */}
        <Modal
          visible={moModalMon}
          onCancel={() => setMoModalMon(false)}
          footer={null}
          width={400}
          title="Môn Học"
        >
          <Form form={formMon} onFinish={luuMon}>
            <Form.Item name="ten" rules={[{ required: true }]}>
              <Input placeholder="Tên môn học" />
            </Form.Item>
            <Button type="primary" htmlType="submit" block>
              Lưu
            </Button>
          </Form>
        </Modal>

        {/* MODAL LỊCH */}
        <Modal
          visible={moModalLich}
          onCancel={() => setMoModalLich(false)}
          footer={null}
          width={500}
          title="Lịch Học"
        >
          <Form form={form} onFinish={luuLich} layout="vertical">
            <Form.Item name="monHocId" label="Môn" rules={[{ required: true }]}>
              <Select>
                {danhSachMon.map((mon) => (
                  <Select.Option key={mon.id} value={mon.id}>
                    {mon.ten}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="thoiGian" label="Thời gian" rules={[{ required: true }]}>
              <DatePicker showTime style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item name="thoiLuong" label="Số giờ" rules={[{ required: true }]}>
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item name="noiDung" label="Nội dung">
              <Input />
            </Form.Item>

            <Form.Item name="ghiChu" label="Ghi chú">
              <Input />
            </Form.Item>

            <Button type="primary" htmlType="submit" block>
              Lưu
            </Button>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
};

export default QuanLyHocTap;