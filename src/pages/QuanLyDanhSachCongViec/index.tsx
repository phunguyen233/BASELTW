import { useEffect, useState } from "react";
import "antd/dist/antd.css";
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
  DatePicker,
  Tag,
} from "antd";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";

const { TabPane } = Tabs;
const { Option } = Select;

type Task = {
  id: string;
  name: string;
  description: string;
  deadline: string;
  priority: string;
  status: "todo" | "doing" | "done";
  tag: string;
};

const STORAGE_KEY = "kanban_tasks";

// ===== MAIN APP =====
const App = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [visible, setVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form] = Form.useForm();

  // Load localStorage
  useEffect(() => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) setTasks(JSON.parse(data));
  }, []);

  // Save localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  // ===== ADD / EDIT TASK =====
  const handleSubmit = (values: any) => {
    if (editingTask) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingTask.id
            ? { ...t, ...values, deadline: values.deadline.toISOString() }
            : t
        )
      );
    } else {
      const newTask: Task = {
        id: uuidv4(),
        ...values,
        deadline: values.deadline.toISOString(),
        status: "todo",
      };
      setTasks([...tasks, newTask]);
    }

    setVisible(false);
    setEditingTask(null);
    form.resetFields();
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setVisible(true);
    form.setFieldsValue({
      ...task,
      deadline: dayjs(task.deadline),
    });
  };

  // ===== DASHBOARD =====
  const Dashboard = () => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === "done").length;
    const overdue = tasks.filter(
      (t) => dayjs(t.deadline).isBefore(dayjs()) && t.status !== "done"
    ).length;

    return (
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic title="Tổng Task" value={total} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Hoàn thành" value={done} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Quá hạn" value={overdue} />
          </Card>
        </Col>
      </Row>
    );
  };

  // ===== KANBAN =====
  const Kanban = () => {
    const columns = {
      todo: tasks.filter((t) => t.status === "todo"),
      doing: tasks.filter((t) => t.status === "doing"),
      done: tasks.filter((t) => t.status === "done"),
    };

    const onDragEnd = (result: any) => {
      if (!result.destination) return;

      const updated = tasks.map((task) =>
        task.id === result.draggableId
          ? { ...task, status: result.destination.droppableId }
          : task
      );

      setTasks(updated);
    };

    return (
      <DragDropContext onDragEnd={onDragEnd}>
        <Row gutter={16}>
          {Object.entries(columns).map(([key, col]) => (
            <Col span={8} key={key}>
              <h3>
                {key === "todo"
                  ? "Cần làm"
                  : key === "doing"
                  ? "Đang làm"
                  : "Hoàn thành"}
              </h3>
              <Droppable droppableId={key}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      minHeight: 300,
                      background: "#f5f5f5",
                      padding: 10,
                    }}
                  >
                    {col.map((task, index) => (
                      <Draggable
                        draggableId={task.id}
                        index={index}
                        key={task.id}
                      >
                        {(provided) => (
                          <Card
                            size="small"
                            style={{ marginBottom: 8 }}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => openEdit(task)}
                          >
                            <b>{task.name}</b>
                            <br />
                            <Tag>{task.priority}</Tag>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </Col>
          ))}
        </Row>
      </DragDropContext>
    );
  };

  // ===== TABLE =====
  const TaskTable = () => {
    const [search, setSearch] = useState("");

    const filtered = tasks.filter((t) =>
      t.name.toLowerCase().includes(search.toLowerCase())
    );

    const columns = [
      {
        title: "Tên",
        dataIndex: "name",
      },
      {
        title: "Deadline",
        dataIndex: "deadline",
        sorter: (a: Task, b: Task) =>
          dayjs(a.deadline).unix() - dayjs(b.deadline).unix(),
        render: (d: string) => dayjs(d).format("DD/MM/YYYY"),
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        filters: [
          { text: "Cần làm", value: "todo" },
          { text: "Đang làm", value: "doing" },
          { text: "Hoàn thành", value: "done" },
        ],
        onFilter: (value: any, record: Task) =>
          record.status === value,
      },
      {
        title: "Ưu tiên",
        dataIndex: "priority",
        render: (p: string) => <Tag>{p}</Tag>,
      },
      {
        title: "Hành động",
        render: (_: any, record: Task) => (
          <Button onClick={() => openEdit(record)}>Sửa</Button>
        ),
      },
    ];

    return (
      <>
        <Input.Search
          placeholder="Tìm task..."
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginBottom: 10 }}
        />
        <Table rowKey="id" columns={columns} dataSource={filtered} />
      </>
    );
  };

  return (
    <div style={{ padding: 20 }}>
      <Button
        type="primary"
        onClick={() => {
          setVisible(true);
          setEditingTask(null);
          form.resetFields();
        }}
        style={{ marginBottom: 16 }}
      >
        + Thêm Task
      </Button>

      <Tabs defaultActiveKey="1">
        <TabPane tab="Dashboard" key="1">
          <Dashboard />
        </TabPane>
        <TabPane tab="Kanban Board" key="2">
          <Kanban />
        </TabPane>
        <TabPane tab="Danh sách Task" key="3">
          <TaskTable />
        </TabPane>
      </Tabs>

      {/* MODAL */}
      <Modal
        title={editingTask ? "Sửa Task" : "Thêm Task"}
        visible={visible}
        onCancel={() => setVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item name="name" label="Tên task" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea />
          </Form.Item>

          <Form.Item name="deadline" label="Deadline" rules={[{ required: true }]}>
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="priority" label="Ưu tiên">
            <Select>
              <Option value="Cao">Cao</Option>
              <Option value="Trung bình">Trung bình</Option>
              <Option value="Thấp">Thấp</Option>
            </Select>
          </Form.Item>

          <Form.Item name="tag" label="Tag">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default App;