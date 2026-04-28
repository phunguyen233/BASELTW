import React, { useState, useEffect } from "react";
import {
  Tabs,
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  DatePicker,
  Tag,
  Popconfirm,
  Drawer,
  Progress,
  Segmented,
} from "antd";
import dayjs from "dayjs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const { TabPane } = Tabs;
const { Option } = Select;

/* ================= LOCAL STORAGE ================= */
const load = (key: string) => JSON.parse(localStorage.getItem(key) || "[]");
const save = (key: string, data: any) =>
  localStorage.setItem(key, JSON.stringify(data));

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

/* ================= MAIN ================= */
const App = () => {
  const [workouts, setWorkouts] = useState<Workout[]>(load("workouts"));
  const [health, setHealth] = useState<Health[]>(load("health"));
  const [goals, setGoals] = useState<Goal[]>(load("goals"));

  useEffect(() => save("workouts", workouts), [workouts]);
  useEffect(() => save("health", health), [health]);
  useEffect(() => save("goals", goals), [goals]);

  /* ================= DASHBOARD ================= */
  const totalCalories = workouts.reduce((sum, w) => sum + w.calories, 0);

  const weightData = health.map((h) => ({
    date: h.date,
    weight: h.weight,
  }));

  const workoutData = workouts.map((w) => ({
    week: dayjs(w.date).week(),
    count: 1,
  }));

  /* ================= WORKOUT CRUD ================= */
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const addWorkout = (values: any) => {
    const newData = {
      ...values,
      id: Date.now(),
      date: values.date.format("YYYY-MM-DD"),
    };
    setWorkouts([...workouts, newData]);
    setModalOpen(false);
    form.resetFields();
  };

  const deleteWorkout = (id: number) => {
    setWorkouts(workouts.filter((w) => w.id !== id));
  };

  /* ================= HEALTH ================= */
  const calcBMI = (w: number, h: number) => {
    const bmi = w / ((h / 100) ** 2);
    return bmi.toFixed(1);
  };

  const getBMITag = (bmi: number) => {
    if (bmi < 18.5) return <Tag color="blue">Thiếu cân</Tag>;
    if (bmi < 25) return <Tag color="green">Bình thường</Tag>;
    if (bmi < 30) return <Tag color="gold">Thừa cân</Tag>;
    return <Tag color="red">Béo phì</Tag>;
  };

  /* ================= GOALS ================= */
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [goalForm] = Form.useForm();

  const addGoal = (values: any) => {
    const newGoal = {
      ...values,
      id: Date.now(),
      current: 0,
    };
    setGoals([...goals, newGoal]);
    setDrawerOpen(false);
    goalForm.resetFields();
  };

  /* ================= UI ================= */
  return (
    <Tabs defaultActiveKey="1">
      {/* ================= DASHBOARD ================= */}
      <TabPane tab="Dashboard" key="1">
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic title="Tổng buổi tập" value={workouts.length} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="Calo" value={totalCalories} />
            </Card>
          </Col>
        </Row>

        <h3>Biểu đồ cân nặng</h3>
        <LineChart width={500} height={300} data={weightData}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="weight" />
        </LineChart>

        <h3>Biểu đồ buổi tập</h3>
        <BarChart width={500} height={300} data={workoutData}>
          <XAxis dataKey="week" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" />
        </BarChart>
      </TabPane>

      {/* ================= WORKOUT ================= */}
      <TabPane tab="Nhật ký tập" key="2">
        <Button onClick={() => setModalOpen(true)}>Thêm</Button>

        <Table
          dataSource={workouts}
          rowKey="id"
          columns={[
            { title: "Ngày", dataIndex: "date" },
            { title: "Loại", dataIndex: "type" },
            { title: "Thời gian", dataIndex: "duration" },
            { title: "Calo", dataIndex: "calories" },
            { title: "Trạng thái", dataIndex: "status" },
            {
              title: "Action",
              render: (_, r) => (
                <Popconfirm
                  title="Xóa?"
                  onConfirm={() => deleteWorkout(r.id)}
                >
                  <Button danger>Xóa</Button>
                </Popconfirm>
              ),
            },
          ]}
        />

        <Modal
          visible={modalOpen}
          onCancel={() => setModalOpen(false)}
          onOk={() => form.submit()}
        >
          <Form form={form} onFinish={addWorkout}>
            <Form.Item name="date" label="Ngày">
              <DatePicker />
            </Form.Item>
            <Form.Item name="type" label="Loại">
              <Select>
                <Option value="Cardio">Cardio</Option>
                <Option value="Gym">Gym</Option>
              </Select>
            </Form.Item>
            <Form.Item name="duration" label="Thời gian">
              <InputNumber />
            </Form.Item>
            <Form.Item name="calories" label="Calo">
              <InputNumber />
            </Form.Item>
            <Form.Item name="status" label="Trạng thái">
              <Select>
                <Option value="done">Hoàn thành</Option>
                <Option value="miss">Bỏ</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </TabPane>

      {/* ================= HEALTH ================= */}
      <TabPane tab="Chỉ số sức khỏe" key="3">
        <Table
          dataSource={health}
          rowKey="id"
          columns={[
            { title: "Ngày", dataIndex: "date" },
            { title: "Cân nặng", dataIndex: "weight" },
            { title: "Chiều cao", dataIndex: "height" },
            {
              title: "BMI",
              render: (_, r) => {
                const bmi = Number(calcBMI(r.weight, r.height));
                return (
                  <>
                    {bmi} {getBMITag(bmi)}
                  </>
                );
              },
            },
          ]}
        />
      </TabPane>

      {/* ================= GOALS ================= */}
      <TabPane tab="Mục tiêu" key="4">
        <Button onClick={() => setDrawerOpen(true)}>Thêm mục tiêu</Button>

        <Row gutter={16}>
          {goals.map((g) => {
            const percent = (g.current / g.target) * 100;
            return (
              <Col span={8} key={g.id}>
                <Card title={g.name}>
                  <p>{g.type}</p>
                  <Progress percent={percent} />
                </Card>
              </Col>
            );
          })}
        </Row>

        <Drawer
          visible={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title="Thêm mục tiêu"
        >
          <Form form={goalForm} onFinish={addGoal}>
            <Form.Item name="name" label="Tên">
              <Input />
            </Form.Item>
            <Form.Item name="type" label="Loại">
              <Input />
            </Form.Item>
            <Form.Item name="target" label="Mục tiêu">
              <InputNumber />
            </Form.Item>
            <Button htmlType="submit">Lưu</Button>
          </Form>
        </Drawer>
      </TabPane>

      {/* ================= LIBRARY ================= */}
      <TabPane tab="Thư viện bài tập" key="5">
        <p>Phần này bạn có thể mở rộng thêm (Card Grid + Modal)</p>
      </TabPane>
    </Tabs>
  );
};

export default App;