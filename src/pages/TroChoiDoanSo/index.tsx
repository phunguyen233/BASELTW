import React, { useState } from "react";
import { Card, InputNumber, Button, Typography, Space } from "antd";

const { Title, Text } = Typography;

const TroChoiDoanSo: React.FC = () => {
  const [soBiMat, setSoBiMat] = useState<number>(
    Math.floor(Math.random() * 100) + 1
  );
  const [soDoan, setSoDoan] = useState<number | null>(null);
  const [thongBao, setThongBao] = useState<string>(
    "Hệ thống đã chọn một số từ 1 đến 100. Bạn có 10 lượt đoán."
  );
  const [soLuotConLai, setSoLuotConLai] = useState<number>(10);
  const [daKetThuc, setDaKetThuc] = useState<boolean>(false);

  const xuLyDoanSo = () => {
    if (daKetThuc || soDoan === null) return;

    if (soDoan < 1 || soDoan > 100) {
      setThongBao("Vui lòng nhập số hợp lệ từ 1 đến 100.");
      return;
    }

    const luotMoi = soLuotConLai - 1;
    setSoLuotConLai(luotMoi);

    if (soDoan < soBiMat) {
      setThongBao("Bạn đoán quá thấp!");
    } else if (soDoan > soBiMat) {
      setThongBao("Bạn đoán quá cao!");
    } else {
      setThongBao("Chúc mừng! Bạn đã đoán đúng!");
      setDaKetThuc(true);
      return;
    }

    if (luotMoi === 0) {
      setThongBao(`Bạn đã hết lượt! Số đúng là ${soBiMat}`);
      setDaKetThuc(true);
    }

    setSoDoan(null);
  };

  const choiLai = () => {
    setSoBiMat(Math.floor(Math.random() * 100) + 1);
    setSoDoan(null);
    setSoLuotConLai(10);
    setDaKetThuc(false);
    setThongBao("Hệ thống đã chọn một số từ 1 đến 100. Bạn có 10 lượt đoán.");
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: 80 }}>
      <Card
        style={{ width: 400, textAlign: "center" }}
        bordered
      >
        <Title level={3}>🎮 Trò Chơi Đoán Số</Title>

        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Text>{thongBao}</Text>
          <Text strong>Lượt còn lại: {soLuotConLai}</Text>

          {!daKetThuc && (
            <>
              <InputNumber
                min={1}
                max={100}
                value={soDoan}
                onChange={(value) => setSoDoan(value)}
                style={{ width: "100%" }}
                placeholder="Nhập số từ 1-100"
              />

              <Button type="primary" block onClick={xuLyDoanSo}>
                Đoán
              </Button>
            </>
          )}

          {daKetThuc && (
            <Button type="primary" danger block onClick={choiLai}>
              Chơi lại
            </Button>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default TroChoiDoanSo;