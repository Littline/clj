'use client'
import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Home() {
  const [socket, setSocket] = useState(null);
  const [chartDataNodeId1, setChartDataNodeId1] = useState({
    labels: [],
    datasets: [{
      label: 'NodeId 1',
      data: [],
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1,
    }]
  });

  const [chartDataNodeId2, setChartDataNodeId2] = useState({
    labels: [],
    datasets: [{
      label: 'NodeId 2',
      data: [],
      borderColor: 'rgb(255, 99, 132)',
      tension: 0.1,
    }]
  });

  // 状态变量用于存储最新接收到的消息
  const [messageLog, setMessageLog] = useState([]);
  // 状态变量用于存储当前时间
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8090');
    setSocket(ws);

    ws.onopen = () => {
      console.log('WebSocket连接已打开');
    };

    ws.onmessage = (event) => {
      console.log('收到消息:', event.data);

      // 将新消息添加到日志中
      setMessageLog((prevLog) => {
        const newLog = [...prevLog, event.data].slice(-10); // 保持最新的十条消息
        return newLog;
      });

      try {
        const fixedData = event.data
          .replace(/=/g, ':')
          .replace(/(\w+)(?=\s*:)/g, '"$1"');
        
        const data = JSON.parse(fixedData);
        const nodeId1Value = data["ShapemeterZoneInputs1"];
        const nodeId2Value = data["ShapemeterZoneInputs10"];
        
        const currentTimeLabel = new Date().toLocaleTimeString();

        setChartDataNodeId1((prevData) => {
          const newLabels = [...prevData.labels, currentTimeLabel].slice(-10);
          const newNodeId1Data = [...prevData.datasets[0].data, nodeId1Value].slice(-10);
          return {
            labels: newLabels,
            datasets: [{ ...prevData.datasets[0], data: newNodeId1Data }],
          };
        });

        setChartDataNodeId2((prevData) => {
          const newLabels = [...prevData.labels, currentTimeLabel].slice(-10);
          const newNodeId2Data = [...prevData.datasets[0].data, nodeId2Value].slice(-10);
          return {
            labels: newLabels,
            datasets: [{ ...prevData.datasets[0], data: newNodeId2Data }],
          };
        });
      } catch (error) {
        console.error('解析 WebSocket 数据出错:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket连接已关闭');
    };

    ws.onerror = (error) => {
      console.error('WebSocket发生错误:', error);
    };

    return () => {
      if (ws) ws.close();
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString()); // 更新当前时间
    }, 1000);

    return () => clearInterval(timer); // 清理定时器
  }, []);

  return (
    <div className="container">
      <h1 className="title">接收到的实时表单</h1>
      <div className="clock">
        <h2>当前时间: {currentTime}</h2> {/* 显示当前时间 */}
      </div>
      <div className="grid">
        <div className="chart">
          <h2>实时数据图表 - NodeId 1</h2>
          <Line data={chartDataNodeId1} />
        </div>
        <div className="chart">
          <h2>实时数据图表 - NodeId 2</h2>
          <Line data={chartDataNodeId2} />
        </div>
        {/* 这里可以添加更多的图表 */}
        <div className="chart">图表 3</div>
        <div className="chart">图表 4</div>
        <div className="chart">图表 5</div>
        <div className="chart">图表 6</div>
        <div className="chart">图表 7</div>
        <div className="chart">图表 8</div>
        <div className="chart">图表 9</div>
      </div>

      {/* 显示最新的十条消息 */}
      <div className="message-log">
        <h2>最新消息记录：</h2>
        <ul>
          {messageLog.map((msg, index) => (
            <li key={index} style={{ color: 'black' }}>{msg}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
