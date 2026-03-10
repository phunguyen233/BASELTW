import React from "react";
import { Card, Tabs } from "antd";

import KhoiKienThuc from "./KhoiKienThuc";
import MonHoc from "./MonHoc";
import CauHoi from "./CauHoi";
import DeThi from "./DeThi";

const { TabPane } = Tabs;

export default () => {

return (

<Card title="Ngân hàng câu hỏi">

<Tabs defaultActiveKey="1">

<TabPane tab="Khối kiến thức" key="1">
<KhoiKienThuc/>
</TabPane>

<TabPane tab="Môn học" key="2">
<MonHoc/>
</TabPane>

<TabPane tab="Câu hỏi" key="3">
<CauHoi/>
</TabPane>

<TabPane tab="Đề thi" key="4">
<DeThi/>
</TabPane>

</Tabs>

</Card>

)

}