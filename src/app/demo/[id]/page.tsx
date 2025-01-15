'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale , ChartOptions} from 'chart.js';
// Register all necessary elements from Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
// const aPI='http://192.168.46.190:8081';
const apiIp = process.env.API_IP;
const apiPort = process.env.API_PORT;
const aPI=`http://${apiIp}:${apiPort}`;
const RecordDetailPage = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const [data, setData] = useState<any>([]);
  const [name, setName] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(false); // Changed to false initially
  const [error, setError] = useState<string | null>(null);
  const [beginTime, setBeginTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [queryTriggered, setQueryTriggered] = useState<boolean>(false); // State to track if query is triggered
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const router = useRouter();

  const goBack = () => {
    router.back(); // 返回到上一页
  };

  // Helper function to get the date for "n" days ago in YYYY-MM-DD format
  const getDateNDaysAgo = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
  };

  // Set the default date range to the last 7 days on initial render
  useEffect(() => {
    const defaultBeginTime = getDateNDaysAgo(7); // 7 days ago
    const defaultEndTime = getDateNDaysAgo(0); // Today
    fetchName();
    setBeginTime(defaultBeginTime);
    setEndTime(defaultEndTime);
    setIsInitialized(true);
  }, []);
  // useEffect(() => {
  //   if (isInitialized && beginTime && endTime) {
  //     fetchData();
  //   }
  // }, [isInitialized, beginTime, endTime]);

  const fetchName = async () => {
    try {
      const response = await fetch(aPI+'/query/queryRecordName', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: id
        }),
      });

      const result = await response.json();
      console.log("工控机info :",result);
      if (result.success) {
        setName(result.data);
      } else {
        setError('数据加载失败');
      }
    } catch (error) {
      setError('请求错误');
    }
  };

  // Function to group records by date
  const groupDataByDay = (data: any[]) => {
    if (!Array.isArray(data)) {
      console.error("Invalid data format:", data);
      return {}; // 返回空的分组对象
    }
    const grouped: { [key: string]: any[] } = {};
    data.forEach((record) => {
      const date = new Date(record.time).toLocaleDateString(); // Format as YYYY-MM-DD
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(record);
    });
    console.log("分组后的数据: ",grouped)
    return grouped;
  };

  // Generate time labels for the chart
  const generateTimeLabels = (startTime: string, length: number, interval: number): string[] => {
    const startDate = new Date(startTime);
    const timeLabels: string[] = [];
    for (let i = 0; i < length; i++) {
      const newTime = new Date(startDate.getTime() + i * interval);
      timeLabels.push(newTime.toLocaleString());
    }
    return timeLabels;
  };

  // Fetch data when the query button is clicked
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setQueryTriggered(true);
    try {
      const response = await fetch(aPI+'/query/queryHistoryRecord', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: id,
          beginTime: beginTime,
          endTime: endTime,
        }),
      });

      const result = await response.json();
      console.log("查询到的历史报警数据: ",result);
      if (result.success) {
        setData(result.data);
      } else {
        setError('数据加载失败');
      }
    } catch (error) {
      setError('请求错误');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  // Group the data by date
  const groupedData = groupDataByDay(data);
  const headingStyle: React.CSSProperties = {
    textAlign: 'left',  // Centers the text horizontally
    fontSize: '25px',      // Enlarges the text (this can stay as a string with 'em')
    // marginTop: 50         // Numeric value is okay for marginTop
  };

  const inputStyle = {
    marginLeft: '10px',
    padding: '8px 12px',      // Adds padding for better size control
    fontSize: '1em',          // Adjust font size
    border: '2px solid #ccc', // Border style
    borderRadius: '5px',      // Rounded corners
    backgroundColor: '#2C3E50', // Background color for inputs
    outline: 'none',          // Removes outline on focus (you can add your own if needed)
  };

  return (
    <div>
      <h1 style={headingStyle}>
        {/* {id}- */}
      {name} 历史报警详情
    </h1>

      {/* Date Range Filter */}
      <div style={{ marginBottom: '20px' }}>
        <label>
          最早查询日期:
          <input
            type="date"
            value={beginTime}
            onChange={(e) => setBeginTime(e.target.value)}
            style={inputStyle}
          />
        </label>
        
        <label>
          最晚查询日期:
          <input
            type="date"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            style={inputStyle}
          />
        </label>
        <button
          onClick={fetchData}
          style={{
            marginLeft: '10px',
            padding: '5px 10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          查询
        </button>
        <button
          onClick={goBack}
          style={{
            marginLeft: '10px',
            padding: '5px 10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          返回
        </button>
      </div>

      {/* Render charts for each grouped date */}
      {Object.keys(groupedData).length === 0 && queryTriggered && <p>该时间段内没有找到符合条件的数据</p>}
      {Object.keys(groupedData).length === 0 && !queryTriggered && <p>加载完毕，请点击进行查询</p>}
      {Object.keys(groupedData).length !== 0 && <p>查询结果: 该时间段内共查询到{data.length}条数据</p>}
      <div><h1>&nbsp;</h1> </div>
      {Object.keys(groupedData).map((date) => {
        const records = groupedData[date];
        return (
          <div key={date} style={{ marginBottom: '30px', width: '100%' }}>
            <h2>{`报警日期: ${date} ，当天共发生${groupedData[date].length}次报警`}</h2>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'flex-start', // 子元素靠左对齐
                gap: '10px',
              }}
            >
              {records.map((record: any, index: number) => {
                const { weight2, motorspeed2, time, length } = record;
                const timeLabels = generateTimeLabels(time, length, 200);
                const chartData = {
                  labels: timeLabels,
                  datasets: [
                    {
                      label: 'Weight2',
                      data: weight2,
                      fill: false,
                      borderColor: 'rgba(75,192,192,1)',
                      tension: 0.1,
                      yAxisID: 'y1', // Using the primary Y-axis
                      pointRadius: 0,
                    },
                    {
                      label: 'Motorspeed2',
                      data: motorspeed2,
                      fill: false,
                      borderColor: 'rgba(255,99,132,1)',
                      tension: 0.1,
                      yAxisID: 'y2', // Using the secondary Y-axis
                      pointRadius: 0,
                    },
                  ],
                };
        
                const chartOptions: ChartOptions = {
                  responsive: true,
                  plugins: {
                    title: {
                      display: true,
                      text: `点位个数: ${motorspeed2.length}`,
                    },
                    tooltip: {
                      mode: 'index' as 'index', // Correct tooltip mode
                      intersect: false,
                    },
                  },
                  scales: {
                    y1: {
                      type: 'linear', // Ensure this is 'linear', not 'radialLinear'
                      position: 'left',
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Weight2', // Label for the primary Y-axis
                      },
                    },
                    y2: {
                      type: 'linear', // Ensure this is 'linear', not 'radialLinear'
                      position: 'right',
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Motorspeed2', // Label for the secondary Y-axis
                      },
                      grid: {
                        drawOnChartArea: false, // Optionally hide grid lines for the secondary axis
                      },
                    },
                  },
                };
        
                return (
                  <div
                    key={index}
                    style={{
                      width: '30%', // 设置每个图表的宽度
                      marginBottom: '20px', // 添加底部间距
                      boxSizing: 'border-box', // 包括 padding 和边框在宽度计算内
                    }}
                  >
                    <Line data={chartData} options={chartOptions} />
                  </div>
                );
              })}
            </div>
          </div>
        );
        
      })}
    </div>
  );
};

export default RecordDetailPage;
