'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Modal from 'react-modal';
const apiIp = process.env.API_IP;
const apiPort = process.env.API_PORT;

const apiUrl = `http://${apiIp}:${apiPort}`;
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
              <th>报警率</th>
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
                isNaN(sumFalse) || isNaN(sumBox) || !isFinite((sumFalse / sumBox) * 100)
                  ? 0
                  : ((sumFalse / sumBox) * 100).toFixed(2)
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
                    isNaN(record.last7False[index]) || isNaN(record.last7Box[index]) || !isFinite((record.last7False[index] / record.last7Box[index]) * 100)
                      ? 0
                      : ((record.last7False[index] / record.last7Box[index]) * 100).toFixed(2)
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);//退出登录弹窗

  useEffect(() => {
    fetchData();
  }, []);
  //get online data
  const fetchData = async () => {
    const token = localStorage.getItem('contentDisposition');
    const account = localStorage.getItem('userAccount');
    fetch(apiUrl + '/send/queryNodeInfoWeekToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`,
      },
      credentials: 'include',
      body: JSON.stringify({ account: account, token: token })
    })
      .then(response => response.json())
      .then(//data => setData(data)
        data => {
          console.log(data);
          if(data.success==false){
            setShowModal(true)
          }else{
            console.log(data);
            setData(data.data)
          }
          
        })
      .catch(error => console.error('An error occurred:', error));
  };

  //get offline data
  const openModal = async () => {
    const token = localStorage.getItem('contentDisposition');
    const account = localStorage.getItem('userAccount');
    try {
      const response = await fetch(apiUrl + '/query/queryOfflineNode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ token: token,account:account }) // 根据需要传递参数
      });

      // 检查响应是否成功
      if (response.ok) {
        const data = await response.json();
        setModalData(data); // 设置弹出框数据
        setIsModalOpen(true); // 打开弹出框
      } else {
        console.error('请求失败:', response.statusText);
      }
    } catch (error) {
      console.error('请求发生错误:', error);
    }
  };
  const closeModal = () => {
    setIsModalOpen(false); // 关闭弹出框
    setModalData(null);
  };
  const router = useRouter();

  const handleBack = () => {
    // 实现退出登录逻辑（如清除用户信息、token 等）
    console.log('退出登录');
    localStorage.clear()
    router.push('/'); // 跳转到首页
  };
  const handleOnlineRowClick = (record: NodeDTO) => {
    // 跳转到新的页面，假设目标路由为 /demo/[id]
    router.push(`/demo/${record.id}`);
  };
  const handleOfflineRowClick = (id: string) => {
    // 跳转到新的页面，假设目标路由为 /demo/[id]
    router.push(`/demo/${id}`);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <h1 style={{ flex: 1, textAlign: 'center', fontSize: '30px', margin: 0 }}>测力佳监控管理系统</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => openModal()} 
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#555', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '5px', 
              cursor: 'pointer' 
            }}
          >
            查看离线工控机列表
          </button>
          <button 
            onClick={handleBack} // 绑定退出登录逻辑
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#f44336', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '5px', 
              cursor: 'pointer' 
            }}
          >
            退出登录
          </button>
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowModal(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="bg-white rounded-lg p-4 max-w-sm mx-auto relative z-10">
              <p className="text-center text-red-500 mb-4">尚未登录，请登录.</p>
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-full"
                onClick={() => {handleBack()}}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
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
                <td><strong
                  onClick={() => handleOnlineRowClick(record)}
                  style={{ cursor: 'pointer' }}>{record.id}</strong></td>
                <td><strong
                  onClick={() => handleOnlineRowClick(record)}
                  style={{ cursor: 'pointer' }}>{record.name}</strong></td>
                <td>{record.number}</td>
                <td>{record.weight}</td>
                <td>{record.defaultWeight}</td>
                <td>{new Date(new Date(record.updateTime).setHours(new Date(record.updateTime).getHours() - 8)).toLocaleString()}</td>
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
      {/* 弹出框组件 */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="详细信息"
        style={{
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)', // 背景黑色，带透明度
          },
          content: {
            maxWidth: '600px',
            margin: 'auto',
            padding: '20px',
            borderRadius: '10px',
            backgroundColor: '#333', // 黑色背景
            color: '#fff', // 白色文字
          }
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>离线工控机列表</h1>
          <button onClick={closeModal}>关闭弹窗</button>
        </div>
        
        
        {modalData ? (
           <div>
           {modalData.map((item: { id: number; name: string; number: string }) => (
             <div key={item.id}>
               <p><strong onClick={() => handleOfflineRowClick(item.id.toString())}
               style={{ cursor: 'pointer' }}>{item.id}: {item.name}-{item.number}</strong></p>
             </div>
           ))}
         </div>
        ) : (
          <p>加载中...</p>
        )}
        
      </Modal>
      
      
    </div>
  );
};

export default TablePage;
