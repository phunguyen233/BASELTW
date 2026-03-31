import React, { useEffect, useState } from "react";
import {
  Tabs,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Space,
  Tag,
} from "antd";

const { TabPane } = Tabs;
const { Option } = Select;

// ================= TYPES =================
enum Status {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

type Club = {
  id: number;
  name: string;
  avatar?: string;
  date?: string;
  desc?: string;
  president: string;
  active: boolean;
};

type Application = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  clubId: number;
  reason: string;
  status: Status;
  note?: string;
};

type Member = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  clubId: number;
};

// ================= LOCAL STORAGE =================
const getData = (key: string) => {
  return JSON.parse(localStorage.getItem(key) || "[]");
};

const setData = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// ================= MAIN =================
export default function App() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [apps, setApps] = useState<Application[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [visible, setVisible] = useState(false);

  const [form] = Form.useForm();

  useEffect(() => {
    setClubs(getData("clubs"));
    setApps(getData("apps"));
    setMembers(getData("members"));
  }, []);

  // ================= CLUB =================
  const deleteClub = (id: number) => {
    const newData = clubs.filter((c) => c.id !== id);
    setClubs(newData);
    setData("clubs", newData);
  };

  // ================= APPLICATION =================
  const addApp = (values: any) => {
    const newApp: Application = {
      ...values,
      id: Date.now(),
      status: Status.PENDING,
    };
    const newData = [...apps, newApp];
    setApps(newData);
    setData("apps", newData);
  };

  const approve = (ids: number[]) => {
    const newApps: Application[] = apps.map((a) =>
      ids.includes(a.id)
        ? { ...a, status: Status.APPROVED }
        : a
    );

    const newMembers = [
      ...members,
      ...apps
        .filter((a) => ids.includes(a.id))
        .map((a) => ({
          id: Date.now() + Math.random(),
          fullName: a.fullName,
          email: a.email,
          phone: a.phone,
          clubId: a.clubId,
        })),
    ];

    setApps(newApps);
    setMembers(newMembers);

    setData("apps", newApps);
    setData("members", newMembers);

    message.success("Đã duyệt!");
  };

  const reject = () => {
    let reason = "";

    Modal.confirm({
      title: "Nhập lý do từ chối",
      content: (
        <Input onChange={(e) => (reason = e.target.value)} />
      ),
      onOk: () => {
        const newApps: Application[] = apps.map((a) =>
          selectedRows.some((s) => s.id === a.id)
            ? {
                ...a,
                status: Status.REJECTED,
                note: reason,
              }
            : a
        );

        setApps(newApps);
        setData("apps", newApps);
      },
    });
  };

  // ================= TRANSFER =================
  const transferMembers = () => {
    let newClub = 0;

    Modal.confirm({
      title: "Chọn CLB mới",
      content: (
        <Select
          style={{ width: "100%" }}
          onChange={(v) => (newClub = v)}
        >
          {clubs.map((c) => (
            <Option value={c.id} key={c.id}>
              {c.name}
            </Option>
          ))}
        </Select>
      ),
      onOk: () => {
        const newMembers = members.map((m) =>
          selectedRows.some((s) => s.id === m.id)
            ? { ...m, clubId: newClub }
            : m
        );

        setMembers(newMembers);
        setData("members", newMembers);
      },
    });
  };

  return (
    <Tabs defaultActiveKey="1">
      {/* ================= CLB ================= */}
      <TabPane tab="CLB" key="1">
        <Space style={{ marginBottom: 10 }}>
          <Button type="primary" onClick={() => setVisible(true)}>
            + Thêm CLB
          </Button>

          <Input.Search
            placeholder="Tìm tên CLB..."
            onChange={(e) => {
              const value = e.target.value.toLowerCase();
              setClubs(
                getData("clubs").filter((c: Club) =>
                  c.name.toLowerCase().includes(value)
                )
              );
            }}
            style={{ width: 200 }}
          />
        </Space>

        <Table
          dataSource={clubs}
          rowKey="id"
          columns={[
            {
              title: "Ảnh",
              dataIndex: "avatar",
              render: (v: string) =>
                v ? <img src={v} width={50} /> : "No Image",
            },
            {
              title: "Tên CLB",
              dataIndex: "name",
              sorter: (a: Club, b: Club) =>
                a.name.localeCompare(b.name),
            },
            {
              title: "Ngày TL",
              dataIndex: "date",
              sorter: (a: Club, b: Club) =>
                new Date(a.date || "").getTime() -
                new Date(b.date || "").getTime(),
            },
            {
              title: "Mô tả",
              dataIndex: "desc",
              render: (html: string) => (
                <div
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              ),
            },
            { title: "Chủ nhiệm", dataIndex: "president" },
            {
              title: "Hoạt động",
              render: (r: Club) =>
                r.active ? (
                  <Tag color="green">Có</Tag>
                ) : (
                  <Tag>Không</Tag>
                ),
            },
            {
              title: "Action",
              render: (r: Club) => (
                <Space>
                  <Button
                    onClick={() => {
                      form.setFieldsValue(r);
                      (window as any).editId = r.id;
                      setVisible(true);
                    }}
                  >
                    Sửa
                  </Button>

                  <Button danger onClick={() => deleteClub(r.id)}>
                    Xóa
                  </Button>

                  <Button
                    onClick={() => {
                      const mem = members.filter(
                        (m) => m.clubId === r.id
                      );
                      Modal.info({
                        title: `Thành viên (${mem.length})`,
                        content: (
                          <ul>
                            {mem.map((m) => (
                              <li key={m.id}>
                                {m.fullName}
                              </li>
                            ))}
                          </ul>
                        ),
                      });
                    }}
                  >
                    Thành viên
                  </Button>
                </Space>
              ),
            },
          ]}
        />

        <Modal
          visible={visible}
          onCancel={() => {
            setVisible(false);
            (window as any).editId = null;
            form.resetFields();
          }}
          onOk={() => form.submit()}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={(values) => {
              let newData = [...clubs];

              if ((window as any).editId) {
                newData = newData.map((c) =>
                  c.id === (window as any).editId
                    ? { ...c, ...values }
                    : c
                );
              } else {
                newData.push({ ...values, id: Date.now() });
              }

              setClubs(newData);
              setData("clubs", newData);

              setVisible(false);
              form.resetFields();
              (window as any).editId = null;
            }}
          >
            <Form.Item name="name" label="Tên CLB" required>
              <Input />
            </Form.Item>

            <Form.Item name="avatar" label="Link ảnh">
              <Input />
            </Form.Item>

            <Form.Item name="date" label="Ngày thành lập">
              <Input type="date" />
            </Form.Item>

            <Form.Item name="desc" label="Mô tả HTML">
              <Input.TextArea />
            </Form.Item>

            <Form.Item name="president" label="Chủ nhiệm">
              <Input />
            </Form.Item>

            <Form.Item name="active" label="Hoạt động">
              <Select>
                <Option value={true}>Có</Option>
                <Option value={false}>Không</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </TabPane>

      {/* ================= APPLICATION ================= */}
      <TabPane tab="Đơn đăng ký" key="2">
        <Form onFinish={addApp} layout="inline">
          <Form.Item name="fullName">
            <Input placeholder="Tên" />
          </Form.Item>
          <Form.Item name="email">
            <Input placeholder="Email" />
          </Form.Item>
          <Form.Item name="phone">
            <Input placeholder="SĐT" />
          </Form.Item>
          <Form.Item name="clubId">
            <Select placeholder="CLB" style={{ width: 120 }}>
              {clubs.map((c) => (
                <Option key={c.id} value={c.id}>
                  {c.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Button htmlType="submit">Thêm</Button>
        </Form>

        <Space style={{ margin: 10 }}>
          <Button onClick={() => approve(selectedRows.map((r) => r.id))}>
            Duyệt
          </Button>
          <Button danger onClick={reject}>
            Từ chối
          </Button>
        </Space>

        <Table
          rowSelection={{
            onChange: (_, rows) => setSelectedRows(rows),
          }}
          dataSource={apps}
          rowKey="id"
          columns={[
            { title: "Tên", dataIndex: "fullName" },
            { title: "Email", dataIndex: "email" },
            { title: "SĐT", dataIndex: "phone" },
            {
              title: "Trạng thái",
              render: (r: Application) => (
                <Tag
                  color={
                    r.status === Status.APPROVED
                      ? "green"
                      : r.status === Status.REJECTED
                      ? "red"
                      : "orange"
                  }
                >
                  {r.status}
                </Tag>
              ),
            },
            { title: "Note", dataIndex: "note" },
          ]}
        />
      </TabPane>

      {/* ================= MEMBERS ================= */}
      <TabPane tab="Thành viên" key="3">
        <Button onClick={transferMembers}>Chuyển CLB</Button>

        <Table
          rowSelection={{
            onChange: (_, rows) => setSelectedRows(rows),
          }}
          dataSource={members}
          rowKey="id"
          columns={[
            { title: "Tên", dataIndex: "fullName" },
            { title: "Email", dataIndex: "email" },
            { title: "SĐT", dataIndex: "phone" },
            {
              title: "CLB",
              render: (r: Member) =>
                clubs.find((c) => c.id === r.clubId)?.name,
            },
          ]}
        />
      </TabPane>

      {/* ================= STATS ================= */}
      <TabPane tab="Thống kê" key="4">
        <h2>📊 Tổng quan</h2>

        <Table
          pagination={false}
          dataSource={[
            {
              key: "1",
              type: "Số CLB",
              value: clubs.length,
            },
            {
              key: "2",
              type: "Pending",
              value: apps.filter((a) => a.status === Status.PENDING).length,
            },
            {
              key: "3",
              type: "Approved",
              value: apps.filter((a) => a.status === Status.APPROVED).length,
            },
            {
              key: "4",
              type: "Rejected",
              value: apps.filter((a) => a.status === Status.REJECTED).length,
            },
          ]}
          columns={[
            { title: "Loại", dataIndex: "type" },
            {
              title: "Số lượng",
              dataIndex: "value",
              render: (v) => <b>{v}</b>,
            },
          ]}
        />

        <h2 style={{ marginTop: 30 }}>📌 Theo CLB</h2>

        <Table
          rowKey="id"
          dataSource={clubs.map((c) => ({
            id: c.id,
            name: c.name,
            pending: apps.filter(
              (a) => a.clubId === c.id && a.status === Status.PENDING
            ).length,
            approved: apps.filter(
              (a) => a.clubId === c.id && a.status === Status.APPROVED
            ).length,
            rejected: apps.filter(
              (a) => a.clubId === c.id && a.status === Status.REJECTED
            ).length,
          }))}
          columns={[
            { title: "CLB", dataIndex: "name" },
            {
              title: "Pending",
              dataIndex: "pending",
              render: (v) => <Tag color="orange">{v}</Tag>,
            },
            {
              title: "Approved",
              dataIndex: "approved",
              render: (v) => <Tag color="green">{v}</Tag>,
            },
            {
              title: "Rejected",
              dataIndex: "rejected",
              render: (v) => <Tag color="red">{v}</Tag>,
            },
            {
              title: "Tổng",
              render: (r: any) => (
                <b>{r.pending + r.approved + r.rejected}</b>
              ),
            },
          ]}
        />
      </TabPane>
    </Tabs>
  );
}