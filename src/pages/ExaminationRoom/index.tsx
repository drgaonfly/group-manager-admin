import React, { useState, useEffect, useMemo } from 'react';
import {
  Layout,
  Button,
  Input,
  Radio,
  Row,
  Col,
  InputNumber,
  Modal,
  message,
  Progress,
  FloatButton,
} from 'antd';
import CopyToClipboard from '@/components/CopyToClipboard';
import { ExclamationCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { queryList, addItem } from '@/services/ant-design-pro/api';
import { useModel } from '@umijs/max';
import VideoPlayer from './components/VideoPlayer';
import Begin from './components/Begin';
import Overlay from './components/Overlayer';

const { Content, Sider } = Layout;

// 定义 answer 的类型
interface Answer {
  id: string;
  skuName: string;
  brandName: string | null;
  spec: string | null;
  image: string;
  rowNumber?: number;
}

// 定义枚举值
const ISSUE_TYPES = {
  NO_ISSUE: 'No Issue',
  UNFRIENDLY_OPERATION: 'Unfriendly Operation',
  RECOGNITION_ERROR: 'Recognition Error',
  VIDEO_ERROR: 'Video Error',
} as const;

export default function Examination() {
  const [hasStarted, setHasStarted] = useState(false);
  // 修改状态类型
  const [selectedStatus, setSelectedStatus] = useState<string>(ISSUE_TYPES.NO_ISSUE);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSubmitModalVisible, setIsSubmitModalVisible] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [video1, setVideo1] = useState<string>('');
  const [video2, setVideo2] = useState<string>('');
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [topicId, setTopicId] = useState<string>('');
  const [issue, setIssue] = useState<string>();

  const [id, setId] = useState<string>('');
  const [answerCounts, setAnswerCounts] = useState<Record<string, number>>({});
  const [allTopics, setAllTopics] = useState<
    Array<{
      topic: { id: string };
      status: string;
    }>
  >([]);

  const [submitLoading, setSubmitLoading] = useState(false);
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};

  // 添加状态控制预览
  const [previewImage, setPreviewImage] = useState<string>('');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [onlineVisible, setOnlineVisible] = useState<boolean>(currentUser!.isOnline);

  // 获取接单数据
  const fetchExamination = async (resetProgress?: boolean) => {
    try {
      const response = await queryList('/records/exam', {
        emptyRecordFlag: resetProgress ? 'true' : 'false', // 添加重置标志
      });

      if (response && 'data' in response) {
        const { data } = response as any;
        const currentExamTopic = data.currentExamTopic;
        const answers = data.answers;
        const examTopics = data.examTopics;
        const isAllCompleted = data.isAllCompleted;
        const isOnline = data.isOnline;

        if (isOnline) {
          setOnlineVisible(true);
        } else {
          setOnlineVisible(false);
        }
        // 设置所有题目信息
        setAllTopics(examTopics);

        // 如果有当前题目，设置相关状态
        if (currentExamTopic) {
          setTopicId(currentExamTopic._id);
          setVideo1(currentExamTopic.video1 || '');
          setVideo2(currentExamTopic.video2 || '');
          setId(currentExamTopic.id || '');
          setIssue(currentExamTopic.issue);
          setAnswers(answers);
        } else if (isAllCompleted) {
          // 如果没有当前题目且所有题目已完成
          setTopicId('');
          setVideo1('');
          setVideo2('');
          setId('');
          setIssue('');
          setAnswers([]);

          // 显示完成提示
          message.success('所有题目已完成！');
        }
      }
    } catch (error) {
      console.error('获取数据失败:', error);
      throw error;
    }
  };

  // 重置接单数据
  const handleStart = async (resetProgress?: boolean) => {
    try {
      await fetchExamination(resetProgress);
      setHasStarted(true);
    } catch (error) {
      console.error('获取接单数据失败:', error);
      message.error('获取接单数据失败，请重试');
    }
  };

  // 添加提交函数
  const handleSubmit = async () => {
    if (submitLoading) return; // 如果正在提交，直接返回

    setSubmitLoading(true);
    try {
      if (!topicId) {
        message.error('题目ID不存在');
        return;
      }

      let submitData = {
        issue: selectedStatus, // 直接使用枚举值
        answers: [] as Array<{ id: string; count: number }>,
      };

      if (selectedStatus !== ISSUE_TYPES.NO_ISSUE) {
        const issueMap = {
          UNFRIENDLY_OPERATION: 'Unfriendly Operation',
          RECOGNITION_ERROR: 'Recognition Error',
          VIDEO_ERROR: 'Video Error',
        };
        submitData.issue = issueMap[selectedStatus as keyof typeof issueMap] || 'No Issue';
      } else {
        submitData.answers = Object.entries(answerCounts)
          .filter(([, count]) => count > 0)
          .map(([id, count]) => ({
            id,
            count,
          }));
      }

      const response = await addItem(`/records/submit-exam/${topicId}`, submitData);

      if (response?.success) {
        // 根据返回的 record 状态显示不同的提示
        if (response.data.record.status === 'success') {
          message.success('答题正确！');
        } else {
          message.error('答题错误，请继续努力！');
        }

        setIsSubmitModalVisible(false);
        setAnswerCounts({});
        setSelectedStatus(ISSUE_TYPES.NO_ISSUE);

        // 重新获取数据
        await fetchExamination();
      }
    } catch (error) {
      console.error('提交失败:', error);
      message.error('提交失败，请重试');
    } finally {
      setSubmitLoading(false);
    }
  };

  // 在组件加载时获取数据
  useEffect(() => {
    const initPage = async () => {
      await fetchExamination();
    };

    initPage();
  }, []); // 仅在组件挂载时执行

  // 键盘事件处理 - 只保留 ENTER 键的处理
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key.toUpperCase() === 'ENTER') {
        // 处理提交逻辑
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // 处理数量变化的函数
  const handleQuantityChange = (uniqueIndex: string, change: number) => {
    setAnswerCounts((prev) => ({
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
    return [...new Set(answers.map((product) => product.rowNumber))].sort();
  }, [answers]);

  // 在组件内添加计算进度的函数
  const calculateProgress = useMemo(() => {
    if (!allTopics || allTopics.length === 0) return 0;

    const completedTopics = allTopics.filter(
      (topic) => topic.status === 'success' || topic.status === 'fail',
    );

    return Math.round((completedTopics.length / allTopics.length) * 100);
  }, [allTopics]);

  if (!onlineVisible) {
    return <Overlay />;
  }

  return (
    <>
      {!hasStarted ? (
        <Begin onStart={handleStart} />
      ) : (
        <>
          <div className="mb-4 text-xl font-medium pl-4 pr-8 py-4 bg-white">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="text-xl font-medium font-bold">接单</div>
              <div className="flex items-center gap-2" style={{ marginLeft: '8px' }}>
                <div
                  className="flex items-center gap-2"
                  style={{ width: window.innerWidth >= 640 ? '300px' : '150px' }}
                >
                  <Progress
                    percent={calculateProgress}
                    size="small"
                    format={(percent) => `${percent}%`}
                    strokeColor={{
                      '0%': '#108ee9',
                      '100%': '#87d068',
                    }}
                  />
                </div>
                <Button
                  className="text-sm rounded-md px-2 py-1"
                  onClick={() => setIsModalVisible(true)}
                >
                  答题概况
                </Button>
              </div>
            </div>
          </div>

          <Row gutter={[5, 5]}>
            {/* 左侧区域 (3份) */}
            <Col xs={24} sm={24} md={14} lg={14} xl={14}>
              <Sider width="100%" style={{ background: '#fff', padding: '10px' }}>
                <VideoPlayer
                  video1={video1}
                  video2={video2}
                  issue={issue}
                  onSubmit={() => setIsSubmitModalVisible(true)}
                  remainingCount={allTopics.filter((topic) => topic.status === 'pending').length}
                />

                {/* 视频下方的选项和提交按钮 */}
                <div className="flex justify-between items-center mt-4">
                  <Radio.Group
                    name="videoStatus"
                    className="xl:space-x-4 space-y-4 xl:space-y-0"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <Radio value={ISSUE_TYPES.NO_ISSUE}>无异常</Radio>
                    <Radio value={ISSUE_TYPES.UNFRIENDLY_OPERATION}>非友好操作</Radio>
                    <Radio value={ISSUE_TYPES.RECOGNITION_ERROR}>识别异常</Radio>
                    <Radio value={ISSUE_TYPES.VIDEO_ERROR}>视频错误、画面丢失</Radio>
                  </Radio.Group>
                </div>

                <hr className="my-4" />

                {/* 只在选择"无异常"时显示商品列表 */}
                {selectedStatus === ISSUE_TYPES.NO_ISSUE && (
                  <div>
                    {Object.entries(answerCounts).map(
                      ([index, count]) =>
                        count > 0 && (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 border-b"
                          >
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
                                value={count}
                                onChange={(value) => {
                                  const newValue = value ?? 0;
                                  const change = newValue - count;
                                  handleQuantityChange(index, change);
                                }}
                                min={0}
                                className="w-16"
                              />
                              <div
                                onClick={() => handleQuantityChange(index, -count)}
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
                        <span>{id}</span>
                        <CopyToClipboard text={id} />
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
                    <div
                      className="overflow-y-auto"
                      style={{
                        height: window.innerWidth >= 768 ? 'calc(90vh - 200px)' : 'auto',
                      }}
                    >
                      {categories.map((category: any) => (
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
                              <div className="grid sm:grid-cols-4 grid-cols-3">
                                {filteredProducts
                                  .filter((product) => product.rowNumber === category)
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
                                        <div className="relative">
                                          <img
                                            src={product.image}
                                            alt="商品图片"
                                            className="w-full aspect-square object-contain"
                                            style={{
                                              cursor:
                                                selectedStatus === ISSUE_TYPES.NO_ISSUE
                                                  ? 'pointer'
                                                  : 'not-allowed',
                                            }}
                                            onClick={() => {
                                              if (selectedStatus === ISSUE_TYPES.NO_ISSUE) {
                                                handleQuantityChange(uniqueIndex, 1);
                                              }
                                            }}
                                          />
                                          <div
                                            className="absolute top-0 left-2 rounded-full cursor-pointer hover:bg-white"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setPreviewImage(product.image);
                                              setPreviewVisible(true);
                                            }}
                                          >
                                            <EyeOutlined className="text-gray-600 text-sm" />
                                          </div>
                                        </div>
                                        {/* 数量控制器 */}
                                        {answerCounts[uniqueIndex] > 0 &&
                                          selectedStatus === ISSUE_TYPES.NO_ISSUE && (
                                            <div className="flex items-center justify-between w-full">
                                              <div
                                                className="text-lg font-bold flex items-center justify-center text-blue-500 cursor-pointer"
                                                onClick={() =>
                                                  selectedStatus === ISSUE_TYPES.NO_ISSUE &&
                                                  handleQuantityChange(uniqueIndex, -1)
                                                }
                                              >
                                                -
                                              </div>
                                              <span className="text-sm">
                                                {answerCounts[uniqueIndex] || 0}
                                              </span>
                                              <div
                                                className="text-lg font-bold flex items-center justify-center text-blue-500 cursor-pointer"
                                                onClick={() =>
                                                  selectedStatus === ISSUE_TYPES.NO_ISSUE &&
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
                {allTopics.map((item, index) => (
                  <div key={index} className="flex items-center gap-1 text-xs">
                    <span
                      style={{
                        color:
                          item.status === 'success'
                            ? '#6ec283'
                            : item.status === 'fail'
                            ? 'red'
                            : item.status === 'doing'
                            ? '#1890ff'
                            : 'gray',
                      }}
                    >
                      ●
                    </span>
                    <span className="text-gray-600 hover:text-blue-500 cursor-pointer truncate">
                      {item.topic.id}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Modal>

          {/* 提交 Modal */}
          <Modal
            title={
              selectedStatus === ISSUE_TYPES.NO_ISSUE ? (
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
                  onClick={handleSubmit}
                  loading={submitLoading}
                  disabled={submitLoading}
                >
                  {submitLoading ? '提交中...' : '确认'}
                </Button>
              </div>
            }
            width={500}
          >
            {selectedStatus === ISSUE_TYPES.NO_ISSUE ? (
              // 显示选择的商品信息
              <div className="space-y-4">
                {Object.entries(answerCounts).map(
                  ([index, count]) =>
                    count > 0 && (
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
                        <div className="text-sm">X{count}</div>
                      </div>
                    ),
                )}
              </div>
            ) : null}
          </Modal>

          {/* 添加预览 Modal */}
          <Modal
            open={previewVisible}
            footer={null}
            onCancel={() => setPreviewVisible(false)}
            width={800}
            centered
          >
            <img alt="预览图片" style={{ width: '100%' }} src={previewImage} />
          </Modal>

          {/* 添加悬浮提交按钮 */}
          <FloatButton
            onClick={() => setIsSubmitModalVisible(true)}
            type="primary"
            style={{ right: 24, padding: '4px', borderRadius: '50%', bottom: '10%' }}
            icon={<span className="flex text-sm">提交</span>}
          />
        </>
      )}
    </>
  );
}
