import React from 'react';
import { Layout, Button, Radio, Input } from 'antd';
import { IoCopyOutline } from 'react-icons/io5';

const { Header, Content, Sider } = Layout;

export default function NewbieTraining() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout>
        <Sider width="60%" style={{ background: '#fff' }}>
          {/* 顶部控制栏 */}
          <Header
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0 16px',
              borderBottom: '1px solid #e8e8e8',
              background: '#fff',
            }}
          >
            <div className="text-blue-500">视频一</div>
            <div className="text-gray-500">视频二</div>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between' }}>
              <div>预计到达466单</div>
              <div className="flex items-center gap-2">
                <Button type="primary" className="px-3 py-1">
                  正常运单
                </Button>
                <Button className="px-3 py-1">全屏</Button>
                <Button className="px-3 py-1">提交(ENTER)</Button>
                <Button className="px-3 py-1">减速(W)</Button>
                <Button className="px-3 py-1">暂停/播放(S)</Button>
                <Button className="px-3 py-1">加速(E)</Button>
              </div>
            </div>
          </Header>

          {/* 左侧视频区域 */}
          <Content style={{ padding: '16px' }}>
            <div className="relative bg-black aspect-video">
              <video className="w-full h-full" controls>
                <source src="video_url" type="video/mp4" />
              </video>
              <div className="absolute top-2 left-2 text-white">2024-11-11 11:01:12</div>
              <div className="absolute top-2 right-2 text-white">1.0x</div>
            </div>

            {/* 视频下方的选项 */}
            <div className="flex gap-4 mt-4">
              <Radio.Group name="videoStatus">
                <Radio value={1}>无异常(1)</Radio>
                <Radio value={2}>非友好操作(2)</Radio>
                <Radio value={3}>识别异常(3)</Radio>
                <Radio value={4}>视频错误、画面丢失(4)</Radio>
              </Radio.Group>
            </div>
          </Content>
        </Sider>

        {/* 右侧商品列表 */}
        <Layout style={{ width: '40%', background: '#f0f2f5' }}>
          <Content style={{ padding: '16px' }}>
            {/* 添加顶部订单号和搜索框 */}
            <div className="flex justify-between items-center mb-4 space-x-4">
              <div className="flex items-center space-x-1">
                <span>202411116479064851622174720</span>
                <IoCopyOutline />
              </div>
              <div className="flex items-center">
                <Input
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
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}
