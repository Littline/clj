'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const apiUrl = 'http://127.0.0.1:8081';
// const apiUrl = 'http://42.194.238.80:8081';

interface NodeDTO {
  id: number;
  name: string;
  number: string;
  weight: number;
  defaultWeight: number;
  updateTime: string;
  last7True: number[];
  last7False: number[];
  last7Warn: number[];
  last7Box: number[];
}

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

// 渲染最近15天的数据
const render15DaysData = (record) => {
  const today = new Date();
  const dateArray = Array.from({ length: 15 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - i - 1);
    return date.toLocaleDateString();
  });

  // 计算加和
  const sumTrue = record.last7True.reduce((acc, val) => acc + val, 0);
  const sumFalse = record.last7False.reduce((acc, val) => acc + val, 0);
  const sumWarn = record.last7Warn.reduce((acc, val) => acc + val, 0);
  const sumBox = record.last7Box.reduce((acc, val) => acc + val, 0);

  return (
    <td colSpan={5}>
      <div style={{ maxHeight: '200px', overflowY: 'auto', overflowX: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>日期</th>
              <th>运行次数</th>
              <th>报警</th>
              <th>故障</th>
              <th>箱量</th>
              <th>误报率</th>
            </tr>
          </thead>
          <tbody>
            {/* 将合计行移至顶部 */}
            <tr>
              <td>合计</td>
              <td>{sumTrue}</td>
              <td>{sumFalse}</td>
              <td>{sumWarn}</td>
              <td>{sumBox}</td>
              <td>
                {
                isNaN(sumWarn) || isNaN(sumBox) || !isFinite((sumWarn / sumBox) * 100)
                  ? 0
                  : ((sumWarn / sumBox) * 100).toFixed(2)
                } %
              </td>
            </tr>

            {dateArray.map((date, index) => (
              <tr key={`date-${index}`}>
                <td>{date}</td>
                <td>{record.last7True[index] || 0}</td>
                <td>{record.last7False[index] || 0}</td>
                <td>{record.last7Warn[index] || 0}</td>
                <td>{record.last7Box[index] || 0}</td>
                <td>
                  {
                    isNaN(record.last7Warn[index]) || isNaN(record.last7Box[index]) || !isFinite((record.last7Warn[index] / record.last7Box[index]) * 100)
                      ? 0
                      : ((record.last7Warn[index] / record.last7Box[index]) * 100).toFixed(2)
                  } %
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </td>
  );
};

const renderCombinedChart = (record) => {
  const today = new Date();
  const dateArray = Array.from({ length: 15 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - i - 1);
    return date.toLocaleDateString();
  }).reverse();

  // 数据用于图表
  const chartData = {
    labels: dateArray,
    datasets: [
      {
        label: '运行次数',
        data: record.last7True,
        borderColor: 'rgb(75, 192, 192)',
        fill: false,
      },
      {
        label: '报警',
        data: record.last7False,
        borderColor: 'rgb(255, 99, 132)',
        fill: false,
      },
      {
        label: '故障',
        data: record.last7Warn,
        borderColor: 'rgb(54, 162, 235)',
        fill: false,
      },
      {
        label: '箱量',
        data: record.last7Box,
        borderColor: 'rgb(153, 102, 255)',
        fill: false,
      }
    ]
  };

  return (
    <td colSpan={5}>
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        <Line data={chartData} />
      </div>
    </td>
  );
};

const TablePage = () => {
  const [data, setData] = useState<NodeDTO[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    fetch(apiUrl + '/send/queryNodeInfoWeek', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`,
      },
      credentials: 'include',
      body: JSON.stringify({ key1: "value1", key2: "value2" })
    })
      .then(response => response.json())
      .then(data => setData(data))
      .catch(error => console.error('An error occurred:', error));
  };

  return (
    <div>
      <h1>测力佳监控管理系统</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr
            style={{
              backgroundColor: '#333',
              textAlign: 'center',
              color: '#fff',
              fontSize: '18px',
              padding: '10px',
              height: '50px',
              borderBottom: '2px solid #ddd',
            }}
          >
            <th>唯一编号</th>
            <th>港口名称</th>
            <th>起重机编号</th>
            <th>实时重量</th>
            <th>重量阈值</th>
            <th>数据更新时间</th>
            <th colSpan={5}>最近15天的数据</th>
            <th colSpan={5}>趋势图</th>
          </tr>
        </thead>
        <tbody>
          {data && data.length > 0 ? (
            data.map((record) => (
              <tr key={record.id} style={{ textAlign: 'center', borderBottom: '1px solid #ddd' }}>
                <td>{record.id}</td>
                <td>{record.name}</td>
                <td>{record.number}</td>
                <td>{record.weight}</td>
                <td>{record.defaultWeight}</td>
                <td>{new Date(record.updateTime).toLocaleString()}</td>
                {render15DaysData(record)}
                {renderCombinedChart(record)}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={13}>No data available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TablePage;
