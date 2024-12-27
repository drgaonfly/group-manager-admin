import React from 'react';
import { IoCopyOutline } from 'react-icons/io5';

export default function NewbieTraining() {
  return (
    <div className="flex space-x-4 h-screen bg-[#f0f2f5] py-8 px-2">
      {/* 左侧区域 */}
      <div className="w-3/5 flex flex-col bg-white">
        {/* 顶部控制栏 */}
        <div className="flex items-center gap-4 p-2 border-b">
          <div className="text-blue-500">视频一</div>
          <div className="text-gray-500">视频二</div>
          <div className="flex-1 flex items-center justify-between">
            <div>预计到达466单</div>
            <div className="flex items-center gap-2">
              <button type="button" className="px-3 py-1 bg-green-500 text-white rounded">
                正常运单
              </button>
              <button type="button" className="px-3 py-1 border rounded">
                全屏
              </button>
              <button type="button" className="px-3 py-1 border rounded">
                提交(ENTER)
              </button>
              <button type="button" className="px-3 py-1 border rounded">
                减速(W)
              </button>
              <button type="button" className="px-3 py-1 border rounded">
                暂停/播放(S)
              </button>
              <button type="button" className="px-3 py-1 border rounded">
                加速(E)
              </button>
            </div>
          </div>
        </div>

        {/* 左侧视频区域 */}
        <div className="p-4">
          <div className="relative bg-black aspect-video">
            <video className="w-full h-full" controls>
              <source src="video_url" type="video/mp4" />
            </video>
            <div className="absolute top-2 left-2 text-white">2024-11-11 11:01:12</div>
            <div className="absolute top-2 right-2 text-white">1.0x</div>
          </div>

          {/* 视频下方的选项 */}
          <div className="flex gap-4 mt-4">
            <label className="flex items-center">
              <input type="radio" name="videoStatus" />
              <span className="ml-2">无异常(1)</span>
            </label>
            <label className="flex items-center">
              <input type="radio" name="videoStatus" />
              <span className="ml-2">非友好操作(2)</span>
            </label>
            <label className="flex items-center">
              <input type="radio" name="videoStatus" />
              <span className="ml-2">识别异常(3)</span>
            </label>
            <label className="flex items-center">
              <input type="radio" name="videoStatus" />
              <span className="ml-2">视频错误、画面丢失(4)</span>
            </label>
          </div>
        </div>
      </div>

      {/* 右侧商品列表 */}
      <div className="w-2/5 p-4 overflow-y-auto bg-white custom-scrollbar space-y-8">
        {/* 添加顶部订单号和搜索框 */}
        <div className="flex justify-between items-center mb-4 space-x-4">
          <div className="flex items-center space-x-1">
            {/* 订单号 */}
            <span>202411116479064851622174720</span>
            <IoCopyOutline />
          </div>
          {/* 搜索框 */}
          <div className="flex items-center">
            <input
              type="text"
              placeholder="请输入商品名称"
              className="border rounded px-3 py-1 mr-1"
            />
            <span className="text-gray-600 text-sm">商品搜索</span>
          </div>
        </div>

        {/* 商品网格 */}
        <div className="grid grid-cols-4 gap-4 divide-x divide-y divide-gray-200 border border-gray-200">
          {Array(12)
            .fill(0)
            .map((_, index) => (
              <div key={index} className="flex flex-col items-center p-2">
                <img
                  src="product_image_url"
                  alt="商品图片"
                  className="w-full aspect-square object-contain"
                />
                <div className="text-sm text-center mt-1 text-gray-600">商品名称</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
