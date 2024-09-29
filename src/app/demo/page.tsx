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

const TablePage = () => {
  const router = useRouter();
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

  // 渲染最近15天的数据
  const render15DaysData = (record) => {
    const today = new Date();
    const dateArray = Array.from({ length: 15 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - i-1);
      return date.toLocaleDateString();
    }).reverse();

    return (
      <td colSpan={5}>
        <div style={{ maxHeight: '200px', overflowY: 'auto', overflowX: 'hidden', border: '1px solid #ddd', padding: '10px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>日期</th>
                <th>True</th>
                <th>False</th>
                <th>Warn</th>
                <th>Box</th>
                <th>Rate</th>
              </tr>
            </thead>
            <tbody>
              {dateArray.map((date, index) => (
                <tr key={`date-${index}`}>
                  <td>{date}</td>
                  <td>{record.last7True[index] || 0}</td>
                  <td>{record.last7False[index] || 0}</td>
                  <td>{record.last7Warn[index] || 0}</td>
                  <td>{record.last7Box[index] || 0}</td>
                  <td>{((record.last7Warn[index] / record.last7Box[index]) * 100).toFixed(2) || 0} {'%'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </td>
    );
  };

  return (
    <div>
      <h1>测力佳监控管理系统</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2', textAlign: 'center' }}>
            <th>唯一编号</th>
            <th>港口名称</th>
            <th>起重机编号</th>
            <th>实时重量</th>
            <th>重量阈值</th>
            <th>数据更新时间</th>
            <th colSpan={5}>最近15天的数据</th>
            <th>操作</th>
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
                <td>
                  <button onClick={() => console.log(`Edit ${record.id}`)}>Edit</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={12}>No data available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TablePage;
