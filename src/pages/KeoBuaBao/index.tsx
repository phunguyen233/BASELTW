import React, { useState } from "react";
import { Button, Card, List, Typography, Space } from "antd";

const { Title, Text } = Typography;

type Choice = "Kéo" | "Búa" | "Bao";

export default function TroChoiOanTuTi() {
  const choices: Choice[] = ["Kéo", "Búa", "Bao"];

  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [computerChoice, setComputerChoice] = useState<Choice | null>(null);
  const [result, setResult] = useState<string>("");
  const [history, setHistory] = useState<string[]>([]);

  const playGame = (choice: Choice) => {
    const randomChoice =
      choices[Math.floor(Math.random() * choices.length)];

    setPlayerChoice(choice);
    setComputerChoice(randomChoice);

    let gameResult = "";

    if (choice === randomChoice) {
      gameResult = "Hòa";
    } else if (
      (choice === "Kéo" && randomChoice === "Bao") ||
      (choice === "Búa" && randomChoice === "Kéo") ||
      (choice === "Bao" && randomChoice === "Búa")
    ) {
      gameResult = "Bạn thắng";
    } else {
      gameResult = "Bạn thua";
    }

    setResult(gameResult);

    const record = `Bạn: ${choice} | Máy: ${randomChoice} → ${gameResult}`;
    setHistory((prev) => [record, ...prev]);
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: 50 }}>
      <Card style={{ width: 500 }}>
        <Title level={2} style={{ textAlign: "center" }}>
          Trò chơi Oẳn Tù Tì
        </Title>

        <Space style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          {choices.map((c) => (
            <Button
              key={c}
              type="primary"
              size="large"
              onClick={() => playGame(c)}
            >
              {c}
            </Button>
          ))}
        </Space>

        {playerChoice && (
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <Text>Bạn chọn: <b>{playerChoice}</b></Text>
            <br />
            <Text>Máy chọn: <b>{computerChoice}</b></Text>
            <br />
            <Title level={4}>Kết quả: {result}</Title>
          </div>
        )}

        <Title level={4}>Lịch sử ván đấu</Title>

        <List
          bordered
          dataSource={history}
          renderItem={(item) => <List.Item>{item}</List.Item>}
        />
      </Card>
    </div>
  );
}