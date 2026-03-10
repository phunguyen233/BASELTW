import React, { useState, useEffect } from "react"
import { Table, Button, Modal, Form, Input, Space, message } from "antd"

export default () => {

const [data,setData] = useState<any[]>([])
const [visible,setVisible] = useState(false)
const [editing,setEditing] = useState<any>(null)

const [form] = Form.useForm()

/* LOAD DATA */
useEffect(()=>{

const saved = localStorage.getItem("monhoc")

if(saved){
setData(JSON.parse(saved))
}

},[])


/* OPEN ADD */

const openAdd = ()=>{
setEditing(null)
form.resetFields()
setVisible(true)
}


/* OPEN EDIT */

const openEdit = (r: any)=>{
setEditing(r)
form.setFieldsValue(r)
setVisible(true)
}


/* SAVE */

const save = ()=>{

form.validateFields().then(v=>{

let newData

if(editing){

newData = data.map(i =>
i.id===editing.id ? {...editing,...v} : i
)

}else{

newData = [...data,{
id:Date.now(),
...v
}]

}

setData(newData)

localStorage.setItem("monhoc",JSON.stringify(newData))

setVisible(false)

message.success("Lưu môn học thành công")

})

}


/* DELETE */

const remove = (id: number)=>{

const newData = data.filter(i=>i.id!==id)

setData(newData)

localStorage.setItem("monhoc",JSON.stringify(newData))

}


/* TABLE */

const columns = [

{title:"Mã môn",dataIndex:"code"},

{title:"Tên môn",dataIndex:"name"},

{title:"Tín chỉ",dataIndex:"tinchi"},

{
title:"Action",

render:(r: any)=>(
<Space>

<Button onClick={()=>openEdit(r)}>
Sửa
</Button>

<Button danger onClick={()=>remove(r.id)}>
Xóa
</Button>

</Space>
)

}

]


return(

<>

<Button
type="primary"
onClick={openAdd}
style={{marginBottom:10}}
>

Thêm môn học

</Button>


<Table
rowKey="id"
columns={columns}
dataSource={data}
/>


<Modal
visible={visible}
onOk={save}
onCancel={()=>setVisible(false)}
>

<Form form={form} layout="vertical">

<Form.Item
name="code"
label="Mã môn"
rules={[{required:true}]}
>
<Input/>
</Form.Item>


<Form.Item
name="name"
label="Tên môn"
rules={[{required:true}]}
>
<Input/>
</Form.Item>


<Form.Item
name="tinchi"
label="Số tín chỉ"
>
<Input/>
</Form.Item>

</Form>

</Modal>

</>

)

}