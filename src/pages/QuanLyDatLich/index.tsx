import { useEffect, useState } from 'react';
import {
  Tabs,
  Card,
  Input,
  Button,
  InputNumber,
  List,
  Select,
  DatePicker,
  TimePicker,
  message,
  Modal,
  Form,
  Table,
  Row,
  Col,
  Typography,
  Divider,
  Rate,
  Tag,
} from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, StarOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;
const { Option } = Select;
const { Title, Text } = Typography;

// ================= TYPES =================
type LichLam = { thu: number; start: string; end: string };

type NhanVien = {
  id: number;
  ten: string;
  so_khach_toi_da: number;
  lich: LichLam[];
};

type DichVu = {
  id: number;
  ten: string;
  gia: number;
  thoi_gian: number;
};

type LichHen = {
  id: number;
  nhanvien_id: number;
  dichvu_id: number;
  ngay: string;
  gio: string;
  trang_thai: string;
};

type DanhGia = {
  lichhen_id: number;
  diem: number;
  noi_dung: string;
  phan_hoi?: string;
};

export default function App() {
  const [nhanvien, setNV] = useState<NhanVien[]>([]);
  const [dichvu, setDV] = useState<DichVu[]>([]);
  const [lichhen, setLH] = useState<LichHen[]>([]);
  const [danhgia, setDG] = useState<DanhGia[]>([]);

  useEffect(() => {
    setNV(JSON.parse(localStorage.getItem('nv') || '[]'));
    setDV(JSON.parse(localStorage.getItem('dv') || '[]'));
    setLH(JSON.parse(localStorage.getItem('lh') || '[]'));
    setDG(JSON.parse(localStorage.getItem('dg') || '[]'));
  }, []);

  useEffect(() => localStorage.setItem('nv', JSON.stringify(nhanvien)), [nhanvien]);
  useEffect(() => localStorage.setItem('dv', JSON.stringify(dichvu)), [dichvu]);
  useEffect(() => localStorage.setItem('lh', JSON.stringify(lichhen)), [lichhen]);
  useEffect(() => localStorage.setItem('dg', JSON.stringify(danhgia)), [danhgia]);

  // ================= TAB 1 =================
  const [tab1, setTab1] = useState<'nv' | 'dv'>('nv');

  const [tenNV, setTenNV] = useState('');
  const [maxKH, setMaxKH] = useState(5);
  const [lich, setLich] = useState<LichLam[]>([]);

  const [tenDV, setTenDV] = useState('');
  const [giaDV, setGiaDV] = useState(0);
  const [timeDV, setTimeDV] = useState(30);

  const [openNV, setOpenNV] = useState(false);
  const [openDV, setOpenDV] = useState(false);
  const [editingNV, setEditingNV] = useState<NhanVien | null>(null);
  const [editingDV, setEditingDV] = useState<DichVu | null>(null);

  const addNV = () => {
    if (!tenNV) {
      message.error('Nhập tên');
      return;
    }
    setNV([...nhanvien, { id: Date.now(), ten: tenNV, so_khach_toi_da: maxKH, lich }]);
    setTenNV(''); setMaxKH(5); setLich([]);
    setOpenNV(false);
  };

  const editNV = (nv: NhanVien) => {
    setEditingNV(nv);
    setTenNV(nv.ten);
    setMaxKH(nv.so_khach_toi_da);
    setLich(nv.lich);
    setOpenNV(true);
  };

  const saveEditNV = () => {
    if (!tenNV) {
      message.error('Nhập tên');
      return;
    }
    if (editingNV) {
      setNV(nhanvien.map(n => n.id === editingNV.id ? { ...n, ten: tenNV, so_khach_toi_da: maxKH, lich } : n));
      setEditingNV(null);
    } else {
      addNV();
    }
    setTenNV(''); setMaxKH(5); setLich([]);
    setOpenNV(false);
  };

  const deleteNV = (id: number) => {
    setNV(nhanvien.filter(n => n.id !== id));
  };

  const addLich = () => {
    const thu = Number(prompt('Thứ (0=CN, 1=Thứ 2, ..., 6=Thứ 7)'));
    const start = prompt('Giờ bắt đầu (HH:mm)') || '';
    const end = prompt('Giờ kết thúc (HH:mm)') || '';
    setLich([...lich, { thu, start, end }]);
  };

  const addDV = () => {
    if (!tenDV) {
      message.error('Nhập tên dịch vụ');
      return;
    }
    setDV([...dichvu, { id: Date.now(), ten: tenDV, gia: giaDV, thoi_gian: timeDV }]);
    setTenDV(''); setGiaDV(0); setTimeDV(30);
    setOpenDV(false);
  };

  const editDV = (dv: DichVu) => {
    setEditingDV(dv);
    setTenDV(dv.ten);
    setGiaDV(dv.gia);
    setTimeDV(dv.thoi_gian);
    setOpenDV(true);
  };

  const saveEditDV = () => {
    if (!tenDV) {
      message.error('Nhập tên dịch vụ');
      return;
    }
    if (editingDV) {
      setDV(dichvu.map(d => d.id === editingDV.id ? { ...d, ten: tenDV, gia: giaDV, thoi_gian: timeDV } : d));
      setEditingDV(null);
    } else {
      addDV();
    }
    setTenDV(''); setGiaDV(0); setTimeDV(30);
    setOpenDV(false);
  };

  const deleteDV = (id: number) => {
    setDV(dichvu.filter(d => d.id !== id));
  };

  // ================= TAB 2 =================
  const [form, setForm] = useState<any>({});

  const datLich = () => {
    if (!form.nhanvien_id || !form.dichvu_id || !form.ngay || !form.gio) {
      message.error('Thiếu thông tin');
      return;
    }

    const trung = lichhen.find(
      l =>
        l.nhanvien_id === form.nhanvien_id &&
        l.ngay === form.ngay &&
        l.gio === form.gio &&
        l.trang_thai !== 'huy'
    );
    if (trung) {
      message.error('Trùng lịch');
      return;
    }

    const nv = nhanvien.find(n => n.id === form.nhanvien_id);
    const count = lichhen.filter(
      l => l.nhanvien_id === form.nhanvien_id && l.ngay === form.ngay && l.trang_thai !== 'huy'
    ).length;

    if (nv && count >= nv.so_khach_toi_da) {
      message.error('Đã đạt số khách tối đa');
      return;
    }

    const thu = new Date(form.ngay).getDay();
    const ok = nv?.lich.some(
      l => l.thu === thu && form.gio >= l.start && form.gio <= l.end
    );
    if (!ok) {
      message.error('Ngoài giờ làm việc');
      return;
    }

    setLH([...lichhen, { id: Date.now(), ...form, trang_thai: 'cho_duyet' }]);
    message.success('Đặt lịch thành công');
    setForm({});
  };

  const updateTrangThai = (id: number, tt: string) => {
    setLH(lichhen.map(l => (l.id === id ? { ...l, trang_thai: tt } : l)));
  };

  // ================= TAB 3 =================
  const addDG = (id: number) => {
    const diem = Number(prompt('Điểm 1-5'));
    const noi_dung = prompt('Nội dung đánh giá') || '';
    if (diem < 1 || diem > 5) {
      message.error('Điểm từ 1-5');
      return;
    }
    setDG([...danhgia, { lichhen_id: id, diem, noi_dung }]);
  };

  const phanHoi = (id: number) => {
    const text = prompt('Phản hồi') || '';
    setDG(danhgia.map(d => d.lichhen_id === id ? { ...d, phan_hoi: text } : d));
  };

  const avg = (nv_id: number) => {
    const list = danhgia.filter(d => {
      const lh = lichhen.find(l => l.id === d.lichhen_id);
      return lh?.nhanvien_id === nv_id;
    });
    if (!list.length) return 0;
    return (list.reduce((a, b) => a + b.diem, 0) / list.length).toFixed(1);
  };

  // ================= TAB 4 =================
  const thongKeNgay = () => {
    const map: any = {};
    lichhen.forEach(l => {
      map[l.ngay] = (map[l.ngay] || 0) + 1;
    });
    return map;
  };

  const thongKeThang = () => {
    const map: any = {};
    lichhen.forEach(l => {
      const month = l.ngay.substring(0, 7); // YYYY-MM
      map[month] = (map[month] || 0) + 1;
    });
    return map;
  };

  const doanhThuTong = () => {
    let sum = 0;
    lichhen.forEach(l => {
      if (l.trang_thai === 'hoan_thanh') {
        const dv = dichvu.find(d => d.id === l.dichvu_id);
        sum += dv?.gia || 0;
      }
    });
    return sum;
  };

  const doanhThuTheoNV = () => {
    const map: any = {};
    lichhen.forEach(l => {
      if (l.trang_thai === 'hoan_thanh') {
        const dv = dichvu.find(d => d.id === l.dichvu_id);
        map[l.nhanvien_id] = (map[l.nhanvien_id] || 0) + (dv?.gia || 0);
      }
    });
    return map;
  };

  const doanhThuTheoDV = () => {
    const map: any = {};
    lichhen.forEach(l => {
      if (l.trang_thai === 'hoan_thanh') {
        const dv = dichvu.find(d => d.id === l.dichvu_id);
        map[l.dichvu_id] = (map[l.dichvu_id] || 0) + (dv?.gia || 0);
      }
    });
    return map;
  };

  // ================= UI =================
  const columnsNV = [
    { title: 'Tên', dataIndex: 'ten', key: 'ten' },
    { title: 'Khách tối đa/ngày', dataIndex: 'so_khach_toi_da', key: 'so_khach_toi_da' },
    { title: 'Đánh giá', key: 'avg', render: (nv: NhanVien) => <span><StarOutlined /> {avg(nv.id)}</span> },
    {
      title: 'Hành động',
      key: 'action',
      render: (nv: NhanVien) => (
        <>
          <Button icon={<EditOutlined />} onClick={() => editNV(nv)} style={{ marginRight: 8 }} />
          <Button icon={<DeleteOutlined />} danger onClick={() => deleteNV(nv.id)} />
        </>
      ),
    },
  ];

  const columnsDV = [
    { title: 'Tên', dataIndex: 'ten', key: 'ten' },
    { title: 'Giá (VNĐ)', dataIndex: 'gia', key: 'gia', render: (gia: number) => gia.toLocaleString() },
    { title: 'Thời gian (phút)', dataIndex: 'thoi_gian', key: 'thoi_gian' },
    {
      title: 'Hành động',
      key: 'action',
      render: (dv: DichVu) => (
        <>
          <Button icon={<EditOutlined />} onClick={() => editDV(dv)} style={{ marginRight: 8 }} />
          <Button icon={<DeleteOutlined />} danger onClick={() => deleteDV(dv.id)} />
        </>
      ),
    },
  ];

  const columnsLH = [
    {
      title: 'Nhân viên',
      key: 'nhanvien',
      render: (l: LichHen) => nhanvien.find(n => n.id === l.nhanvien_id)?.ten,
    },
    {
      title: 'Dịch vụ',
      key: 'dichvu',
      render: (l: LichHen) => dichvu.find(d => d.id === l.dichvu_id)?.ten,
    },
    { title: 'Ngày', dataIndex: 'ngay', key: 'ngay' },
    { title: 'Giờ', dataIndex: 'gio', key: 'gio' },
    {
      title: 'Trạng thái',
      dataIndex: 'trang_thai',
      key: 'trang_thai',
      render: (tt: string) => {
        const colors = { cho_duyet: 'orange', xac_nhan: 'blue', hoan_thanh: 'green', huy: 'red' };
        return <Tag color={colors[tt as keyof typeof colors]}>{tt}</Tag>;
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (l: LichHen) => (
        <>
          {l.trang_thai === 'cho_duyet' && <Button onClick={() => updateTrangThai(l.id, 'xac_nhan')}>Xác nhận</Button>}
          {l.trang_thai === 'xac_nhan' && <Button onClick={() => updateTrangThai(l.id, 'hoan_thanh')}>Hoàn thành</Button>}
          <Button danger onClick={() => updateTrangThai(l.id, 'huy')}>Hủy</Button>
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: 20, background: '#f0f2f5', minHeight: '100vh' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 20 }}>Quản Lý Đặt Lịch Hẹn</Title>
      <Tabs defaultActiveKey="1" type="card">
        {/* TAB 1 */}
        <TabPane tab="Nhân viên & Dịch vụ" key="1">
          <Card>
            <Row gutter={16}>
              <Col>
                <Button type={tab1 === 'nv' ? 'primary' : 'default'} onClick={() => setTab1('nv')}>
                  Nhân viên
                </Button>
              </Col>
              <Col>
                <Button type={tab1 === 'dv' ? 'primary' : 'default'} onClick={() => setTab1('dv')}>
                  Dịch vụ
                </Button>
              </Col>
            </Row>
            <Divider />

            {/* NHÂN VIÊN */}
            {tab1 === 'nv' && (
              <>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingNV(null); setOpenNV(true); }}>
                  Thêm nhân viên
                </Button>
                <Table dataSource={nhanvien} columns={columnsNV} rowKey="id" style={{ marginTop: 20 }} />

                <Modal
                  title={editingNV ? 'Sửa nhân viên' : 'Thêm nhân viên'}
                  visible={openNV}
                  onCancel={() => { setOpenNV(false); setEditingNV(null); setTenNV(''); setMaxKH(5); setLich([]); }}
                  onOk={saveEditNV}
                >
                  <Form layout="vertical">
                    <Form.Item label="Tên">
                      <Input value={tenNV} onChange={e => setTenNV(e.target.value)} />
                    </Form.Item>
                    <Form.Item label="Số khách tối đa/ngày">
                      <InputNumber value={maxKH} onChange={v => setMaxKH(Number(v))} min={1} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item label="Lịch làm việc">
                      <Button onClick={addLich}>+ Thêm lịch</Button>
                      <List dataSource={lich} renderItem={(item, index) => (
                        <List.Item>{`Thứ ${item.thu}: ${item.start} - ${item.end}`}</List.Item>
                      )} />
                    </Form.Item>
                  </Form>
                </Modal>
              </>
            )}

            {/* DỊCH VỤ */}
            {tab1 === 'dv' && (
              <>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingDV(null); setOpenDV(true); }}>
                  Thêm dịch vụ
                </Button>
                <Table dataSource={dichvu} columns={columnsDV} rowKey="id" style={{ marginTop: 20 }} />

                <Modal
                  title={editingDV ? 'Sửa dịch vụ' : 'Thêm dịch vụ'}
                  visible={openDV}
                  onCancel={() => { setOpenDV(false); setEditingDV(null); setTenDV(''); setGiaDV(0); setTimeDV(30); }}
                  onOk={saveEditDV}
                >
                  <Form layout="vertical">
                    <Form.Item label="Tên dịch vụ">
                      <Input value={tenDV} onChange={e => setTenDV(e.target.value)} />
                    </Form.Item>
                    <Form.Item label="Giá (VNĐ)">
                      <InputNumber value={giaDV} onChange={v => setGiaDV(Number(v))} min={0} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item label="Thời gian (phút)">
                      <InputNumber value={timeDV} onChange={v => setTimeDV(Number(v))} min={1} style={{ width: '100%' }} />
                    </Form.Item>
                  </Form>
                </Modal>
              </>
            )}
          </Card>
        </TabPane>

        {/* TAB 2 */}
        <TabPane tab="Lịch hẹn" key="2">
          <Card title="Đặt lịch hẹn">
            <Row gutter={16}>
              <Col span={6}>
                <Select placeholder="Chọn nhân viên" onChange={v => setForm({ ...form, nhanvien_id: v })} style={{ width: '100%' }}>
                  {nhanvien.map(n => <Option key={n.id} value={n.id}>{n.ten}</Option>)}
                </Select>
              </Col>
              <Col span={6}>
                <Select placeholder="Chọn dịch vụ" onChange={v => setForm({ ...form, dichvu_id: v })} style={{ width: '100%' }}>
                  {dichvu.map(d => <Option key={d.id} value={d.id}>{d.ten}</Option>)}
                </Select>
              </Col>
              <Col span={6}>
                <DatePicker onChange={d => setForm({ ...form, ngay: d?.format('YYYY-MM-DD') })} style={{ width: '100%' }} />
              </Col>
              <Col span={6}>
                <TimePicker onChange={t => setForm({ ...form, gio: t?.format('HH:mm') })} style={{ width: '100%' }} />
              </Col>
            </Row>
            <Button type="primary" onClick={datLich} style={{ marginTop: 16 }}>Đặt lịch</Button>
          </Card>
          <Card title="Danh sách lịch hẹn" style={{ marginTop: 20 }}>
            <Table dataSource={lichhen} columns={columnsLH} rowKey="id" />
          </Card>
        </TabPane>

        {/* TAB 3 */}
        <TabPane tab="Đánh giá" key="3">
          <Card title="Đánh giá dịch vụ">
            <Table
              dataSource={lichhen.filter(l => l.trang_thai === 'hoan_thanh').map(l => {
                const dg = danhgia.find(d => d.lichhen_id === l.id);
                return dg ? { ...dg, lh: l } : null;
              }).filter((item): item is any => item !== null)}
              columns={[
                {
                  title: 'Lịch hẹn',
                  key: 'lichhen',
                  render: (record: any) => `${record.lh.ngay} ${record.lh.gio} - ${nhanvien.find(n => n.id === record.lh.nhanvien_id)?.ten}`,
                },
                { title: 'Điểm', dataIndex: 'diem', key: 'diem', render: (diem: number) => <Rate disabled defaultValue={diem} /> },
                { title: 'Nội dung', dataIndex: 'noi_dung', key: 'noi_dung' },
                { title: 'Phản hồi', dataIndex: 'phan_hoi', key: 'phan_hoi' },
                {
                  title: 'Hành động',
                  key: 'action',
                  render: (record: any) => (
                    <Button onClick={() => addDG(record.lichhen_id)}>Đánh giá</Button>
                  ),
                },
              ]}
              rowKey='lichhen_id'
            />
          </Card>
        </TabPane>

        {/* TAB 4 */}
        <TabPane tab="Thống kê" key="4">
          <Row gutter={16}>
            <Col span={12}>
              <Card title="Tổng quan">
                <p><Text strong>Tổng lịch hẹn:</Text> {lichhen.length}</p>
                <p><Text strong>Doanh thu tổng:</Text> {doanhThuTong().toLocaleString()} VNĐ</p>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Lịch hẹn theo ngày">
                {Object.entries(thongKeNgay()).map(([day, count]) => (
                  <p key={day}><Text strong>{day}:</Text> {count as number} lịch</p>
                ))}
              </Card>
            </Col>
          </Row>
          <Row gutter={16} style={{ marginTop: 20 }}>
            <Col span={12}>
              <Card title="Lịch hẹn theo tháng">
                {Object.entries(thongKeThang()).map(([month, count]) => (
                  <p key={month}><Text strong>{month}:</Text> {count as number} lịch</p>
                ))}
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Doanh thu theo nhân viên">
                {Object.entries(doanhThuTheoNV()).map(([nv_id, sum]) => (
                  <p key={nv_id}><Text strong>{nhanvien.find(n => n.id === Number(nv_id))?.ten}:</Text> {(sum as number).toLocaleString()} VNĐ</p>
                ))}
              </Card>
            </Col>
          </Row>
          <Card title="Doanh thu theo dịch vụ" style={{ marginTop: 20 }}>
            {Object.entries(doanhThuTheoDV()).map(([dv_id, sum]) => (
              <p key={dv_id}><Text strong>{dichvu.find(d => d.id === Number(dv_id))?.ten}:</Text> {(sum as number).toLocaleString()} VNĐ</p>
            ))}
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
}