import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, Space } from "antd";

export default () => {

const [data,setData] = useState<any[]>([])
const [visible,setVisible] = useState(false)
const [editing,setEditing] = useState<any>(null)
const [form] = Form.useForm()

useEffect(()=>{
const saved = JSON.parse(localStorage.getItem("khoikienthuc") || "[]")
setData(saved)
},[])

const openAdd = ()=>{
setEditing(null)
form.resetFields()
setVisible(true)
}

const openEdit = (record: any)=>{
setEditing(record)
form.setFieldsValue(record)
setVisible(true)
}

const save = ()=>{

form.validateFields().then(values=>{

let newData

if(editing){

newData = data.map(i=>i.id===editing.id?{...editing,...values}:i)

}else{

const newId = data.length > 0 ? Math.max(...data.map(i=>i.id)) + 1 : 1

newData = [...data,{id:newId,...values}]

}

setData(newData)
localStorage.setItem("khoikienthuc",JSON.stringify(newData))
setVisible(false)

})

}

const remove = (id: number)=>{

const newData = data.filter(i=>i.id!==id)

setData(newData)
localStorage.setItem("khoikienthuc",JSON.stringify(newData))

}

const columns=[

{title:"ID",dataIndex:"id"},
{title:"Tên khối",dataIndex:"name"},

{
title:"Action",
render:(r: any)=>(
<Space>
<Button onClick={()=>openEdit(r)}>Sửa</Button>
<Button danger onClick={()=>remove(r.id)}>Xóa</Button>
</Space>
)
}

]

return(

<>

<Button type="primary" onClick={openAdd} style={{marginBottom:10}}>
Thêm khối kiến thức
</Button>

<Table rowKey="id" columns={columns} dataSource={data}/>

<Modal visible={visible} onOk={save} onCancel={()=>setVisible(false)}>

<Form form={form} layout="vertical">

<Form.Item name="name" label="Tên khối" rules={[{required:true}]}>
<Input/>
</Form.Item>

</Form>

</Modal>

</>

)

}