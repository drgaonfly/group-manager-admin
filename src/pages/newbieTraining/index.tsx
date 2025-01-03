import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Layout, Button, Input, Radio, Row, Col, InputNumber, Modal, message } from 'antd';
import CopyToClipboard from '@/components/CopyToClipboard';
import {
  ExclamationCircleOutlined,
  QuestionCircleOutlined,
  PlayCircleOutlined,
  TrophyOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { queryList, addItem } from '@/services/ant-design-pro/api';
import { history } from '@umijs/max';

const { Header, Content, Sider } = Layout;

// 定义 answer 的类型
interface Answer {
  id: string;
  skuName: string;
  brandName: string | null;
  spec: string | null;
  image: string;
  category?: number;
}

export default function NewbieTraining() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [activeVideo, setActiveVideo] = useState(1);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [selectedStatus, setSelectedStatus] = useState<number>(1);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSubmitModalVisible, setIsSubmitModalVisible] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [video1, setVideo1] = useState<string>('');
  const [video2, setVideo2] = useState<string>('');
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [topicId, setTopicId] = useState<string>('');
  // const [expectedCount, setExpectedCount] = useState<number>();
  const [issue, setIssue] = useState<string>();
  const [topicNumber, setTopicNumber] = useState<string>('');

  // 获取新手训练数据
  const fetchNewbieTraining = async () => {
    try {
      const response = await queryList('/records/newbie-training', {
        current: 1,
        pageSize: 10,
      });

      if (response && 'data' in response) {
        const { data } = response as any;
        const currentTopic = data.currentTopic;
        const answers = data.answers;

        // 分别设置各个状态
        setTopicId(currentTopic._id);
        setVideo1(currentTopic.video1 || '');
        setVideo2(currentTopic.video2 || '');
        // setExpectedCount(currentTopic.expectedCount);
        setTopicNumber(currentTopic.topicNumber || '');
        setIssue(currentTopic.issue);
        setAnswers(
          answers.map((answer: any) => ({
            id: answer.id,
            skuName: answer.skuName,
            brandName: answer.brandName,
            spec: answer.spec,
            image: answer.image,
            category: 1,
          })),
        );
      }
    } catch (error) {
      console.error('获取数据失败:', error);
    }
  };

  // 添加提交函数
  const handleSubmit = async () => {
    try {
      if (!topicId) {
        message.error('题目ID不存在');
        return;
      }

      let submitData = {
        issue: 'No Issue',
        answers: [] as Array<{ id: string; quantity: number }>,
      };

      // 如果不是"无异常"状态，设置对应的issue
      if (selectedStatus !== 1) {
        const issueMap = {
          2: 'Unfriendly Operation',
          3: 'Recognition Error',
          4: 'Video Error',
        };
        submitData.issue = issueMap[selectedStatus as keyof typeof issueMap] || 'No Issue';
      } else {
        // 如果是"无异常"状态，收集所有数量大于0的商品
        submitData.answers = Object.entries(quantities)
          .filter(([, quantity]) => quantity > 0)
          .map(([id, quantity]) => ({
            id,
            quantity,
          }));
      }

      // 使用 addItem 发送 POST 请求
      const response = await addItem(`/records/submit-newbie-training/${topicId}`, submitData);

      if (response?.success) {
        message.success('提交成功');
        setIsSubmitModalVisible(false);

        // 重置状态
        setQuantities({});
        setSelectedStatus(1);

        // 获取新题目数据
        await fetchNewbieTraining();

        // // 使用返回的记录ID获取记录详情
        // if (response.data?.recordId) {
        //   const recordResponse = await queryList(`/records/${response.data.recordId}`);
        //   if (recordResponse?.success) {
        //     setAnswerHistory([{
        //       topicNumber: recordResponse.data.topic?.topicNumber || '',
        //       status: recordResponse.data.status || 'pending',
        //       createdAt: recordResponse.data.createdAt || '',
        //     }, ...answerHistory]);
        //   }
        // }
      } else {
        message.error(response?.message || '提交失败');
      }
    } catch (error) {
      console.error('提交失败:', error);
      message.error('提交失败，请重试');
    }
  };

  // 在组件加载时获取数据
  useEffect(() => {
    const initPage = async () => {
      await fetchNewbieTraining();
      // 获取数据后尝试播放视频
      if (videoRef.current) {
        videoRef.current.muted = true;
        videoRef.current.playbackRate = playbackRate;
        try {
          await videoRef.current.play();
          console.log('初始视频自动播放成功');
        } catch (error) {
          console.warn('初始视频自动播放失败:', error);
        }
      }
    };

    initPage();
  }, []); // 仅在组件挂载时执行

  // 当视频源改变时自动播放
  useEffect(() => {
    if (videoRef.current && (video1 || video2)) {
      videoRef.current.muted = true;
      videoRef.current.playbackRate = playbackRate;

      const playVideo = async () => {
        try {
          await videoRef.current?.play();
          console.log('视频切换后自动播放成功');
        } catch (error) {
          console.warn('视频切换后自动播放失败:', error);
          // 如果播放失败，确保视频是静音的并重试
          if (videoRef.current) {
            videoRef.current.muted = true;
            videoRef.current.play();
          }
        }
      };

      playVideo();
    }
  }, [activeVideo, video1, video2, playbackRate]); // 当视频源或播放速率改变时重新触发

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
  useEffect(() => {
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
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.log('切换视频后自动播放失败:', error);
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.play();
        }
      });
    }
  };

  // 处理数量变化的函数
  const handleQuantityChange = (uniqueIndex: string, change: number) => {
    setQuantities((prev) => ({
      ...prev,
      [uniqueIndex]: Math.max(0, (prev[uniqueIndex] || 0) + change),
    }));
  };

  const filteredProducts = useMemo(() => {
    if (!answers) return [];

    return answers.filter(
      (product) =>
        product.skuName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        (product.brandName &&
          product.brandName.toLowerCase().includes(searchKeyword.toLowerCase())),
    );
  }, [searchKeyword, answers]);

  // 获取所有不重复的分类
  const categories = useMemo(() => {
    if (!answers) return [];
    return [...new Set(answers.map((product) => product.category))].sort();
  }, [answers]);

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

      <Row gutter={[5, 5]}>
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
                    onClick={() => video1 && handleVideoSwitch(1)}
                    style={{
                      padding: '8px',
                      cursor: video1 ? 'pointer' : 'not-allowed',
                      opacity: video1 ? 1 : 0.5,
                    }}
                  >
                    视频一{!video1 && '(无)'}
                  </div>
                  <div
                    className={`cursor-pointer ${
                      activeVideo === 2 ? 'text-blue-500' : 'text-gray-500'
                    }`}
                    onClick={() => video2 && handleVideoSwitch(2)}
                    style={{
                      padding: '8px',
                      cursor: video2 ? 'pointer' : 'not-allowed',
                      opacity: video2 ? 1 : 0.5,
                    }}
                  >
                    视频二{!video2 && '(无)'}
                  </div>
                  {/* <div className="text-gray-500 text-md">
                    {expectedCount ? `预计到达${expectedCount}单` : ''}
                  </div> */}
                  {issue && <div className="text-gray-500 text-md">问题：{issue}</div>}
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
                  autoPlay
                  key={activeVideo === 1 ? video1 : video2}
                >
                  <source src={activeVideo === 1 ? video1 : video2} type="video/mp4" />
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
                            <div className="text-sm">
                              {(() => {
                                const product = answers.find((p: any) => p.id === index);
                                return product
                                  ? `${product.brandName} ${product.skuName} ${product.spec}`
                                  : '';
                              })()}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <InputNumber
                              value={quantity}
                              onChange={(value) => {
                                const newValue = value ?? 0;
                                const change = newValue - quantity;
                                handleQuantityChange(index, change);
                              }}
                              min={0}
                              className="w-16"
                            />
                            <div
                              onClick={() => handleQuantityChange(index, -quantity)}
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
                    <span>{topicNumber}</span>
                    <CopyToClipboard text={topicNumber} />
                  </div>
                  <div className="flex items-center">
                    <Input
                      type="text"
                      placeholder="请输入商品名称"
                      className="border rounded px-4 py-1 mr-2 w-48"
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                    />
                    <span className="text-gray-600 text-xs">商品搜索</span>
                  </div>
                </div>

                {/* 动态渲染分类和商品 */}
                {categories.map((category) => (
                  <React.Fragment key={category}>
                    <div className="flex">
                      {/* 左侧分类号 */}
                      <div className="flex items-center text-sm font-medium mr-4">
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                          {category}
                        </div>
                      </div>
                      {/* 右侧商品网格 */}
                      <div className="flex-1">
                        <div className="grid grid-cols-4">
                          {filteredProducts
                            .filter((product) => product.category === category)
                            .map((product) => {
                              const uniqueIndex = product.id;
                              return (
                                <div
                                  key={uniqueIndex}
                                  className="flex flex-col items-center p-2 relative"
                                  style={{
                                    border: '1px solid #e8e8e8',
                                    borderRadius: '0px',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                  }}
                                >
                                  <div
                                    className="text-xs text-center mt-1 text-gray-600 truncate w-full"
                                    title={`${product.brandName} ${product.skuName} ${product.spec}`}
                                  >
                                    {product.skuName}
                                  </div>
                                  <img
                                    src={product.image}
                                    alt="商品图片"
                                    className="w-full aspect-square object-contain"
                                    style={{
                                      cursor: selectedStatus === 1 ? 'pointer' : 'not-allowed',
                                    }}
                                    onClick={() =>
                                      selectedStatus === 1 && handleQuantityChange(uniqueIndex, 1)
                                    }
                                  />
                                  {/* 数量控制器 */}
                                  {quantities[uniqueIndex] > 0 && selectedStatus === 1 && (
                                    <div className="flex items-center justify-between w-full">
                                      <div
                                        className="text-lg font-bold flex items-center justify-center text-blue-500 cursor-pointer"
                                        onClick={() =>
                                          selectedStatus === 1 &&
                                          handleQuantityChange(uniqueIndex, -1)
                                        }
                                      >
                                        -
                                      </div>
                                      <span className="text-sm">
                                        {quantities[uniqueIndex] || 0}
                                      </span>
                                      <div
                                        className="text-lg font-bold flex items-center justify-center text-blue-500 cursor-pointer"
                                        onClick={() =>
                                          selectedStatus === 1 &&
                                          handleQuantityChange(uniqueIndex, 1)
                                        }
                                      >
                                        +
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    </div>
                    {categories.indexOf(category) !== categories.length - 1 && (
                      <div className="border-t border-gray-200 my-4" />
                    )}
                  </React.Fragment>
                ))}
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
            {answers.map((item: any, index: any) => (
              <div key={index} className="flex items-center gap-1 text-xs">
                <span
                  style={{
                    color:
                      item.status === 'success' ? 'green' : item.status === 'fail' ? 'red' : 'gray',
                  }}
                >
                  ●
                </span>
                <span className="text-gray-600 hover:text-blue-500 cursor-pointer truncate">
                  {item.topicNumber}
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
            <Button type="primary" onClick={handleSubmit}>
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
                    <div className="text-sm">
                      {(() => {
                        // 获取商品信息
                        const product = answers.find((p: any) => p.id === index);
                        return product
                          ? `${product.brandName} ${product.skuName} ${product.spec}`
                          : '';
                      })()}
                    </div>
                    <div className="text-sm">X{quantity}</div>
                  </div>
                ),
            )}
          </div>
        ) : null}
      </Modal>

      {/* 移动端底部导航栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden">
        <div className="grid grid-cols-4 py-2">
          <div
            className="flex flex-col items-center cursor-pointer"
            onClick={() => history.push('/guide')}
          >
            <QuestionCircleOutlined className="text-xl" />
            <span className="text-xs mt-1">使用说明</span>
          </div>
          <div
            className="flex flex-col items-center cursor-pointer"
            onClick={() => history.push('/newbie-training')}
          >
            <PlayCircleOutlined className="text-xl" />
            <span className="text-xs mt-1">测试</span>
          </div>
          <div
            className="flex flex-col items-center cursor-pointer"
            onClick={() => history.push('/exam')}
          >
            <TrophyOutlined className="text-xl" />
            <span className="text-xs mt-1">考场</span>
          </div>
          <div
            className="flex flex-col items-center cursor-pointer"
            onClick={() => history.push('/withdraw')}
          >
            <WalletOutlined className="text-xl" />
            <span className="text-xs mt-1">提现</span>
          </div>
        </div>
      </div>
    </>
  );
}
