'use client'
import React, { useState, ChangeEvent,useEffect } from 'react';
import { useRouter } from 'next/navigation'
interface NodeDTO {
  id: number;
  name: string;
  number: string;
  lastTrue: number;
  lastFalse: number;
  lastWarn: number;
  lastBox: number;  // 集装箱个数
  todayTrue: number;
  todayFalse: number;
  todayWarn: number;
  todayBox: number;  // 集装箱个数
  weight: number;  // 实时重量
  defaultWeight: number;  // 实时重量
  updateTime: string;  // 使用字符串来表示日期时间
}

// const apiUrl = 'http://42.194.238.80:8081';
const apiUrl = 'http://127.0.0.1:8081';
const TablePage = () => {
  const router = useRouter();
  const [data, setData] = useState<NodeDTO[]>([]); // 存放记录的状态
  const [isEditing, setIsEditing] = useState(false); // 用于标记是否正在编辑记录
  
  const [selectedData, setSelectedData] = useState<NodeDTO | null>(null); // 存放正在编辑的记录
  const [editedData, setEditedData] = useState<NodeDTO | null>(null); // 存放正在编辑的记录

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // 在组件加载时获取数据的逻辑，你可以使用自己的 API 调用
    fetchData();
  }, []);
  const updateEditedData = (data: Partial<NodeDTO>) => {
    setEditedData((prevData) => ({ ...prevData, ...data } as NodeDTO | null));
  };

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    const requestBody = {
      // Add key-value pairs as needed
      key1: "value1",
      key2: "value2",
  };
    fetch(apiUrl+'/send/queryNodeInfo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(requestBody)
    })
    .then(response => response.json())
    .then(data => {
      if(data.success==false){
        setShowModal(true)
      }else{
        console.log("发送请求，获得的数据是：" + JSON.stringify(data, null, 2));
        setData(data)
      }
      
    })
    .catch(error => {
      console.error('An error occurred:', error);
    });
    
  };
  const handleBack=()=>{
    console.log('An error occurred:');
    router.push('/');
  };

  const handleEdit = (record: NodeDTO) => {
    setIsEditing(!isEditing);
    setEditedData(record);
    setSelectedData(record);
  };

  const handleSave = async () => {
    setIsEditing(!isEditing);
    console.log("处理保存，正在编辑的数据是："+editedData);
    // 编辑数据后，保存数据的逻辑，你可以使用自己的 API 调用
    try {
      const response = await fetch(apiUrl+'/r21/'+editedData?.id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedData),
      });
      if (response.ok) {
        // 保存成功后更新数据
        fetchData();
        setIsEditing(false);
        setEditedData(null);
      } else {
        console.error('Error saving data:', response.statusText);
      }
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };
  const handleCancel = async () => {
    setIsEditing(!isEditing);
    console.log("处理取消，正在编辑的数据是："+editedData);
  };

  const renderTable = () => {
    return (
      <table className="table">
        <thead>
          <tr>
            <th>唯一编号|</th>
            <th>港口名称|</th>
            <th>起重机编号|</th>
            <th>昨日正常事件次数|</th>
            <th>昨日异常事件次数|</th>
            <th>昨日报警事件次数|</th>
            <th>昨日起重箱数量|</th>
            <th>今日正常事件次数|</th>
            <th>今日异常事件次数|</th>
            <th>今日报警事件次数|</th>
            <th>今日起重箱数量|</th>
            <th>实时重量|</th>
            <th>重量阈值|</th>
            <th>数据更新时间|</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {data && data.length > 0 ? data.map((record) => (
            <tr key={record.id}>
              <td>{record.id}</td>
              <td>{record.name}</td>
              <td>{record.number}</td>
              <td>{record.lastTrue}</td>
              <td>{record.lastFalse}</td>
              <td>{record.lastWarn}</td>
              <td>{record.lastBox}</td>
              <td>{record.todayTrue}</td>
              <td>{record.todayFalse}</td>
              <td>{record.todayWarn}</td>
              <td>{record.todayBox}</td>
              <td>{record.weight}</td>
              <td>{record.defaultWeight}</td>
              <td>{record.updateTime}</td>
              <td>
                <button onClick={() => handleEdit(record)}>Edit</button>
              </td>
            </tr>
          )) : (
            <tr>
              <td>No data available</td>
            </tr>
          )}
        </tbody>
      </table>
    );
  };

  return (
    <div>
      <h1>测力佳监控管理系统</h1>
      {showModal && (
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowModal(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="bg-white rounded-lg p-4 max-w-sm mx-auto relative z-10">
              <p className="text-center text-red-500 mb-4">Login failed! Please try again.</p>
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-full"
                onClick={() => {handleBack()}}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {isEditing ? (
          <div>
            <table className="table">
              <thead>
                <tr>
                  <th>唯一编号|</th>
                  <th>港口名称|</th>
                  <th>起重机编号|</th>
                  <th>昨日正常事件次数|</th>
                  <th>昨日异常事件次数|</th>
                  <th>昨日报警事件次数|</th>
                  <th>昨日起重箱数量|</th>
                  <th>今日正常事件次数|</th>
                  <th>今日异常事件次数|</th>
                  <th>今日报警事件次数|</th>
                  <th>今日起重箱数量|</th>
                  <th>实时重量|</th>
                  <th>重量阈值|</th>
                  <th>数据更新时间|</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{editedData?.id}</td>
                  <td>{editedData?.name}</td>
                  <td>{editedData?.number}</td>
                  <td>{editedData?.lastTrue}</td>
                  <td>{editedData?.lastFalse}</td>
                  <td>{editedData?.lastWarn}</td>
                  {/* <td><input type="text" value={editedData?.lastBox} onChange={(e) => updateEditedData({ lastBox: parseInt(e.target.value) || 0 })} /></td> */}
                  <td>{editedData?.lastBox}</td>
                  <td>{editedData?.todayTrue} </td>
                  <td>{editedData?.todayFalse} </td>
                  <td>{editedData?.todayWarn}</td>
                  <td>{editedData?.todayBox} </td>
                  <td>{editedData?.weight}</td>
                  <td><input type="text" value={editedData?.defaultWeight} onChange={(e) => updateEditedData({ defaultWeight: parseFloat(e.target.value) || 0 })} /></td>
                  <td>{editedData?.updateTime}</td>
                  <td><button onClick={handleSave}>Save</button></td>
                </tr>
                <tr>
                  <td>{selectedData?.id}</td>
                  <td>{selectedData?.name}</td>
                  <td>{selectedData?.number}</td>
                  <td>{selectedData?.lastTrue}</td>
                  <td>{selectedData?.lastFalse}</td>
                  <td>{selectedData?.lastWarn}</td>
                  <td>{selectedData?.lastBox}</td>
                  <td>{selectedData?.todayTrue}</td>
                  <td>{selectedData?.todayFalse}</td>
                  <td>{selectedData?.todayWarn}</td>
                  <td>{selectedData?.todayBox}</td>
                  <td>{selectedData?.weight}</td>
                  <td>{selectedData?.defaultWeight}</td>
                  <td>{selectedData?.updateTime}</td>
                  <td><button onClick={handleCancel}>Cancel</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
        renderTable()
      )}
    </div>
  );
};
export default TablePage;