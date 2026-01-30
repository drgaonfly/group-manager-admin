import {
  Modal,
  Tabs,
  Table,
  Button,
  Space,
  Tag,
  Switch,
  message,
  Popconfirm,
  Card,
  Row,
  Col,
  Divider,
  Form,
  InputNumber,
} from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useState, useEffect, useMemo, useRef } from 'react';
import { queryList, updateItem, removeItem } from '@/services/ant-design-pro/api';
import { useIntl } from '@umijs/max';
import { EditableProTable, ProColumns } from '@ant-design/pro-components';
import KeyboardEditor, { KeyboardEditorRef } from './KeyboardEditor';
import GroupWelcomeForm from './GroupWelcomeForm';

interface BotConfigManagerProps {
  open: boolean;
  onCancel: (visible: boolean) => void;
  currentRow: any;
  currentUser: any;
  onOpenGroupMessageForm?: () => void;
  onOpenChannelPostForm?: () => void;
  onOpenReplyRuleForm?: () => void;
  onEditGroupMessage?: (record: any) => void;
  onEditChannelPost?: (record: any) => void;
  onEditReplyRule?: (record: any) => void;
  refreshKey?: number;
  onBotUpdate?: (values: any) => Promise<void>;
}

// 验证答案类型
type VerifyAsk = {
  _id: string;
  name: string;
  isCorrect: boolean;
};

