import React,{useState,useEffect} from "react"
import {Card,InputNumber,Button,Table,message,Divider,List} from "antd"

export default ()=>{

const [easy,setEasy]=useState(0)
const [medium,setMedium]=useState(0)
const [hard,setHard]=useState(0)
const [veryHard,setVeryHard]=useState(0)

const [de,setDe]=useState<any[]>([])
const [savedExam,setSavedExam]=useState<any[]>([])

useEffect(()=>{

const saved = JSON.parse(localStorage.getItem("dethi") || "[]")
setSavedExam(saved)

},[])


const randomPick = (arr: any[],n: number)=>{

const shuffled=[...arr].sort(()=>0.5-Math.random())
return shuffled.slice(0,n)

}


const generate=()=>{

const questions = JSON.parse(localStorage.getItem("cauhoi") || "[]")

const easyQ = questions.filter((q: any)=>q.mucdo==="Dễ")
const mediumQ = questions.filter((q: any)=>q.mucdo==="Trung bình")
const hardQ = questions.filter((q: any)=>q.mucdo==="Khó")
const veryHardQ = questions.filter((q: any)=>q.mucdo==="Rất khó")


if(
easyQ.length < easy ||
mediumQ.length < medium ||
hardQ.length < hard ||
veryHardQ.length < veryHard
){

message.error("Không đủ câu hỏi. Hãy thêm câu hỏi ở tab Câu hỏi!")
return

}

const result=[

...randomPick(easyQ,easy),
...randomPick(mediumQ,medium),
...randomPick(hardQ,hard),
...randomPick(veryHardQ,veryHard)

]

setDe(result)

message.success("Tạo đề thi thành công")

}


const saveExam=()=>{

const newExam=[...savedExam,{id:Date.now(),questions:de}]

setSavedExam(newExam)

localStorage.setItem("dethi",JSON.stringify(newExam))

message.success("Đã lưu đề thi")

}


const loadExam=(exam: any)=>{

setDe(exam.questions)

}


/* TABLE COLUMNS */

const columns=[

{
title:"Câu hỏi",
render:(r: any,i: number)=>`Câu ${i+1}`
},

{
title:"Nội dung câu hỏi",
dataIndex:"noidung"
},

{
title:"Mức độ",
dataIndex:"mucdo"
}

]


return(

<Card>

<h3>Tạo đề thi</h3>

<div>
Câu dễ
<InputNumber value={easy} onChange={v=>setEasy(v||0)}/>
</div>

<div>
Câu trung bình
<InputNumber value={medium} onChange={v=>setMedium(v||0)}/>
</div>

<div>
Câu khó
<InputNumber value={hard} onChange={v=>setHard(v||0)}/>
</div>

<div>
Câu rất khó
<InputNumber value={veryHard} onChange={v=>setVeryHard(v||0)}/>
</div>

<br/>

<Button type="primary" onClick={generate}>
Tạo đề
</Button>

<Button onClick={saveExam} style={{marginLeft:10}}>
Lưu đề
</Button>

<Divider/>

<h3>Danh sách câu hỏi</h3>

<Table
rowKey={(r)=>r.id}
columns={columns}
dataSource={de}
pagination={false}
/>

<Divider/>

<h3>Đề thi đã lưu</h3>

<List

dataSource={savedExam}

renderItem={(item: any)=>(
<List.Item>

<Button onClick={()=>loadExam(item)}>
Mở đề {item.id}
</Button>

</List.Item>
)}

/>

</Card>

)

}