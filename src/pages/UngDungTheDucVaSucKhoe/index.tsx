import React, { useState, useEffect } from "react";
import {
  Tabs, Card, Row, Col, Statistic, Table, Button, Modal, Form,
  Input, Select, InputNumber, DatePicker, Tag, Popconfirm,
  Drawer, Progress, Segmented, Timeline
} from "antd";
import dayjs from "dayjs";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip
} from "recharts";

const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

/* ================= LOCAL ================= */
const load = (k: string) => JSON.parse(localStorage.getItem(k) || "[]");
const save = (k: string, d: any) => localStorage.setItem(k, JSON.stringify(d));

/* ================= TYPES ================= */
type Workout = {
  id: number;
  date: string;
  type: string;
  duration: number;
  calories: number;
  note: string;
  status: string;
};

type Health = {
  id: number;
  date: string;
  weight: number;
  height: number;
  heart: number;
  sleep: number;
};

type Goal = {
  id: number;
  name: string;
  type: string;
  target: number;
  current: number;
  deadline: string;
  status: string;
};

type Exercise = {
  id: number;
  name: string;
  muscle: string;
  level: string;
  desc: string;
  calo: number;
};

/* ================= APP ================= */
export default function App() {
  const [workouts, setWorkouts] = useState<Workout[]>(load("w"));
  const [health, setHealth] = useState<Health[]>(load("h"));
  const [goals, setGoals] = useState<Goal[]>(load("g"));
  const [exercises, setExercises] = useState<Exercise[]>(load("e"));

  useEffect(() => save("w", workouts), [workouts]);
  useEffect(() => save("h", health), [health]);
  useEffect(() => save("g", goals), [goals]);
  useEffect(() => save("e", exercises), [exercises]);

  /* ================= DASHBOARD ================= */
  const totalCalories = workouts.reduce((s, w) => s + w.calories, 0);
  const weightData = health.map(h => ({ date: h.date, weight: h.weight }));
  const workoutData = workouts.map(w => ({
    week: dayjs(w.date).week(),
    count: 1
  }));

  const streak = [...new Set(workouts.map(w => w.date))].length;

  const goalPercent =
    goals.length === 0 ? 0 :
    goals.reduce((s, g) => s + g.current / g.target, 0) / goals.length * 100;

  /* ================= WORKOUT ================= */
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form] = Form.useForm();
  const [filter, setFilter] = useState<any>({});

  const handleWorkout = (v: any) => {
    const data = {
      ...v,
      date: v.date.format("YYYY-MM-DD"),
      id: editing ? editing.id : Date.now()
    };

    if (editing) {
      setWorkouts(workouts.map(w => w.id === editing.id ? data : w));
    } else {
      setWorkouts([...workouts, data]);
    }

    setModalOpen(false);
    setEditing(null);
    form.resetFields();
  };

  const filteredWorkout = workouts.filter(w => {
    if (filter.type && w.type !== filter.type) return false;
    if (filter.search && !w.type.toLowerCase().includes(filter.search.toLowerCase())) return false;
    return true;
  });

  /* ================= HEALTH ================= */
  const calcBMI = (w: number, h: number) => w / ((h / 100) ** 2);

  const bmiTag = (b: number) => {
    if (b < 18.5) return <Tag color="blue">Thiếu</Tag>;
    if (b < 25) return <Tag color="green">Bình thường</Tag>;
    if (b < 30) return <Tag color="gold">Thừa</Tag>;
    return <Tag color="red">Béo</Tag>;
  };

  /* ================= GOALS ================= */
  const [drawer, setDrawer] = useState(false);
  const [goalForm] = Form.useForm();
  const [goalFilter, setGoalFilter] = useState("all");

  const filteredGoals = goals.filter(g =>
    goalFilter === "all" ? true : g.status === goalFilter
  );

  /* ================= EXERCISE ================= */
  const [exModal, setExModal] = useState(false);
  const [exForm] = Form.useForm();
  const [exFilter, setExFilter] = useState<any>({});

  const filteredEx = exercises.filter(e => {
    if (exFilter.search && !e.name.toLowerCase().includes(exFilter.search.toLowerCase())) return false;
    if (exFilter.muscle && e.muscle !== exFilter.muscle) return false;
    return true;
  });

  /* ================= UI ================= */
  return (
    <Tabs>
      {/* DASHBOARD */}
      <TabPane tab="Dashboard" key="1">
        <Row gutter={16}>
          <Col span={6}><Card><Statistic title="Buổi tập" value={workouts.length} /></Card></Col>
          <Col span={6}><Card><Statistic title="Calo" value={totalCalories} /></Card></Col>
          <Col span={6}><Card><Statistic title="Streak" value={streak} /></Card></Col>
          <Col span={6}><Card><Statistic title="% Mục tiêu" value={goalPercent.toFixed(1)} /></Card></Col>
        </Row>

        <LineChart width={400} height={200} data={weightData}>
          <XAxis dataKey="date" /><YAxis /><Tooltip />
          <Line dataKey="weight" />
        </LineChart>

        <BarChart width={400} height={200} data={workoutData}>
          <XAxis dataKey="week" /><YAxis /><Tooltip />
          <Bar dataKey="count" />
        </BarChart>

        <Timeline>
          {workouts.slice(-5).map(w => (
            <Timeline.Item key={w.id}>
              {w.date} - {w.type}
            </Timeline.Item>
          ))}
        </Timeline>
      </TabPane>

      {/* WORKOUT */}
      <TabPane tab="Nhật ký tập" key="2">
        <Input placeholder="Search" onChange={e => setFilter({ ...filter, search: e.target.value })} />
        <Select onChange={v => setFilter({ ...filter, type: v })} allowClear>
          <Option value="Cardio">Cardio</Option>
          <Option value="Strength">Strength</Option>
        </Select>

        <Button onClick={() => setModalOpen(true)}>Thêm</Button>

        <Table dataSource={filteredWorkout} rowKey="id" columns={[
          { title: "Ngày", dataIndex: "date" },
          { title: "Loại", dataIndex: "type" },
          { title: "Calo", dataIndex: "calories" },
          {
            render: (_, r) => (
              <>
                <Button onClick={() => {
                  setEditing(r);
                  form.setFieldsValue({ ...r, date: dayjs(r.date) });
                  setModalOpen(true);
                }}>Sửa</Button>

                <Popconfirm onConfirm={() => setWorkouts(workouts.filter(w => w.id !== r.id))}>
                  <Button danger>Xóa</Button>
                </Popconfirm>
              </>
            )
          }
        ]} />

        <Modal visible={modalOpen} onOk={() => form.submit()} onCancel={() => setModalOpen(false)}>
          <Form form={form} onFinish={handleWorkout}>
            <Form.Item name="date" label="Ngày"><DatePicker /></Form.Item>
            <Form.Item name="type" label="Loại"><Select>
              <Option value="Cardio">Cardio</Option>
              <Option value="Strength">Strength</Option>
              <Option value="Yoga">Yoga</Option>
              <Option value="HIIT">HIIT</Option>
            </Select></Form.Item>
            <Form.Item name="duration"><InputNumber /></Form.Item>
            <Form.Item name="calories"><InputNumber /></Form.Item>
            <Form.Item name="note"><Input /></Form.Item>
          </Form>
        </Modal>
      </TabPane>

      {/* HEALTH */}
      <TabPane tab="Sức khỏe" key="3">
        <Table dataSource={health} rowKey="id" columns={[
          { title: "Ngày", dataIndex: "date" },
          { title: "Cân nặng", dataIndex: "weight" },
          { title: "Chiều cao", dataIndex: "height" },
          {
            title: "BMI",
            render: (_, r) => {
              const b = calcBMI(r.weight, r.height);
              return <>{b.toFixed(1)} {bmiTag(b)}</>;
            }
          }
        ]} />
      </TabPane>

      {/* GOALS */}
      <TabPane tab="Mục tiêu" key="4">
        <Segmented options={["all", "doing", "done"]} onChange={setGoalFilter} />
        <Button onClick={() => setDrawer(true)}>Thêm</Button>

        <Row gutter={16}>
          {filteredGoals.map(g => (
            <Col span={8} key={g.id}>
              <Card title={g.name}>
                <Progress percent={(g.current / g.target) * 100} />
                <InputNumber
                  value={g.current}
                  onChange={(v: any) =>
                    setGoals(goals.map(x => x.id === g.id ? { ...x, current: v } : x))
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>

        <Drawer visible={drawer} onClose={() => setDrawer(false)}>
          <Form form={goalForm} onFinish={(v) => {
            setGoals([...goals, { ...v, id: Date.now(), current: 0 }]);
            setDrawer(false);
          }}>
            <Form.Item name="name"><Input /></Form.Item>
            <Form.Item name="type"><Input /></Form.Item>
            <Form.Item name="target"><InputNumber /></Form.Item>
            <Button htmlType="submit">Save</Button>
          </Form>
        </Drawer>
      </TabPane>

      {/* EXERCISE */}
      <TabPane tab="Thư viện" key="5">
        <Input placeholder="Search" onChange={e => setExFilter({ ...exFilter, search: e.target.value })} />
        <Button onClick={() => setExModal(true)}>Thêm</Button>

        <Row gutter={16}>
          {filteredEx.map(e => (
            <Col span={8} key={e.id}>
              <Card title={e.name}>
                <p>{e.muscle}</p>
                <Tag>{e.level}</Tag>
                <p>{e.desc}</p>
              </Card>
            </Col>
          ))}
        </Row>

        <Modal visible={exModal} onOk={() => exForm.submit()} onCancel={() => setExModal(false)}>
          <Form form={exForm} onFinish={(v) => {
            setExercises([...exercises, { ...v, id: Date.now() }]);
            setExModal(false);
          }}>
            <Form.Item name="name"><Input /></Form.Item>
            <Form.Item name="muscle"><Input /></Form.Item>
            <Form.Item name="level"><Input /></Form.Item>
            <Form.Item name="desc"><Input /></Form.Item>
            <Form.Item name="calo"><InputNumber /></Form.Item>
          </Form>
        </Modal>
      </TabPane>
    </Tabs>
  );
}