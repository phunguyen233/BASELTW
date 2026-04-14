import React, { useState, useEffect } from "react";
import {
  Tabs,
  Card,
  Select,
  InputNumber,
  Rate,
  Button,
  Form,
  Input,
  List,
  DatePicker,
  Alert,
  Table,
  Space,
} from "antd";
import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import moment from "moment";

const { TabPane } = Tabs;
const { Option } = Select;

// ===== TYPES =====
type Destination = {
  id: number;
  name: string;
  type: string;
  price: number;
  rating: number;
  description: string;
};

type PlanItem = {
  date: string;
  destinationId: number;
};

// ===== LOCAL STORAGE HELPERS =====
const getLocal = (key: string) => {
  return JSON.parse(localStorage.getItem(key) || "[]");
};

const setLocal = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// ===== MAIN APP =====
const App: React.FC = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [plans, setPlans] = useState<PlanItem[]>([]);

  useEffect(() => {
    setDestinations(getLocal("destinations"));
    setPlans(getLocal("plans"));
  }, []);

  // ===== SAVE =====
  const saveDestinations = (data: Destination[]) => {
    setDestinations(data);
    setLocal("destinations", data);
  };

  const savePlans = (data: PlanItem[]) => {
    setPlans(data);
    setLocal("plans", data);
  };

  // ===== TAB 1: HOME =====
  const [filterType, setFilterType] = useState<string>("all");

  const filtered = destinations.filter((d) =>
    filterType === "all" ? true : d.type === filterType
  );

  // ===== TAB 2: PLAN =====
  const [selectedDate, setSelectedDate] = useState<any>(null);
  const [selectedDest, setSelectedDest] = useState<number | null>(null);

  const addPlan = () => {
    if (!selectedDate || !selectedDest) return;
    const newPlans = [
      ...plans,
      {
        date: selectedDate.format("YYYY-MM-DD"),
        destinationId: selectedDest,
      },
    ];
    savePlans(newPlans);
  };

  // ===== TAB 3: BUDGET =====
  const totalBudget = plans.reduce((sum, p) => {
    const d = destinations.find((x) => x.id === p.destinationId);
    return sum + (d?.price || 0);
  }, 0);

  // ===== TAB 4: ADMIN =====
  const [form] = Form.useForm();

  const addDestination = (values: any) => {
    const newData = [
      ...destinations,
      { id: Date.now(), ...values },
    ];
    saveDestinations(newData);
    form.resetFields();
  };

  const deleteDestination = (id: number) => {
    const newData = destinations.filter((d) => d.id !== id);
    saveDestinations(newData);
  };

  return (
    <Tabs defaultActiveKey="1">
      {/* ===== HOME ===== */}
      <TabPane tab="Khám phá" key="1">
        <Space style={{ marginBottom: 16 }} wrap>
          <Select onChange={setFilterType} defaultValue="all" style={{ width: 150 }}>
            <Option value="all">Tất cả</Option>
            <Option value="biển">Biển</Option>
            <Option value="núi">Núi</Option>
            <Option value="thành phố">Thành phố</Option>
          </Select>

          <Select placeholder="Sắp xếp" style={{ width: 180 }} onChange={(val) => {
            let sorted = [...destinations];
            if (val === "price_asc") sorted.sort((a,b)=>a.price-b.price);
            if (val === "price_desc") sorted.sort((a,b)=>b.price-a.price);
            if (val === "rating_desc") sorted.sort((a,b)=>b.rating-a.rating);
            setDestinations(sorted);
          }}>
            <Option value="price_asc">Giá tăng dần</Option>
            <Option value="price_desc">Giá giảm dần</Option>
            <Option value="rating_desc">Đánh giá cao</Option>
          </Select>
        </Space>

        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
          dataSource={filtered}
          renderItem={(item) => (
            <List.Item>
              <Card
                hoverable
                cover={
                  <img
                    alt={item.name}
                    src={(item as any).image || "https://via.placeholder.com/300"}
                    style={{ height: 180, objectFit: "cover" }}
                  />
                }
              >
                <Card.Meta
                  title={item.name}
                  description={item.description}
                />
                <p style={{ marginTop: 8 }}>Giá: {item.price}</p>
                <Rate value={item.rating} disabled />
              </Card>
            </List.Item>
          )}
        />
      </TabPane>

      {/* ===== PLAN ===== */}
      <TabPane tab="Lịch trình" key="2">
        <Space style={{ marginBottom: 16 }} wrap>
          <DatePicker onChange={setSelectedDate} />
          <Select style={{ width: 200 }} onChange={setSelectedDest} placeholder="Chọn điểm đến">
            {destinations.map((d) => (
              <Option key={d.id} value={d.id}>{d.name}</Option>
            ))}
          </Select>
          <Button type="primary" onClick={addPlan}>Thêm</Button>
        </Space>

        <List
          bordered
          dataSource={plans}
          renderItem={(p, index) => {
            const d = destinations.find((x) => x.id === p.destinationId);

            const moveUp = () => {
              if (index === 0) return;
              const newPlans = [...plans];
              [newPlans[index - 1], newPlans[index]] = [newPlans[index], newPlans[index - 1]];
              savePlans(newPlans);
            };

            const moveDown = () => {
              if (index === plans.length - 1) return;
              const newPlans = [...plans];
              [newPlans[index + 1], newPlans[index]] = [newPlans[index], newPlans[index + 1]];
              savePlans(newPlans);
            };

            const remove = () => {
              const newPlans = plans.filter((_, i) => i !== index);
              savePlans(newPlans);
            };

            // giả lập thời gian di chuyển (random demo)
            const travelTime = index > 0 ? Math.floor(Math.random() * 3 + 1) + "h" : "-";

            return (
              <List.Item
                actions={[
                  <Button onClick={moveUp}>↑</Button>,
                  <Button onClick={moveDown}>↓</Button>,
                  <Button danger onClick={remove}>Xóa</Button>,
                ]}
              >
                <div>
                  <b>{p.date}</b> - {d?.name}
                  <div>💰 Chi phí: {d?.price || 0}</div>
                  <div>⏱ Di chuyển: {travelTime}</div>
                </div>
              </List.Item>
            );
          }}
        />

        {/* Tổng ngân sách */}
        <div style={{ marginTop: 16 }}>
          <b>Tổng ngân sách:</b> {plans.reduce((sum, p) => {
            const d = destinations.find((x) => x.id === p.destinationId);
            return sum + (d?.price || 0);
          }, 0)}
        </div>
      </TabPane>

      {/* ===== BUDGET ===== */}
      <TabPane tab="Ngân sách" key="3">
        {(() => {
          // Tính tổng và phân bổ (demo chia %)
          const total = plans.reduce((sum, p) => {
            const d = destinations.find((x) => x.id === p.destinationId);
            return sum + (d?.price || 0);
          }, 0);

          const food = Math.round(total * 0.4);
          const transport = Math.round(total * 0.3);
          const stay = Math.round(total * 0.3);

          const data = [
            { name: "Ăn uống", value: food },
            { name: "Di chuyển", value: transport },
            { name: "Lưu trú", value: stay },
          ];

          const budgetLimit = 2000; // có thể cho user nhập

          return (
            <div>
              <h3>Tổng ngân sách: {total}</h3>

              {total > budgetLimit && (
                <Alert message="Vượt ngân sách!" type="error" showIcon />
              )}

              {/* Chart */}
              <div style={{ width: "100%", height: 300 }}>
                {/* dùng recharts */}
                {/** @ts-ignore */}
                <ResponsiveContainer>
                  {/* @ts-ignore */}
                  <PieChart>
                    {/* @ts-ignore */}
                    <Pie data={data} dataKey="value" nameKey="name" outerRadius={100} label />
                    {/* @ts-ignore */}
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Số liệu chi tiết */}
              <ul>
                <li>Ăn uống: {food}</li>
                <li>Di chuyển: {transport}</li>
                <li>Lưu trú: {stay}</li>
              </ul>
            </div>
          );
        })()}
      </TabPane>

      {/* ===== ADMIN ===== */}
      <TabPane tab="Admin" key="4">
        {/* ===== FORM THÊM / SỬA ===== */}
        <Form form={form} onFinish={addDestination} layout="vertical">
          <Space wrap>
            <Form.Item name="name" rules={[{ required: true }]}>
              <Input placeholder="Tên địa điểm" />
            </Form.Item>

            <Form.Item name="type">
              <Select placeholder="Loại">
                <Option value="biển">Biển</Option>
                <Option value="núi">Núi</Option>
                <Option value="thành phố">Thành phố</Option>
              </Select>
            </Form.Item>

            <Form.Item name="price">
              <InputNumber placeholder="Tổng chi phí" />
            </Form.Item>

            <Form.Item name="foodCost">
              <InputNumber placeholder="Ăn uống" />
            </Form.Item>

            <Form.Item name="transportCost">
              <InputNumber placeholder="Di chuyển" />
            </Form.Item>

            <Form.Item name="stayCost">
              <InputNumber placeholder="Lưu trú" />
            </Form.Item>

            <Form.Item name="duration">
              <InputNumber placeholder="Thời gian tham quan (giờ)" />
            </Form.Item>

            <Form.Item name="rating">
              <InputNumber min={1} max={5} placeholder="Rating" />
            </Form.Item>

            <Form.Item name="image">
              <Input placeholder="Link ảnh" />
            </Form.Item>

            <Form.Item name="description">
              <Input placeholder="Mô tả" />
            </Form.Item>

            <Button type="primary" htmlType="submit">Thêm</Button>
          </Space>
        </Form>

        {/* ===== TABLE ===== */}
        <Table
          style={{ marginTop: 20 }}
          dataSource={destinations}
          rowKey="id"
          columns={[
            { title: "Tên", dataIndex: "name" },
            { title: "Loại", dataIndex: "type" },
            { title: "Giá", dataIndex: "price" },
            { title: "Rating", dataIndex: "rating" },
            {
              title: "Action",
              render: (_, record) => (
                <Space>
                  <Button danger onClick={() => deleteDestination(record.id)}>Xóa</Button>
                </Space>
              ),
            },
          ]}
        />

        {/* ===== THỐNG KÊ ===== */}
        <div style={{ marginTop: 30 }}>
          <h3>Thống kê</h3>

          {(() => {
            // số lượt lịch trình theo tháng
            const statsByMonth: any = {};
            plans.forEach((p) => {
              const month = p.date?.slice(0, 7);
              statsByMonth[month] = (statsByMonth[month] || 0) + 1;
            });

            // địa điểm phổ biến
            const popular: any = {};
            plans.forEach((p) => {
              popular[p.destinationId] = (popular[p.destinationId] || 0) + 1;
            });

            const mostPopularId = Object.keys(popular).sort((a, b) => popular[b] - popular[a])[0];
            const mostPopular = destinations.find(d => d.id === Number(mostPopularId));

            // tổng tiền
            const totalMoney = plans.reduce((sum, p) => {
              const d = destinations.find(x => x.id === p.destinationId);
              return sum + (d?.price || 0);
            }, 0);

            return (
              <div>
                <p><b>Tổng lịch trình theo tháng:</b></p>
                <ul>
                  {Object.keys(statsByMonth).map(m => (
                    <li key={m}>{m}: {statsByMonth[m]}</li>
                  ))}
                </ul>

                <p><b>Địa điểm phổ biến nhất:</b> {mostPopular?.name || "-"}</p>

                <p><b>Tổng doanh thu:</b> {totalMoney}</p>
              </div>
            );
          })()}
        </div>
      </TabPane>
    </Tabs>
  );
};

export default App;