const BotConfigManager: React.FC<BotConfigManagerProps> = ({
  open,
  onCancel,
  currentRow,
  currentUser,
  onOpenGroupMessageForm,
  onOpenChannelPostForm,
  onOpenReplyRuleForm,
  onEditGroupMessage,
  onEditChannelPost,
  onEditReplyRule,
  refreshKey,
  onBotUpdate,
}) => {
  const intl = useIntl();
  const [activeTab, setActiveTab] = useState('overview');
  const [groupMessages, setGroupMessages] = useState<any[]>([]);
  const [channelPosts, setChannelPosts] = useState<any[]>([]);
  const [replyRules, setReplyRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [botConfig, setBotConfig] = useState<any>({});

  // 群欢迎表单状态
  const [groupWelcomeFormOpen, setGroupWelcomeFormOpen] = useState(false);

  // 群验证配置状态
  const [verifyQuestion, setVerifyQuestion] = useState('');
  const [verifyAsks, setVerifyAsks] = useState<VerifyAsk[]>([]);
  const [verifySaving, setVerifySaving] = useState(false);

  // 发言统计配置状态
  const [minSpeechLength, setMinSpeechLength] = useState(1);
  const [allowPureNumberSpeech, setAllowPureNumberSpeech] = useState(true);
  const [speechSaving, setSpeechSaving] = useState(false);

  // 键盘配置状态
  const keyboardEditorRef = useRef<KeyboardEditorRef>(null);
  const [keyboardSaving, setKeyboardSaving] = useState(false);

  // 获取群发消息列表
  const fetchGroupMessages = async () => {
    if (!currentRow?._id) return;
    try {
      const response = await queryList(
        '/group-messages',
        { current: 1, pageSize: 100, botId: currentRow._id },
        {},
        {},
      );
      if (response?.data) {
        setGroupMessages(response.data);
      }
    } catch (error) {
      console.error('获取群发消息失败:', error);
    }
  };

  // 获取频道推广列表
  const fetchChannelPosts = async () => {
    if (!currentRow?._id) return;
    try {
      const response = await queryList(
        '/channel-posts',
        { current: 1, pageSize: 100, botId: currentRow._id },
        {},
        {},
      );
      if (response?.data) {
        setChannelPosts(response.data);
      }
    } catch (error) {
      console.error('获取频道推广失败:', error);
    }
  };

  // 获取回复规则列表
  const fetchReplyRules = async () => {
    if (!currentRow?._id) return;
    try {
      const response = await queryList(
        '/reply-rules',
        { current: 1, pageSize: 100, botId: currentRow._id },
        {},
        {},
      );
      if (response?.data) {
        setReplyRules(response.data);
      }
    } catch (error) {
      console.error('获取回复规则失败:', error);
    }
  };

  // 加载所有数据
  const loadAllData = async () => {
    if (!currentRow?._id) return;
    setLoading(true);
    await Promise.all([fetchGroupMessages(), fetchChannelPosts(), fetchReplyRules()]);
    setLoading(false);
  };

  useEffect(() => {
    if (open && currentRow?._id) {
      setActiveTab('overview');
      setBotConfig({
        canGroupMessaging: currentRow.canGroupMessaging,
        canOpenChannelPost: currentRow.canOpenChannelPost,
        canReplyRule: currentRow.canReplyRule,
        canFreeKeyboard: currentRow.canFreeKeyboard,
        canGroupWelcome: currentRow.canGroupWelcome,
        canGroupVerify: currentRow.canGroupVerify,
        canSpeechStatic: currentRow.canSpeechStatic,
        canBidirectional: currentRow.canBidirectional,
        canReportMemberNameUpdated: currentRow.canReportMemberNameUpdated,
      });

      // 初始化群验证配置
      if (currentRow.groupVerify) {
        setVerifyQuestion(currentRow.groupVerify.question || '');
        setVerifyAsks(
          (currentRow.groupVerify.asks || []).map((item: any, index: number) => ({
            _id: item._id || `${Date.now()}-${index}`,
            name: item.name || '',
            isCorrect: item.isCorrect || false,
          })),
        );
      } else {
        setVerifyQuestion('');
        setVerifyAsks([]);
      }

      // 初始化发言统计配置
      setMinSpeechLength(currentRow.minSpeechLength || 1);
      setAllowPureNumberSpeech(currentRow.allowPureNumberSpeech ?? true);

      loadAllData();
    }
  }, [open, currentRow]);

  useEffect(() => {
    if (open && refreshKey && currentRow?._id) {
      loadAllData();
    }
  }, [refreshKey]);

  // 删除群发消息
  const handleDeleteGroupMessage = async (id: string) => {
    try {
      await removeItem('/group-messages', { ids: [id] });
      message.success('删除成功');
      fetchGroupMessages();
    } catch (error: any) {
      message.error(error?.response?.data?.message ?? '删除失败');
    }
  };

  // 更新群发消息状态
  const handleGroupMessageStatusChange = async (record: any, isOnline: boolean) => {
    try {
      await updateItem(`/group-messages/${record._id}`, { isOnline });
      message.success('状态更新成功');
      fetchGroupMessages();
    } catch (error: any) {
      message.error(error?.response?.data?.message ?? '更新失败');
    }
  };

  // 删除频道推广
  const handleDeleteChannelPost = async (id: string) => {
    try {
      await removeItem('/channel-posts', { ids: [id] });
      message.success('删除成功');
      fetchChannelPosts();
    } catch (error: any) {
      message.error(error?.response?.data?.message ?? '删除失败');
    }
  };

  // 更新频道推广状态
  const handleChannelPostStatusChange = async (record: any, isOnline: boolean) => {
    try {
      await updateItem(`/channel-posts/${record._id}`, { isOnline });
      message.success('状态更新成功');
      fetchChannelPosts();
    } catch (error: any) {
      message.error(error?.response?.data?.message ?? '更新失败');
    }
  };

  // 删除回复规则
  const handleDeleteReplyRule = async (id: string) => {
    try {
      await removeItem('/reply-rules', { ids: [id] });
      message.success('删除成功');
      fetchReplyRules();
    } catch (error: any) {
      message.error(error?.response?.data?.message ?? '删除失败');
    }
  };

  // 更新回复规则状态
  const handleReplyRuleStatusChange = async (record: any, isOnline: boolean) => {
    try {
      await updateItem(`/reply-rules/${record._id}`, { isOnline });
      message.success('状态更新成功');
      fetchReplyRules();
    } catch (error: any) {
      message.error(error?.response?.data?.message ?? '更新失败');
    }
  };

  // 格式化间隔时间
  const formatInterval = (val: number) => {
    if (!val) return '-';
    if (val >= 10080) return `${val / 10080}周`;
    if (val >= 60) return `${val / 60}小时`;
    return `${val}分钟`;
  };

  // 格式化时间窗口
  const formatTimeWindow = (record: any) => {
    if (record.startAt || record.endAt) {
      const start = record.startAt
        ? new Date(record.startAt).toLocaleString('zh-CN', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })
        : '--';
      const end = record.endAt
        ? new Date(record.endAt).toLocaleString('zh-CN', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })
        : '--';
      return `${start} ~ ${end}`;
    }
    return '-';
  };

  // 群发消息列
  const groupMessageColumns = [
    {
      title: '群组',
      dataIndex: 'groups',
      width: 120,
      render: (groups: any[]) => groups?.map((g) => g?.title).join(', ') || '-',
    },
    {
      title: '内容',
      dataIndex: 'content',
      width: 200,
      ellipsis: true,
      render: (text: string) => (
        <div
          style={{ maxWidth: 200 }}
          dangerouslySetInnerHTML={{ __html: text || '-' }}
          title={text?.replace(/<[^>]+>/g, '') || ''}
        />
      ),
    },
    {
      title: '间隔',
      dataIndex: 'intervalTime',
      width: 80,
      render: formatInterval,
    },
    {
      title: '时间窗口',
      width: 150,
      render: (_: any, record: any) => formatTimeWindow(record),
    },
    {
      title: '状态',
      dataIndex: 'isOnline',
      width: 90,
      render: (_: any, record: any) => (
        <Switch
          checkedChildren="启用"
          unCheckedChildren="禁用"
          checked={record.isOnline}
          onChange={(checked) => handleGroupMessageStatusChange(record, checked)}
        />
      ),
    },
    {
      title: '操作',
      width: 100,
      render: (_: any, record: any) => (
        <Space size={0}>
          {onEditGroupMessage && (
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEditGroupMessage(record)}
            />
          )}
          <Popconfirm title="确定删除？" onConfirm={() => handleDeleteGroupMessage(record._id)}>
            <Button type="link" danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 频道推广列
  const channelPostColumns = [
    {
      title: '频道',
      dataIndex: 'channels',
      width: 120,
      render: (channels: any[]) => channels?.map((c) => c?.title).join(', ') || '-',
    },
    {
      title: '内容',
      dataIndex: 'content',
      width: 200,
      ellipsis: true,
      render: (text: string) => (
        <div
          style={{ maxWidth: 200 }}
          dangerouslySetInnerHTML={{ __html: text || '-' }}
          title={text?.replace(/<[^>]+>/g, '') || ''}
        />
      ),
    },
    {
      title: '间隔',
      dataIndex: 'interval',
      width: 80,
      render: formatInterval,
    },
    {
      title: '时间窗口',
      width: 150,
      render: (_: any, record: any) => formatTimeWindow(record),
    },
    {
      title: '清除上条',
      dataIndex: 'isClearLastPost',
      width: 80,
      render: (val: boolean) => (val ? <Tag color="orange">是</Tag> : <Tag>否</Tag>),
    },
    {
      title: '状态',
      dataIndex: 'isOnline',
      width: 90,
      render: (_: any, record: any) => (
        <Switch
          checkedChildren="启用"
          unCheckedChildren="禁用"
          checked={record.isOnline}
          onChange={(checked) => handleChannelPostStatusChange(record, checked)}
        />
      ),
    },
    {
      title: '操作',
      width: 100,
      render: (_: any, record: any) => (
        <Space size={0}>
          {onEditChannelPost && (
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEditChannelPost(record)}
            />
          )}
          <Popconfirm title="确定删除？" onConfirm={() => handleDeleteChannelPost(record._id)}>
            <Button type="link" danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 回复规则列
  const replyRuleColumns = [
    {
      title: '关键词',
      dataIndex: 'keyword',
      width: 140,
      render: (keywords: string[]) => {
        const arr = Array.isArray(keywords) ? keywords : [keywords];
        return (
          <Space wrap size={[4, 4]}>
            {arr.slice(0, 3).map((k, idx) => (
              <Tag key={idx} color="blue">
                {k}
              </Tag>
            ))}
            {arr.length > 3 && <Tag>+{arr.length - 3}</Tag>}
          </Space>
        );
      },
    },
    {
      title: '回复内容',
      dataIndex: 'content',
      width: 160,
      ellipsis: true,
      render: (text: string) => (
        <div
          style={{ maxWidth: 160 }}
          dangerouslySetInnerHTML={{ __html: text || '-' }}
          title={text?.replace(/<[^>]+>/g, '') || ''}
        />
      ),
    },
    {
      title: '媒体',
      dataIndex: 'medias',
      width: 50,
      render: (medias: string[]) => medias?.length || 0,
    },
    {
      title: '引用',
      dataIndex: 'replyToMessage',
      width: 50,
      render: (_: any, record: any) =>
        record.replyToMessage ? <Tag color="green">是</Tag> : <Tag>否</Tag>,
    },
    {
      title: '阅后即焚',
      dataIndex: 'deleteAfterSeconds',
      width: 80,
      render: (_: any, record: any) =>
        record.deleteAfterSeconds ? <Tag color="orange">{record.deleteAfterSeconds}秒</Tag> : '-',
    },
    {
      title: '状态',
      dataIndex: 'isOnline',
      width: 90,
      render: (_: any, record: any) => (
        <Switch
          checkedChildren="启用"
          unCheckedChildren="禁用"
          checked={record.isOnline}
          onChange={(checked) => handleReplyRuleStatusChange(record, checked)}
        />
      ),
    },
    {
      title: '操作',
      width: 100,
      render: (_: any, record: any) => (
        <Space size={0}>
          {onEditReplyRule && (
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEditReplyRule(record)}
            />
          )}
          <Popconfirm title="确定删除？" onConfirm={() => handleDeleteReplyRule(record._id)}>
            <Button type="link" danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 统计
  const groupCount = currentRow?.groups?.filter((g: any) => g.type !== 'channel').length || 0;
  const channelCount = currentRow?.groups?.filter((g: any) => g.type === 'channel').length || 0;

  // 更新 Bot 功能开关
  const handleBotConfigChange = async (field: string, value: boolean) => {
    if (!currentRow?._id || !onBotUpdate) return;
    try {
      await onBotUpdate({ _id: currentRow._id, [field]: value });
      setBotConfig((prev: any) => ({ ...prev, [field]: value }));
      message.success('更新成功');
    } catch (error: any) {
      message.error(error?.response?.data?.message ?? '更新失败');
    }
  };

  // 功能开关配置项
  const featureSwitches = [
    {
      key: 'canGroupMessaging',
      label: intl.formatMessage({ id: 'groupMessage', defaultMessage: '群发消息' }),
      permission: currentUser?.groupMessage,
    },
    {
      key: 'canOpenChannelPost',
      label: intl.formatMessage({ id: 'channelPost', defaultMessage: '频道推广' }),
      permission: currentUser?.channelPost,
    },
    {
      key: 'canReplyRule',
      label: intl.formatMessage({ id: 'replyRule', defaultMessage: '关键词回复' }),
      permission: currentUser?.replyRule,
    },
    {
      key: 'canFreeKeyboard',
      label: intl.formatMessage({ id: 'keyboardConfig', defaultMessage: '键盘配置' }),
      permission: currentUser?.keyboardConfig,
    },
    {
      key: 'canGroupWelcome',
      label: intl.formatMessage({ id: 'welcomeGroup', defaultMessage: '欢迎入群' }),
      permission: currentUser?.groupWelcome,
    },
    {
      key: 'canGroupVerify',
      label: intl.formatMessage({ id: 'groupVerify', defaultMessage: '群组验证' }),
      permission: currentUser?.groupVerify,
    },
    {
      key: 'canSpeechStatic',
      label: intl.formatMessage({ id: 'speechStatic', defaultMessage: '发言统计' }),
      permission: currentUser?.speech_static,
    },
    {
      key: 'canBidirectional',
      label: intl.formatMessage({ id: 'canBidirectional', defaultMessage: '双向通信' }),
      permission: currentUser?.bidirectional,
    },
    {
      key: 'canReportMemberNameUpdated',
      label: intl.formatMessage({
        id: 'canReportMemberNameUpdated',
        defaultMessage: '报道群成员名称变更',
      }),
      permission: currentUser?.reportGroupMemberNameUpdated,
    },
  ];

  // 保存群验证配置
  const handleSaveGroupVerify = async () => {
    if (!currentRow?._id || !onBotUpdate) return;
    const correctAnswers = verifyAsks.filter((ask) => ask.isCorrect);
    if (verifyAsks.length > 0 && correctAnswers.length === 0) {
      message.error('至少需要一个正确答案');
      return;
    }
    setVerifySaving(true);
    try {
      await onBotUpdate({
        _id: currentRow._id,
        groupVerify: {
          question: verifyQuestion,
          asks: verifyAsks.map(({ name, isCorrect }) => ({ name, isCorrect })),
        },
      });
      message.success('群验证配置已保存');
    } catch (error: any) {
      message.error(error?.response?.data?.message ?? '保存失败');
    }
    setVerifySaving(false);
  };

  // 保存发言统计配置
  const handleSaveSpeechStatistics = async () => {
    if (!currentRow?._id || !onBotUpdate) return;
    setSpeechSaving(true);
    try {
      await onBotUpdate({
        _id: currentRow._id,
        minSpeechLength,
        allowPureNumberSpeech,
      });
      message.success('发言统计配置已保存');
    } catch (error: any) {
      message.error(error?.response?.data?.message ?? '保存失败');
    }
    setSpeechSaving(false);
  };

  // 保存键盘配置
  const handleSaveKeyboard = async () => {
    if (!currentRow?._id || !onBotUpdate) return;
    setKeyboardSaving(true);
    try {
      const keyboards = keyboardEditorRef.current?.getKeyboards() || [];
      await onBotUpdate({
        _id: currentRow._id,
        keyboards,
      });
      message.success('键盘配置已保存');
    } catch (error: any) {
      message.error(error?.response?.data?.message ?? '保存失败');
    }
    setKeyboardSaving(false);
  };

  // 群验证答案列
  const verifyAskColumns: ProColumns<VerifyAsk>[] = [
    {
      title: '答案选项',
      dataIndex: 'name',
      formItemProps: { rules: [{ required: true, message: '请输入答案' }] },
    },
    {
      title: '是否正确',
      dataIndex: 'isCorrect',
      valueType: 'select',
      valueEnum: {
        true: { text: '正确', status: 'Success' },
        false: { text: '错误', status: 'Error' },
      },
      formItemProps: { rules: [{ required: true, message: '请选择' }] },
    },
    {
      title: '操作',
      valueType: 'option',
      width: 100,
      render: (_, record, __, action) => [
        <a key="edit" onClick={() => action?.startEditable?.(record._id)}>
          编辑
        </a>,
      ],
    },
  ];

  // 动态生成 tab 列表
  const tabItems = useMemo(() => {
    const items = [];

    // 概览 Tab - 始终显示
    items.push({
      key: 'overview',
      label: '概览',
      children: (
        <div>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card size="small">
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                    {groupCount}
                  </div>
                  <div style={{ color: '#666' }}>群组</div>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: '#722ed1' }}>
                    {channelCount}
                  </div>
                  <div style={{ color: '#666' }}>频道</div>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                    {currentRow?.botUserConfigs?.length || 0}
                  </div>
                  <div style={{ color: '#666' }}>用户</div>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: '#fa8c16' }}>
                    {currentRow?.owners?.length || 0}
                  </div>
                  <div style={{ color: '#666' }}>拥有者</div>
                </div>
              </Card>
            </Col>
          </Row>

          <Divider orientation="left">功能开关</Divider>
          <Row gutter={[24, 16]}>
            {featureSwitches
              .filter((item) => item.permission)
              .map((item) => (
                <Col span={8} key={item.key}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      background: '#fafafa',
                      borderRadius: 6,
                    }}
                  >
                    <span>{item.label}</span>
                    <Switch
                      checked={botConfig[item.key]}
                      onChange={(checked) => handleBotConfigChange(item.key, checked)}
                    />
                  </div>
                </Col>
              ))}
          </Row>
        </div>
      ),
    });

    // 群发消息 Tab
    if (botConfig.canGroupMessaging && currentUser?.groupMessage) {
      items.push({
        key: 'groupMessage',
        label: `群发消息 (${groupMessages.length})`,
        children: (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={onOpenGroupMessageForm}>
                新建
              </Button>
            </div>
            <Table
              columns={groupMessageColumns}
              dataSource={groupMessages}
              rowKey="_id"
              loading={loading}
              size="small"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 800 }}
            />
          </div>
        ),
      });
    }

    // 频道推广 Tab
    if (botConfig.canOpenChannelPost && currentUser?.channelPost) {
      items.push({
        key: 'channelPost',
        label: `频道推广 (${channelPosts.length})`,
        children: (
          <div style={{ height: '65vh', overflow: 'auto', paddingRight: 8 }}>
            <div style={{ marginBottom: 16 }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={onOpenChannelPostForm}>
                新建
              </Button>
            </div>
            <Table
              columns={channelPostColumns}
              dataSource={channelPosts}
              rowKey="_id"
              loading={loading}
              size="small"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 900 }}
            />
          </div>
        ),
      });
    }

    // 回复规则 Tab
    if (botConfig.canReplyRule && currentUser?.replyRule) {
      items.push({
        key: 'replyRule',
        label: `回复规则 (${replyRules.length})`,
        children: (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={onOpenReplyRuleForm}>
                新建
              </Button>
            </div>
            <Table
              columns={replyRuleColumns}
              dataSource={replyRules}
              rowKey="_id"
              loading={loading}
              size="small"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 700 }}
            />
          </div>
        ),
      });
    }

    // 键盘配置 Tab
    if (botConfig.canFreeKeyboard && currentUser?.keyboardConfig) {
      items.push({
        key: 'keyboard',
        label: '自由键盘',
        children: (
          <div>
            <KeyboardEditor ref={keyboardEditorRef} value={currentRow?.keyboards || []} />
            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <Button type="primary" loading={keyboardSaving} onClick={handleSaveKeyboard}>
                保存
              </Button>
            </div>
          </div>
        ),
      });
    }

    // 群欢迎 Tab
    if (botConfig.canGroupWelcome && currentUser?.groupWelcome) {
      items.push({
        key: 'groupWelcome',
        label: '群欢迎',
        children: (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Button type="primary" onClick={() => setGroupWelcomeFormOpen(true)}>
                配置群欢迎
              </Button>
            </div>
            <Card size="small">
              <div style={{ color: '#666' }}>
                {currentRow?.groupWelcome ? (
                  <div>
                    <p>✅ 已配置群欢迎消息</p>
                  </div>
                ) : (
                  <p>❌ 未配置群欢迎消息</p>
                )}
              </div>
            </Card>
          </div>
        ),
      });
    }

    // 群组验证 Tab
    if (botConfig.canGroupVerify && currentUser?.groupVerify) {
      items.push({
        key: 'groupVerify',
        label: '群组验证',
        children: (
          <div>
            <Form layout="vertical">
              <Form.Item label="验证问题">
                <textarea
                  value={verifyQuestion}
                  onChange={(e) => setVerifyQuestion(e.target.value)}
                  placeholder="请输入验证问题"
                  style={{
                    width: '100%',
                    minHeight: 100,
                    padding: 8,
                    border: '1px solid #d9d9d9',
                    borderRadius: 6,
                  }}
                />
              </Form.Item>
            </Form>
            <EditableProTable<VerifyAsk>
              rowKey="_id"
              headerTitle="答案选项"
              columns={verifyAskColumns}
              value={verifyAsks}
              onChange={(value) => setVerifyAsks([...value])}
              recordCreatorProps={{
                newRecordType: 'dataSource',
                position: 'bottom',
                record: () => ({ _id: Date.now().toString(), name: '', isCorrect: false }),
              }}
              editable={{ type: 'multiple' }}
            />
            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <Button type="primary" loading={verifySaving} onClick={handleSaveGroupVerify}>
                保存
              </Button>
            </div>
          </div>
        ),
      });
    }

    // 发言统计 Tab
    if (botConfig.canSpeechStatic && currentUser?.speech_static) {
      items.push({
        key: 'speechStatistics',
        label: '发言统计',
        children: (
          <div>
            <Form layout="vertical" style={{ maxWidth: 400 }}>
              <Form.Item label="发言超过多少字才纳入统计">
                <InputNumber
                  value={minSpeechLength}
                  onChange={(val) => setMinSpeechLength(val || 1)}
                  min={1}
                  style={{ width: '100%' }}
                />
              </Form.Item>
              <Form.Item label="是否允许纯数字发言纳入统计">
                <Switch
                  checked={allowPureNumberSpeech}
                  onChange={setAllowPureNumberSpeech}
                  checkedChildren="是"
                  unCheckedChildren="否"
                />
              </Form.Item>
            </Form>
            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <Button type="primary" loading={speechSaving} onClick={handleSaveSpeechStatistics}>
                保存
              </Button>
            </div>
          </div>
        ),
      });
    }

    return items;
  }, [
    currentRow,
    currentUser,
    groupMessages,
    channelPosts,
    replyRules,
    loading,
    groupCount,
    channelCount,
    botConfig,
    featureSwitches,
  ]);

  return (
    <Modal
      title={`${currentRow?.botName || currentRow?.userName} - 功能配置`}
      open={open}
      onCancel={() => onCancel(false)}
      footer={null}
      width="90%"
      style={{ maxWidth: 1200, top: 20 }}
      styles={{
        body: { minHeight: '60vh', paddingTop: 24 },
      }}
      destroyOnClose
    >
      <Tabs
        tabPosition="left"
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        tabBarStyle={{ minWidth: 120 }}
      />

      {/* 群欢迎配置表单 */}
      <GroupWelcomeForm
        open={groupWelcomeFormOpen}
        onCancel={setGroupWelcomeFormOpen}
        currentRow={currentRow}
        onSuccess={() => {
          setGroupWelcomeFormOpen(false);
          // 刷新当前行数据
          if (onBotUpdate) {
            onBotUpdate({ _id: currentRow._id });
          }
        }}
      />
    </Modal>
  );
};

export default BotConfigManager;
