import React, { useEffect, useState } from "react";
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
} from "antd";
import moment from "moment";

const { TabPane } = Tabs;
const { Option } = Select;

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

  // ================= LOCAL STORAGE =================
  useEffect(() => {
    setNV(JSON.parse(localStorage.getItem("nv") || "[]"));
    setDV(JSON.parse(localStorage.getItem("dv") || "[]"));
    setLH(JSON.parse(localStorage.getItem("lh") || "[]"));
    setDG(JSON.parse(localStorage.getItem("dg") || "[]"));
  }, []);

  useEffect(() => localStorage.setItem("nv", JSON.stringify(nhanvien)), [nhanvien]);
  useEffect(() => localStorage.setItem("dv", JSON.stringify(dichvu)), [dichvu]);
  useEffect(() => localStorage.setItem("lh", JSON.stringify(lichhen)), [lichhen]);
  useEffect(() => localStorage.setItem("dg", JSON.stringify(danhgia)), [danhgia]);

  // ================= TAB 1: NHÂN VIÊN =================
  const [tenNV, setTenNV] = useState("");
  const [maxKH, setMaxKH] = useState(5);
  const [lich, setLich] = useState<LichLam[]>([]);

  const addNV = () => {
    if (!tenNV) return message.error("Nhập tên");
    setNV([...nhanvien, { id: Date.now(), ten: tenNV, so_khach_toi_da: maxKH, lich }]);
    setTenNV(""); setMaxKH(5); setLich([]);
  };

  const deleteNV = (id: number) => {
    setNV(nhanvien.filter(n => n.id !== id));
  };

  const addLich = () => {
    const thu = Number(prompt("Thứ (0=CN)"));
    const start = prompt("Start (09:00)") || "";
    const end = prompt("End (17:00)") || "";
    setLich([...lich, { thu, start, end }]);
  };

  // ================= TAB 1: DỊCH VỤ =================
  const [tenDV, setTenDV] = useState("");
  const [giaDV, setGiaDV] = useState(0);
  const [timeDV, setTimeDV] = useState(30);

  const addDV = () => {
    setDV([...dichvu, { id: Date.now(), ten: tenDV, gia: giaDV, thoi_gian: timeDV }]);
    setTenDV(""); setGiaDV(0); setTimeDV(30);
  };

  const deleteDV = (id: number) => {
    setDV(dichvu.filter(d => d.id !== id));
  };

  // ================= TAB 2: LỊCH HẸN =================
  const [form, setForm] = useState<any>({});

  const datLich = () => {
    if (!form.nhanvien_id || !form.dichvu_id || !form.ngay || !form.gio)
      return message.error("Thiếu thông tin");

    // trùng lịch
    const trung = lichhen.find(
      l =>
        l.nhanvien_id === form.nhanvien_id &&
        l.ngay === form.ngay &&
        l.gio === form.gio &&
        l.trang_thai !== "huy"
    );
    if (trung) return message.error("Trùng lịch");

    // full khách
    const nv = nhanvien.find(n => n.id === form.nhanvien_id);
    const count = lichhen.filter(
      l => l.nhanvien_id === form.nhanvien_id && l.ngay === form.ngay && l.trang_thai !== "huy"
    ).length;

    if (nv && count >= nv.so_khach_toi_da)
      return message.error("Nhân viên đã full");

    // check giờ làm
    const thu = new Date(form.ngay).getDay();
    const ok = nv?.lich.some(
      l => l.thu === thu && form.gio >= l.start && form.gio <= l.end
    );
    if (!ok) return message.error("Ngoài giờ làm");

    setLH([...lichhen, { id: Date.now(), ...form, trang_thai: "cho_duyet" }]);
    message.success("Đặt lịch thành công");
  };

  const updateTrangThai = (id: number, tt: string) => {
    setLH(lichhen.map(l => (l.id === id ? { ...l, trang_thai: tt } : l)));
  };

  // ================= TAB 3: ĐÁNH GIÁ =================
  const addDG = (id: number) => {
    const diem = Number(prompt("Điểm 1-5"));
    const noi_dung = prompt("Nội dung") || "";

    setDG([...danhgia, { lichhen_id: id, diem, noi_dung }]);
  };

  const phanHoi = (id: number) => {
    const text = prompt("Phản hồi") || "";

    setDG(
      danhgia.map(d =>
        d.lichhen_id === id ? { ...d, phan_hoi: text } : d
      )
    );
  };

  const avg = (nv_id: number) => {
    const list = danhgia.filter(d => {
      const lh = lichhen.find(l => l.id === d.lichhen_id);
      return lh?.nhanvien_id === nv_id;
    });
    if (!list.length) return 0;
    return (list.reduce((a, b) => a + b.diem, 0) / list.length).toFixed(1);
  };

  // ================= TAB 4: THỐNG KÊ =================
  const thongKeNgay = () => {
    const map: any = {};
    lichhen.forEach(l => {
      map[l.ngay] = (map[l.ngay] || 0) + 1;
    });
    return map;
  };

  const doanhThu = () => {
    let sum = 0;
    lichhen.forEach(l => {
      const dv = dichvu.find(d => d.id === l.dichvu_id);
      sum += dv?.gia || 0;
    });
    return sum;
  };

  // ================= UI =================
  return (
    <div style={{ padding: 20 }}>
      <Tabs>

        {/* TAB 1 */}
        <TabPane tab="Nhân viên & Dịch vụ" key="1">
          <Card title="Nhân viên">
            <Input placeholder="Tên" value={tenNV} onChange={e => setTenNV(e.target.value)} />
            <InputNumber value={maxKH} onChange={v => setMaxKH(Number(v))} />
            <Button onClick={addLich}>+ Lịch</Button>
            <Button type="primary" onClick={addNV}>Thêm</Button>

            <List dataSource={nhanvien} renderItem={nv => (
              <List.Item
                actions={[
                  <Button danger onClick={() => deleteNV(nv.id)}>Xóa</Button>
                ]}
              >
                {nv.ten} (Max: {nv.so_khach_toi_da}) ⭐ {avg(nv.id)}
              </List.Item>
            )}/>
          </Card>

          <Card title="Dịch vụ" style={{ marginTop: 20 }}>
            <Input placeholder="Tên" value={tenDV} onChange={e => setTenDV(e.target.value)} />
            <InputNumber placeholder="Giá" value={giaDV} onChange={v => setGiaDV(Number(v))} />
            <InputNumber placeholder="Thời gian" value={timeDV} onChange={v => setTimeDV(Number(v))} />
            <Button type="primary" onClick={addDV}>Thêm</Button>

            <List dataSource={dichvu} renderItem={dv => (
              <List.Item
                actions={[
                  <Button danger onClick={() => deleteDV(dv.id)}>Xóa</Button>
                ]}
              >
                {dv.ten} - {dv.gia} VNĐ
              </List.Item>
            )}/>
          </Card>
        </TabPane>

        {/* TAB 2 */}
        <TabPane tab="Lịch hẹn" key="2">
          <Card>
            <Select placeholder="Nhân viên" onChange={v => setForm({ ...form, nhanvien_id: v })}>
              {nhanvien.map(n => <Option value={n.id}>{n.ten}</Option>)}
            </Select>

            <Select placeholder="Dịch vụ" onChange={v => setForm({ ...form, dichvu_id: v })}>
              {dichvu.map(d => <Option value={d.id}>{d.ten}</Option>)}
            </Select>

            <DatePicker onChange={d => setForm({ ...form, ngay: d?.format("YYYY-MM-DD") })}/>
            <TimePicker onChange={t => setForm({ ...form, gio: t?.format("HH:mm") })}/>

            <Button type="primary" onClick={datLich}>Đặt lịch</Button>

            <List dataSource={lichhen} renderItem={l => (
              <List.Item>
                {l.ngay} {l.gio} - {l.trang_thai}
                <Button onClick={() => updateTrangThai(l.id, "xac_nhan")}>✔</Button>
                <Button onClick={() => updateTrangThai(l.id, "hoan_thanh")}>Done</Button>
                <Button onClick={() => updateTrangThai(l.id, "huy")}>❌</Button>
              </List.Item>
            )}/>
          </Card>
        </TabPane>

        {/* TAB 3 */}
        <TabPane tab="Đánh giá" key="3">
          <List
            dataSource={lichhen.filter(l => l.trang_thai === "hoan_thanh")}
            renderItem={l => (
              <List.Item>
                {l.ngay}
                <Button onClick={() => addDG(l.id)}>Đánh giá</Button>
                <Button onClick={() => phanHoi(l.id)}>Phản hồi</Button>
              </List.Item>
            )}
          />
        </TabPane>

        {/* TAB 4 */}
        <TabPane tab="Thống kê" key="4">
          <Card>
            <p>Tổng lịch: {lichhen.length}</p>
            <p>Doanh thu: {doanhThu()} VNĐ</p>

            <h4>Lịch theo ngày:</h4>
            {Object.entries(thongKeNgay()).map(([day, count]) => (
              <p key={day}>{day}: {count as number} lịch</p>
            ))}
          </Card>
        </TabPane>

      </Tabs>
    </div>
  );
}