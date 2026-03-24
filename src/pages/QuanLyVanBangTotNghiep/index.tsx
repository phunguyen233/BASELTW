import React, { useState, useEffect } from "react";
import {
  Tabs,
  Card,
  Form,
  Input,
  Button,
  DatePicker,
  Select,
  Table,
  message,
  InputNumber,
  Space,
  Modal,
} from "antd";
import moment from "moment";

const { TabPane } = Tabs;
const { Option } = Select;

// ================= TYPES =================
type SoVanBang = {
  nam: number;
  currentSo: number;
};

type QuyetDinh = {
  id: number;
  soQD: string;
  ngay: string;
  trichYeu: string;
  nam: number;
  luotTraCuu: number;
};

type FieldConfig = {
  name: string;
  type: "string" | "number" | "date";
};

type VanBang = {
  soVaoSo: number;
  soHieu: string;
  msv: string;
  hoTen: string;
  ngaySinh: string;
  quyetDinhId: number;
  extra: Record<string, any>;
};

// ================= LOCAL STORAGE =================
const STORAGE_KEY = "vanbang_app";

// ================= MAIN =================
export default function App() {
  const [soVanBang, setSoVanBang] = useState<SoVanBang[]>([]);
  const [quyetDinh, setQuyetDinh] = useState<QuyetDinh[]>([]);
  const [fields, setFields] = useState<FieldConfig[]>([]);
  const [vanBang, setVanBang] = useState<VanBang[]>([]);

  // ================= LOAD =================
  useEffect(() => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      setSoVanBang(parsed.soVanBang || []);
      setQuyetDinh(parsed.quyetDinh || []);
      setFields(parsed.fields || []);
      setVanBang(parsed.vanBang || []);
    }
  }, []);

  // ================= SAVE =================
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ soVanBang, quyetDinh, fields, vanBang })
    );
  }, [soVanBang, quyetDinh, fields, vanBang]);

  // ================= TAB 1 =================
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [soForm] = Form.useForm();

  const handleAddSo = (values: any) => {
    if (soVanBang.find((s) => s.nam === values.nam)) {
      return message.error("Năm đã tồn tại");
    }

    setSoVanBang([...soVanBang, { nam: values.nam, currentSo: 0 }]);
    message.success("Tạo sổ thành công");
    setIsModalOpen(false);
    soForm.resetFields();
  };

  // ================= TAB 2 =================
  const [qdForm] = Form.useForm();

  const addQD = (values: any) => {
    const newQD: QuyetDinh = {
      id: Date.now(),
      soQD: values.soQD,
      ngay: values.ngay.format("YYYY-MM-DD"),
      trichYeu: values.trichYeu,
      nam: values.nam,
      luotTraCuu: 0,
    };

    setQuyetDinh([...quyetDinh, newQD]);
    qdForm.resetFields();
  };

  // ================= TAB 3 (UPDATE) =================
  const [fieldForm] = Form.useForm();

  const addField = (values: FieldConfig) => {
    if (fields.find((f) => f.name === values.name)) {
      return message.error("Field đã tồn tại");
    }
    setFields([...fields, values]);
    fieldForm.resetFields();
  };

  const deleteField = (name: string) => {
    setFields(fields.filter((f) => f.name !== name));
  };

  // ================= TAB 4 (UPDATE) =================
  const [vbForm] = Form.useForm();

  const addVanBang = (values: any) => {
    const qd = quyetDinh.find((q) => q.id === values.qd);
    if (!qd) return;

    const so = soVanBang.find((s) => s.nam === qd.nam);
    if (!so) return message.error("Chưa có sổ văn bằng");

    so.currentSo += 1;

    const extra: Record<string, any> = {};
    fields.forEach((f) => {
      if (f.type === "date") {
        extra[f.name] = values[f.name]?.format("YYYY-MM-DD");
      } else {
        extra[f.name] = values[f.name];
      }
    });

    const newVB: VanBang = {
      soVaoSo: so.currentSo,
      soHieu: values.soHieu,
      msv: values.msv,
      hoTen: values.hoTen,
      ngaySinh: values.ngaySinh.format("YYYY-MM-DD"),
      quyetDinhId: values.qd,
      extra,
    };

    setVanBang([...vanBang, newVB]);
    setSoVanBang([...soVanBang]);
    vbForm.resetFields();
    message.success("Thêm văn bằng thành công");
  };

  // ================= TAB 5 (UPDATE) =================
  const [search, setSearch] = useState<any>({});
  const [result, setResult] = useState<VanBang[]>([]);

  const handleSearch = () => {
    const keys = Object.values(search).filter((v) => v);
    if (keys.length < 2) {
      return message.error("Nhập ít nhất 2 điều kiện");
    }

    const data = vanBang.filter((vb) => {
      return (
        (!search.soHieu || vb.soHieu.includes(search.soHieu)) &&
        (!search.soVaoSo || vb.soVaoSo === search.soVaoSo) &&
        (!search.msv || vb.msv.includes(search.msv)) &&
        (!search.hoTen || vb.hoTen.includes(search.hoTen)) &&
        (!search.ngaySinh || vb.ngaySinh === search.ngaySinh)
      );
    });

    data.forEach((vb) => {
      const qd = quyetDinh.find((q) => q.id === vb.quyetDinhId);
      if (qd) qd.luotTraCuu++;
    });

    setQuyetDinh([...quyetDinh]);
    setResult(data);
  };

  // ================= UI =================
  return (
    <Tabs>
      {/* TAB 1 */}
      <TabPane tab="Sổ văn bằng" key="1">
        <Card>
          <Button type="primary" onClick={() => setIsModalOpen(true)}>
            Tạo sổ văn bằng
          </Button>

          <Modal
            title="Tạo sổ"
            visible={isModalOpen}
            onCancel={() => setIsModalOpen(false)}
            footer={null}
          >
            <Form form={soForm} onFinish={handleAddSo}>
              <Form.Item name="nam" label="Năm" rules={[{ required: true }]}>
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
              <Button htmlType="submit" type="primary" block>
                Lưu
              </Button>
            </Form>
          </Modal>

          <Table
            rowKey="nam"
            dataSource={soVanBang}
            columns={[
              { title: "Năm", dataIndex: "nam" },
              { title: "Số hiện tại", dataIndex: "currentSo" },
            ]}
          />
        </Card>
      </TabPane>

      {/* TAB 2 */}
      <TabPane tab="Quyết định" key="2">
        <Card>
          <Form form={qdForm} onFinish={addQD} layout="inline">
            <Form.Item name="soQD" rules={[{ required: true }]}>
              <Input placeholder="Số QĐ" />
            </Form.Item>

            <Form.Item name="ngay" rules={[{ required: true }]}>
              <DatePicker />
            </Form.Item>

            <Form.Item name="trichYeu">
              <Input placeholder="Trích yếu" />
            </Form.Item>

            <Form.Item name="nam" rules={[{ required: true }]}>
              <Select placeholder="Chọn năm">
                {soVanBang.map((s) => (
                  <Option key={s.nam} value={s.nam}>
                    {s.nam}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Button htmlType="submit" type="primary">
              Thêm
            </Button>
          </Form>

          <Table rowKey="id" dataSource={quyetDinh} columns={[
            { title: "Số QĐ", dataIndex: "soQD" },
            { title: "Ngày", dataIndex: "ngay" },
            { title: "Trích yếu", dataIndex: "trichYeu" },
            { title: "Năm", dataIndex: "nam" },
            { title: "Lượt tra cứu", dataIndex: "luotTraCuu" },
          ]} />
        </Card>
      </TabPane>

      {/* TAB 3 */}
      <TabPane tab="Cấu hình" key="3">
        <Card>
          <Form form={fieldForm} onFinish={addField} layout="inline">
            <Form.Item name="name" rules={[{ required: true }]}>
              <Input placeholder="Tên field" />
            </Form.Item>

            <Form.Item name="type" rules={[{ required: true }]}>
              <Select style={{ width: 120 }}>
                <Option value="string">String</Option>
                <Option value="number">Number</Option>
                <Option value="date">Date</Option>
              </Select>
            </Form.Item>

            <Button htmlType="submit" type="primary">
              Thêm
            </Button>
          </Form>

          <Table
            rowKey="name"
            dataSource={fields}
            columns={[
              { title: "Tên field", dataIndex: "name" },
              { title: "Kiểu", dataIndex: "type" },
              {
                title: "Xóa",
                render: (_, r) => (
                  <Button danger onClick={() => deleteField(r.name)}>
                    Xóa
                  </Button>
                ),
              },
            ]}
          />
        </Card>
      </TabPane>

      {/* TAB 4 */}
      <TabPane tab="Văn bằng" key="4">
        <Card>
          <Form form={vbForm} onFinish={addVanBang}>
            <Form.Item name="soHieu" label="Số hiệu" rules={[{ required: true }]}>
              <Input />
            </Form.Item>

            <Form.Item name="msv" label="MSV" rules={[{ required: true }]}>
              <Input />
            </Form.Item>

            <Form.Item name="hoTen" label="Họ tên" rules={[{ required: true }]}>
              <Input />
            </Form.Item>

            <Form.Item name="ngaySinh" label="Ngày sinh" rules={[{ required: true }]}>
              <DatePicker />
            </Form.Item>

            <Form.Item name="qd" label="Quyết định" rules={[{ required: true }]}>
              <Select>
                {quyetDinh.map((q) => (
                  <Option key={q.id} value={q.id}>
                    {q.soQD}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {fields.map((f) => (
              <Form.Item key={f.name} name={f.name} label={f.name}>
                {f.type === "string" && <Input />}
                {f.type === "number" && <InputNumber style={{ width: "100%" }} />}
                {f.type === "date" && <DatePicker />}
              </Form.Item>
            ))}

            <Button htmlType="submit" type="primary">
              Thêm văn bằng
            </Button>
          </Form>

          <Table
            rowKey="soVaoSo"
            dataSource={vanBang}
            columns={[
              { title: "Số", dataIndex: "soVaoSo" },
              { title: "Số hiệu", dataIndex: "soHieu" },
              { title: "Họ tên", dataIndex: "hoTen" },
              {
                title: "Quyết định",
                render: (_, vb) =>
                  quyetDinh.find((q) => q.id === vb.quyetDinhId)?.soQD,
              },
              {
                title: "Extra",
                render: (_, vb) => JSON.stringify(vb.extra),
              },
            ]}
          />
        </Card>
      </TabPane>

      {/* TAB 5 */}
      <TabPane tab="Tra cứu" key="5">
        <Card>
          <Space direction="vertical">
            <Input placeholder="Số hiệu" onChange={(e) => setSearch({ ...search, soHieu: e.target.value })} />
            <InputNumber placeholder="Số vào sổ" onChange={(v) => setSearch({ ...search, soVaoSo: v })} />
            <Input placeholder="MSV" onChange={(e) => setSearch({ ...search, msv: e.target.value })} />
            <Input placeholder="Họ tên" onChange={(e) => setSearch({ ...search, hoTen: e.target.value })} />
            <DatePicker onChange={(d) => setSearch({ ...search, ngaySinh: d?.format("YYYY-MM-DD") })} />

            <Button onClick={handleSearch} type="primary">
              Tra cứu
            </Button>
          </Space>

          <Table rowKey="soVaoSo" dataSource={result} columns={[
            { title: "Số", dataIndex: "soVaoSo" },
            { title: "Số hiệu", dataIndex: "soHieu" },
            { title: "Họ tên", dataIndex: "hoTen" },
            {
              title: "Quyết định",
              render: (_, vb) =>
                quyetDinh.find((q) => q.id === vb.quyetDinhId)?.soQD,
            },
          ]} />
        </Card>
      </TabPane>
    </Tabs>
  );
}