import React, { useRef, useState } from 'react';
import { Layout, Button, Input, Radio, Row, Col, InputNumber, Modal } from 'antd';
import CopyToClipboard from '@/components/CopyToClipboard';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { Header, Content, Sider } = Layout;

export default function NewbieTraining() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [activeVideo, setActiveVideo] = useState(1);
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});
  const [selectedStatus, setSelectedStatus] = useState<number>(1);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSubmitModalVisible, setIsSubmitModalVisible] = useState(false);

  // 视频控制函数
  const handleFullScreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const handleSpeedChange = (change: number) => {
    if (videoRef.current) {
      // 获取视频当前的播放速度
      const currentRate = videoRef.current.playbackRate;
      // 计算新的播放速度，并限制在合理范围内
      const newRate = Math.max(0.25, Math.min(2, currentRate + change));
      videoRef.current.playbackRate = newRate;
      setPlaybackRate(newRate);
    }
  };

  // 监听视频播放速度变化
  React.useEffect(() => {
    const video = videoRef.current;
    const handleRateChange = () => {
      if (video) {
        setPlaybackRate(video.playbackRate);
      }
    };

    if (video) {
      video.addEventListener('ratechange', handleRateChange);
    }

    return () => {
      if (video) {
        video.removeEventListener('ratechange', handleRateChange);
      }
    };
  }, []);

  // 键盘事件处理
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key.toUpperCase()) {
        case 'ENTER':
          // 处理提交逻辑
          break;
        case 'W':
          handleSpeedChange(-0.25);
          break;
        case 'S':
          handlePlayPause();
          break;
        case 'E':
          handleSpeedChange(0.25);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [playbackRate]);

  // 视频切换处理函数
  const handleVideoSwitch = (videoNum: number) => {
    setActiveVideo(videoNum);
    // 切换视频时重置播放速度
    setPlaybackRate(1);
    // 如果视频正在播放，重新开始播放新视频
    if (videoRef.current && !videoRef.current.paused) {
      videoRef.current.play();
    }
  };

  // 处理数量变化的函数
  const handleQuantityChange = (index: number, change: number) => {
    setQuantities((prev) => ({
      ...prev,
      [index]: Math.max(0, (prev[index] || 0) + change),
    }));
  };

  return (
    <>
      <div className="mb-4 text-xl font-medium pl-4 pr-8 py-4 bg-white">
        <div className="flex items-center justify-between">
          <div className="text-xl font-medium font-bold">新手训练</div>
          <Button className="text-sm rounded-md px-2 py-1" onClick={() => setIsModalVisible(true)}>
            答题概况
          </Button>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {/* 左侧区域 (3份) */}
        <Col xs={24} sm={24} md={14} lg={14} xl={14}>
          <Sider width="100%" style={{ background: '#fff' }}>
            {/* 顶部控制栏 */}
            <Header
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 16px',
                borderBottom: '1px solid #e8e8e8',
                background: '#fff',
                height: 'auto',
                minHeight: '64px',
              }}
            >
              <div className="flex xl:flex-row flex-col justify-between w-full">
                {/* 左侧视频切换和信息 */}
                <div className="flex items-center gap-2 text-sm">
                  <div
                    className={`cursor-pointer ${
                      activeVideo === 1 ? 'text-blue-500' : 'text-gray-500'
                    }`}
                    onClick={() => handleVideoSwitch(1)}
                    style={{ padding: '8px', cursor: 'pointer' }}
                  >
                    视频一
                  </div>
                  <div
                    className={`cursor-pointer ${
                      activeVideo === 2 ? 'text-blue-500' : 'text-gray-500'
                    }`}
                    onClick={() => handleVideoSwitch(2)}
                    style={{ padding: '8px', cursor: 'pointer' }}
                  >
                    视频二
                  </div>
                  <div className="text-gray-500 text-md">预计到达466单</div>
                  <div
                    className="text-xs rounded-md px-2 py-1"
                    style={{
                      backgroundColor: '#f6ffed',
                      color: 'green',
                      border: '1px solid green',
                    }}
                  >
                    正常运单
                  </div>
                </div>

                {/* 右侧按钮组 */}
                <div className="flex gap-2 text-sm">
                  <div className="sm:flex flex-col sm:flex-row gap-2 text-sm">
                    <div className="flex gap-2">
                      <Button onClick={handleFullScreen} className="px-1 py-1 text-sm">
                        全屏
                      </Button>
                      <Button
                        className="px-1 py-1 text-sm text-white rounded-md"
                        style={{ backgroundColor: '#1890ff' }}
                        onClick={() => setIsSubmitModalVisible(true)}
                      >
                        提交(ENTER)
                      </Button>
                      <Button
                        onClick={() => handleSpeedChange(-0.25)}
                        className="px-1 py-1 text-sm"
                      >
                        减速(W)
                      </Button>
                    </div>
                    <div className="flex gap-2 mt-2 sm:mt-0">
                      <Button onClick={handlePlayPause} className="px-1 py-1 text-sm">
                        暂停/播放(S)
                      </Button>
                      <Button onClick={() => handleSpeedChange(0.25)} className="px-1 py-1 text-sm">
                        加速(E)
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Header>

            {/* 左侧视频区域 */}
            <Content style={{ padding: '16px' }}>
              <div className="relative bg-black aspect-video">
                <video
                  ref={videoRef}
                  className="w-full h-full"
                  controls
                  key={activeVideo} // 添加 key 属性确保视频切换时完全重新渲染
                >
                  <source
                    src={
                      activeVideo === 1
                        ? 'https://video.cabinet-rgshb.hetuntech.cn/orderLibrary/20241111647899019275681792_0.mp4'
                        : 'https://video.cabinet-rgshb.hetuntech.cn/orderLibrary/20241111647906093401382912_0.mp4'
                    }
                    type="video/mp4"
                  />
                </video>
                <div className="absolute top-2 right-2 text-white">{playbackRate.toFixed(1)}x</div>
              </div>

              {/* 视频下方的选项 */}
              <div className="flex gap-4 mt-4">
                <Radio.Group
                  name="videoStatus"
                  className="xl:space-x-4 space-y-4 xl:space-y-0"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <Radio value={1}>无异常(1)</Radio>
                  <Radio value={2}>非友好操作(2)</Radio>
                  <Radio value={3}>识别异常(3)</Radio>
                  <Radio value={4}>视频错误、画面丢失(4)</Radio>
                </Radio.Group>
              </div>

              <hr />

              {/* 只在选择"无异常"时显示商品列表 */}
              {selectedStatus === 1 && (
                <div>
                  {Object.entries(quantities).map(
                    ([index, quantity]) =>
                      quantity > 0 && (
                        <div key={index} className="flex items-center justify-between p-2 border-b">
                          <div className="flex-1">
                            <div className="text-sm">爱彼依_爱彼依椰蓉奶酪味面包90G_90毫升</div>
                          </div>
                          <div className="flex items-center gap-4">
                            <InputNumber
                              value={quantity}
                              onChange={(value) => {
                                const newValue = value ?? 0;
                                const change = newValue - quantity;
                                handleQuantityChange(Number(index), change);
                              }}
                              min={0}
                              className="w-16"
                            />
                            <div
                              onClick={() => handleQuantityChange(Number(index), -quantity)}
                              className="text-blue-500 hover:text-blue-700 cursor-pointer"
                            >
                              删除
                            </div>
                          </div>
                        </div>
                      ),
                  )}
                </div>
              )}
            </Content>
          </Sider>
        </Col>

        {/* 右侧区域 (2份) */}
        <Col xs={24} sm={24} md={10} lg={10} xl={10}>
          <Layout style={{ background: '#f0f2f5' }}>
            <Content style={{ padding: '0px' }}>
              {/* 添加顶部订单号和搜索框 */}
              <div className="bg-white p-4 rounded-md">
                <div className="flex xl:flex-row flex-col xl:justify-between xl:items-center mb-4 xl:space-x-4 space-y-4 xl:space-y-0">
                  <div className="flex items-center space-x-1">
                    <span>202411116479064851622174720</span>
                    <CopyToClipboard text="202411116479064851622174720" />
                  </div>
                  <div className="flex items-center">
                    <Input
                      type="text"
                      placeholder="请输入商品名称"
                      className="border rounded px-4 py-1 mr-2 w-48"
                    />
                    <span className="text-gray-600 text-xs">商品搜索</span>
                  </div>
                </div>

                {/* 商品网格 */}
                <div className="grid grid-cols-4 gap-4 divide-x divide-y divide-gray-200 border border-gray-200">
                  {Array(12)
                    .fill(0)
                    .map((_, index) => (
                      <div key={index} className="flex flex-col items-center p-2 relative">
                        <div
                          className="text-xs text-center mt-1 text-gray-600 truncate w-full"
                          title="爱彼依_爱彼依椰蓉奶酪味面包90G_90毫升"
                          style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          爱彼依_爱彼依椰蓉奶酪味面包90G_90毫升
                        </div>
                        <img
                          src="https://image.op-api.hetuntech.cn/resources/1470756546412577/bce6826ca8611079b72dd4273d042f0e.png"
                          alt="商品图片"
                          className="w-full aspect-square object-contain cursor-pointer"
                          onClick={() => handleQuantityChange(index, 1)}
                        />
                        {/* 数量控制器 */}
                        {quantities[index] > 0 && selectedStatus === 1 && (
                          <>
                            <hr />
                            <div className="flex items-center justify-between w-full">
                              <div
                                className={`text-lg font-bold flex items-center justify-center ${
                                  selectedStatus === 1
                                    ? 'text-blue-500 cursor-pointer'
                                    : 'text-gray-300 cursor-not-allowed'
                                }`}
                                onClick={() =>
                                  selectedStatus === 1 && handleQuantityChange(index, -1)
                                }
                              >
                                -
                              </div>
                              <span className="text-sm">{quantities[index] || 0}</span>
                              <div
                                className={`text-lg font-bold flex items-center justify-center ${
                                  selectedStatus === 1
                                    ? 'text-blue-500 cursor-pointer'
                                    : 'text-gray-300 cursor-not-allowed'
                                }`}
                                onClick={() =>
                                  selectedStatus === 1 && handleQuantityChange(index, 1)
                                }
                              >
                                +
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </Content>
          </Layout>
        </Col>
      </Row>

      {/* 答题概况 Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <ExclamationCircleOutlined style={{ color: '#1890ff' }} />
            <span>答题概况</span>
          </div>
        }
        open={isModalVisible}
        closable={false}
        footer={
          <Button type="primary" onClick={() => setIsModalVisible(false)}>
            知道了
          </Button>
        }
        width={800}
      >
        <div className="p-4">
          <div className="grid grid-cols-4 gap-4">
            {[
              { id: '202411116479060934013829', status: 'correct' },
              { id: '202411116479040331760394', status: 'wrong' },
              { id: '202411116477466053443624', status: 'pending' },
              { id: '202411116478993430971760', status: 'correct' },
              { id: '202411116478993430971765', status: 'wrong' },
              // ... 更多订单号
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-1 text-xs">
                <span
                  style={{
                    color:
                      item.status === 'correct'
                        ? 'green'
                        : item.status === 'wrong'
                        ? 'red'
                        : 'gray',
                  }}
                >
                  ●
                </span>
                <span className="text-gray-600 hover:text-blue-500 cursor-pointer truncate">
                  {item.id}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* 提交 Modal */}
      <Modal
        title={
          selectedStatus === 1 ? (
            <span>确认提交</span>
          ) : (
            <div className="flex items-center gap-2">
              <ExclamationCircleOutlined style={{ color: '#faad14' }} />
              <span>确认标记订单为异常吗？</span>
            </div>
          )
        }
        open={isSubmitModalVisible}
        closable={false}
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setIsSubmitModalVisible(false)}>取消</Button>
            <Button
              type="primary"
              onClick={() => {
                // 处理提交逻辑
                setIsSubmitModalVisible(false);
              }}
            >
              确认
            </Button>
          </div>
        }
        width={500}
      >
        {selectedStatus === 1 ? (
          // 显示选择的商品信息
          <div className="space-y-4">
            {Object.entries(quantities).map(
              ([index, quantity]) =>
                quantity > 0 && (
                  <div key={index} className="flex justify-between items-center">
                    <div className="text-sm">爱彼依_爱彼依椰蓉奶酪味面包90G_90毫升</div>
                    <div className="text-sm">X{quantity}</div>
                  </div>
                ),
            )}
          </div>
        ) : null}
      </Modal>
    </>
  );
}
