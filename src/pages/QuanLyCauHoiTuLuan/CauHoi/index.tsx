import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, Select, Space, message } from "antd";

export default () => {

const [data, setData] = useState<any[]>([]);
const [visible, setVisible] = useState(false);
const [form] = Form.useForm();

const [monHoc, setMonHoc] = useState<any[]>([]);
const [khoiKT, setKhoiKT] = useState<any[]>([]);

const [filter, setFilter] = useState({
mon: "",
mucdo: "",
khoi: ""
});

const mucdo = ["Dễ", "Trung bình", "Khó", "Rất khó"];


/* LOAD DATA */
useEffect(() => {

const mon = JSON.parse(localStorage.getItem("monhoc") || "[]");
const khoi = JSON.parse(localStorage.getItem("khoikienthuc") || "[]");
const cauhoi = JSON.parse(localStorage.getItem("cauhoi") || "[]");

setMonHoc(mon);
setKhoiKT(khoi);
setData(cauhoi);

}, []);


/* SAVE */
const save = () => {

form.validateFields().then(v => {

const newData = [...data, { id: Date.now(), ...v }];

setData(newData);

localStorage.setItem("cauhoi", JSON.stringify(newData));

setVisible(false);

message.success("Thêm câu hỏi thành công");

});

};


/* DELETE */
const remove = (id: number) => {

const newData = data.filter(i => i.id !== id);

setData(newData);

localStorage.setItem("cauhoi", JSON.stringify(newData));

};


/* FILTER */

const filtered = data.filter(q =>

(!filter.mon || q.mon === filter.mon) &&
(!filter.mucdo || q.mucdo === filter.mucdo) &&
(!filter.khoi || q.khoi === filter.khoi)

);


/* TABLE */

const columns = [

{ title: "ID", dataIndex: "id" },
{ title: "Môn", dataIndex: "mon" },
{ title: "Khối", dataIndex: "khoi" },
{ title: "Mức độ", dataIndex: "mucdo" },
{ title: "Nội dung", dataIndex: "noidung" },

{
title: "Action",
render: (r: any) => (
<Button danger onClick={() => remove(r.id)}>
Xóa
</Button>
)
}

];


return (

<>

<Space style={{ marginBottom: 10 }}>

<Select
placeholder="Môn học"
style={{ width: 150 }}
onChange={v => setFilter({ ...filter, mon: v })}
>

{monHoc.map((m: any) => (
<Select.Option value={m.code}>
{m.name}
</Select.Option>
))}

</Select>


<Select
placeholder="Mức độ"
style={{ width: 150 }}
onChange={v => setFilter({ ...filter, mucdo: v })}
>

{mucdo.map(m => (
<Select.Option value={m}>{m}</Select.Option>
))}

</Select>


<Select
placeholder="Khối"
style={{ width: 150 }}
onChange={v => setFilter({ ...filter, khoi: v })}
>

{khoiKT.map((k: any) => (
<Select.Option value={k.name}>
{k.name}
</Select.Option>
))}

</Select>


<Button type="primary" onClick={() => setVisible(true)}>
Thêm câu hỏi
</Button>

</Space>


<Table rowKey="id" columns={columns} dataSource={filtered} />


<Modal visible={visible} onOk={save} onCancel={() => setVisible(false)}>

<Form form={form} layout="vertical">

<Form.Item name="mon" label="Môn học" rules={[{required:true}]}>

<Select>

{monHoc.map((m: any)=>(
<Select.Option key={m.code} value={m.code}>
{m.name}
</Select.Option>
))}

</Select>

</Form.Item>


<Form.Item name="khoi" label="Khối kiến thức" rules={[{required:true}]}>

<Select>

{khoiKT.map((k: any)=>(
<Select.Option key={k.id} value={k.name}>
{k.name}
</Select.Option>
))}

</Select>

</Form.Item>


<Form.Item name="mucdo" label="Mức độ">

<Select>
{mucdo.map(m => (
<Select.Option value={m}>{m}</Select.Option>
))}
</Select>

</Form.Item>


<Form.Item name="noidung" label="Nội dung">
<Input.TextArea rows={4} />
</Form.Item>

</Form>

</Modal>

</>

);

};