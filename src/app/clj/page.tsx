'use client'
import React, { useState, ChangeEvent,useEffect } from 'react';
import { useRouter } from 'next/navigation'
interface Record {
  id: number;
  testPointId: number;
  partId: number;
  testPointName: string;
  status: number;
  updateTime: string;
  chName: string;
  up: number;
  low: number;
  flag: number;
  unit: string;
  address: string;
  alarmRule: string;
}
const apiUrl = 'http://42.194.238.80:8081';
const TablePage = () => {
  const router = useRouter();
  const [data, setData] = useState<Record[]>([]); // 存放记录的状态
  const [isEditing, setIsEditing] = useState(false); // 用于标记是否正在编辑记录
  
  const [selectedData, setSelectedData] = useState<Record | null>(null); // 存放正在编辑的记录
  const [editedData, setEditedData] = useState<Record | null>(null); // 存放正在编辑的记录

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // 在组件加载时获取数据的逻辑，你可以使用自己的 API 调用
    fetchData();
  }, []);
  const updateEditedData = (data: Partial<Record>) => {
    setEditedData((prevData) => ({ ...prevData, ...data } as Record | null));
  };

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    fetch(apiUrl+'/r21/all', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`,
      },
      credentials: 'include',
    })
    .then(response => response.json())
    .then(data => {
      if(data.success==false){
        setShowModal(true)
      }else{
        console.log(data);
        //setData(data.data)
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

  const handleEdit = (record: Record) => {
    setIsEditing(!isEditing);
    setEditedData(record);
    setSelectedData(record);
  };

  const handleSave = async () => {
    setIsEditing(!isEditing);
    console.log(editedData);
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
    console.log(editedData);
  };

  const renderTable = () => {
    return (
      <table className="table">
        <thead>
          <tr>
            <th>设备标识号</th>
            <th>设备故障信息</th>
            <th>设备作业信息</th>
            <th>设备实时信息</th>
            

          </tr>
        </thead>
        <tbody>
          {data.map((record) => (
            <tr key={record.id}>
              <td>{record.id}</td>
              <td>{record.testPointId}</td>
              <td>{record.partId}</td>
              <td>{record.testPointName}</td>
              <td>{record.status}</td>
              <td>{record.updateTime}</td>
              <td>{record.chName}</td>
              <td>{record.up}</td>
              <td>{record.low}</td>
              <td>{record.flag}</td>
              <td>{record.unit}</td>
              <td>{record.address}</td>
              <td>{record.alarmRule}</td>
              <td>
                  <button onClick={() => handleEdit(record)}>Edit</button>
              </td>
            </tr>
          ))}
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
            <th>ID</th>
            <th>Test Point ID</th>
            <th>Part ID</th>
            <th>Test Point Name</th>
            <th>Status</th>
            <th>Update Time</th>
            <th>Ch Name</th>
            <th>UP</th>
            <th>LOW</th>
            <th>Flag</th>
            <th>Unit</th>
            <th>Address</th>
            <th>Alarm Rule</th>
          </tr>
        </thead>
        <tbody>
        <tr>
              <td>{editedData?.id}</td>
              <td>{editedData?.testPointId}</td>
              <td>{editedData?.partId}</td>
              <td>{editedData?.testPointName}</td>
              <td>{editedData?.status}</td>
              <td>{editedData?.updateTime}</td>
              <td>{editedData?.chName}</td>
              <td><input type="text" value={editedData?.up} onChange={(e) =>updateEditedData({up: parseFloat(e.target.value) || 0,})}/></td>
              <td><input type="text" value={editedData?.low} onChange={(e) =>updateEditedData({low: parseFloat(e.target.value) || 0,})}/></td>
              <td><input type="text" value={editedData?.flag} onChange={(e) =>updateEditedData({flag: parseFloat(e.target.value) || 0,})}/></td>
              <td><input type="text" value={editedData?.unit} onChange={(e) =>updateEditedData({unit: e.target.value || ''})}/></td>
              <td><input type="text" value={editedData?.address} onChange={(e) =>updateEditedData({address: e.target.value || ''})}/></td>
              <td><input type="text" value={editedData?.alarmRule} onChange={(e) =>updateEditedData({alarmRule: e.target.value || ''})}/></td>
              <td><button onClick={handleSave}>Save</button></td>
            </tr>
            <tr>
              <td>{selectedData?.id}</td>
              <td>{selectedData?.testPointId}</td>
              <td>{selectedData?.partId}</td>
              <td>{selectedData?.testPointName}</td>
              <td>{selectedData?.status}</td>
              <td>{selectedData?.updateTime}</td>
              <td>{selectedData?.chName}</td>
              <td>{selectedData?.up}</td>
              <td>{selectedData?.low}</td>
              <td>{selectedData?.flag}</td>
              <td>{selectedData?.unit}</td>
              <td>{selectedData?.address}</td>
              <td>{selectedData?.alarmRule}</td>
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