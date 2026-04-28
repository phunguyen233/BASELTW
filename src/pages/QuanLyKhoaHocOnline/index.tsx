import React, { useEffect, useState } from "react";
import {
  Table,
  Input,
  Select,
  Button,
  Modal,
  Form,
  InputNumber,
  message,
  Space,
  Tag,
} from "antd";

const { Option } = Select;
const { TextArea } = Input;

interface Course {
  id: number;
  name: string;
  teacher: string;
  students: number;
  description: string;
  status: "OPEN" | "CLOSED" | "PAUSED";
}

const teachers = ["Nguyễn Văn A", "Trần Thị B", "Lê Văn C"];

const statusMap: any = {
  OPEN: { text: "Đang mở", color: "green" },
  CLOSED: { text: "Đã kết thúc", color: "red" },
  PAUSED: { text: "Tạm dừng", color: "orange" },
};

const App: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filtered, setFiltered] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [teacherFilter, setTeacherFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);

  const [form] = Form.useForm();

  // load localStorage
  useEffect(() => {
    const data = localStorage.getItem("courses");
    if (data) {
      const parsed = JSON.parse(data);
      setCourses(parsed);
      setFiltered(parsed);
    }
  }, []);

  // save localStorage
  useEffect(() => {
    localStorage.setItem("courses", JSON.stringify(courses));
    handleFilter();
  }, [courses]);

  // filter + search
  const handleFilter = () => {
    let data = [...courses];

    if (search) {
      data = data.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (teacherFilter) {
      data = data.filter((c) => c.teacher === teacherFilter);
    }

    if (statusFilter) {
      data = data.filter((c) => c.status === statusFilter);
    }

    setFiltered(data);
  };

  useEffect(() => {
    handleFilter();
  }, [search, teacherFilter, statusFilter]);

  // add / edit
  const handleSubmit = (values: any) => {
    if (editing) {
      const updated = courses.map((c) =>
        c.id === editing.id ? { ...editing, ...values } : c
      );
      setCourses(updated);
      message.success("Cập nhật thành công");
    } else {
      // check trùng tên
      const exist = courses.find(
        (c) => c.name.trim() === values.name.trim()
      );
      if (exist) {
        message.error("Tên khóa học đã tồn tại");
        return;
      }

      const maxId = courses.length > 0 ? Math.max(...courses.map(c => c.id)) : 0;

      const newCourse: Course = {
        id: maxId +1,
        ...values,
      };

      setCourses([...courses, newCourse]);
      message.success("Thêm thành công");
    }

    setVisible(false);
    form.resetFields();
    setEditing(null);
  };

  // delete
  const handleDelete = (course: Course) => {
    if (course.students > 0) {
      message.error("Không thể xóa vì đã có học viên");
      return;
    }

    Modal.confirm({
      title: "Bạn có chắc muốn xóa?",
      onOk: () => {
        const newData = courses.filter((c) => c.id !== course.id);
        setCourses(newData);
        message.success("Đã xóa");
      },
    });
  };

  // columns
  const columns = [
    { title: "ID", dataIndex: "id" },
    { title: "Tên khóa học", dataIndex: "name" },
    { title: "Giảng viên", dataIndex: "teacher" },
    {
      title: "Số học viên",
      dataIndex: "students",
      sorter: (a: Course, b: Course) => a.students - b.students,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status: any) => (
        <Tag color={statusMap[status].color}>
          {statusMap[status].text}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      render: (_: any, record: Course) => (
        <Space>
          <Button
            onClick={() => {
              setEditing(record);
              setVisible(true);
              form.setFieldsValue(record);
            }}
          >
            Sửa
          </Button>
          <Button danger onClick={() => handleDelete(record)}>
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>Quản lý khóa học</h2>

      {/* filter */}
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm kiếm tên khóa học"
          onChange={(e) => setSearch(e.target.value)}
        />

        <Select
          placeholder="Giảng viên"
          allowClear
          style={{ width: 150 }}
          onChange={(v) => setTeacherFilter(v)}
        >
          {teachers.map((t) => (
            <Option key={t}>{t}</Option>
          ))}
        </Select>

        <Select
          placeholder="Trạng thái"
          allowClear
          style={{ width: 150 }}
          onChange={(v) => setStatusFilter(v)}
        >
          <Option value="OPEN">Đang mở</Option>
          <Option value="CLOSED">Đã kết thúc</Option>
          <Option value="PAUSED">Tạm dừng</Option>
        </Select>

        <Button
          type="primary"
          onClick={() => {
            setVisible(true);
            setEditing(null);
            form.resetFields();
          }}
        >
          Thêm khóa học
        </Button>
      </Space>

      {/* table */}
      <Table
        dataSource={filtered}
        columns={columns}
        rowKey="id"
      />

      {/* modal */}
      <Modal
        visible={visible}
        title={editing ? "Sửa khóa học" : "Thêm khóa học"}
        onCancel={() => setVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="name"
            label="Tên khóa học"
            rules={[
              { required: true, message: "Không được để trống" },
              { max: 100, message: "Tối đa 100 ký tự" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="teacher"
            label="Giảng viên"
            rules={[{ required: true }]}
          >
            <Select>
              {teachers.map((t) => (
                <Option key={t}>{t}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="students"
            label="Số học viên"
            rules={[{ required: true }]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả "
            rules={[{ required: true }]}
            
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="OPEN">Đang mở</Option>
              <Option value="CLOSED">Đã kết thúc</Option>
              <Option value="PAUSED">Tạm dừng</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default App;