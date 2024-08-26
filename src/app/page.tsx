'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation'
import {hex_md5} from '../../md5';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };
  
  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  // const apiUrl = 'http://42.194.238.80:8081';
  const apiUrl = 'http://127.0.0.1:8081';
  const handleLoginClick = () => {
    // 构造要传递的数据
    const data = {
      email: email,
      password: hex_md5(password)
    };

    // 执行 POST 请求
    fetch(apiUrl +'/user/login1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        credentials: 'include',
      },
      body: JSON.stringify(data)
    })
    .then(response => {
      response.headers.forEach((v,k)=>console.log(k,v))
      const setCookieHeaders = response.headers.get('Set-Cookie');
      const contentDisposition = response.headers.get('Content-Disposition');
      localStorage.setItem('token', contentDisposition ? contentDisposition : '');
  
      //const allHeaders = new Headers(response.headers).raw();
      //console.log('All Headers:', allHeaders);
      return response.json();
    })
    .then(data => {
      console.log(data);
      if(data.success==true){
        router.push('/clj');
      }else{
        setShowModal(true)
      }
    })
    .catch(error => {
      console.error('An error occurred:', error);
    });
  };
  const router = useRouter();
  const handleHistory = () => {
    handleLoginClick();
  };


  return (
    <div>
    
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
          
      <div className="z-10 max-w-5xl w-full font-mono text-sm">
      <label id="email" className="mb-2 block text-sm text-gray-700">UserName</label>
      <input
        id="email"
        type="email"
        name="email"
        placeholder="user name"
        className="w-full px-4 py-2 rounded-lg shadow-sm border border-gray-300 focus:border-blue-500"
        value={email} // 使用状态变量的值作为输入框的值
        onChange={handleEmailChange} // 设置处理输入变化的函数
      />
      <div className='p-2'></div>
      <div className='p-2'></div>
      <label id="email" className="mb-2 block text-sm text-gray-700">Password</label>
        <input
        id="password"
        type="password"
        name="password"
        placeholder="password"
        className="w-full px-4 py-2 rounded-lg shadow-sm border border-gray-300 focus:border-blue-500"
        value={password}
        onChange={handlePasswordChange}
      />
      <div className='p-5'></div>
      <button
        className="w-full px-4 py-2 rounded-lg shadow-sm flex items-center place-content-center gap-2 bg-black text-white font-normal"
        onClick={handleHistory}
      >Login</button>
      </div>
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
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
    </div>
  )
}
