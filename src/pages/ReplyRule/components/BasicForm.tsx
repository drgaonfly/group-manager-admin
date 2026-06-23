import { Form, Space, Tag, Select } from 'antd';
import { useState, useEffect } from 'react';
import { UploadFile } from 'antd/es/upload/interface';
import Upload from '@/components/Upload';
import BotSelect from '@/components/BotSelect';
import { request } from '@umijs/max';
import {
  ProFormText,
  ProFormGroup,
  ProFormDigit,
  ProFormSwitch,
  ProFormTextArea,
  ProColumns,
  EditableProTable,
} from '@ant-design/pro-components';
import React from 'react';

const { Option } = Select;

type menuItem = {
  _id: string;
  name: string;
  url: string;
  row: number;
  style: 'primary' | 'success' | 'danger';
};

interface BasicFormProps {
  form: any;
  initialValues?: any;
}

const BasicForm: React.FC<BasicFormProps> = ({ form, initialValues }) => {
  const [keywords, setKeywords] = useState('');
  const [content, setContent] = useState('');
  const [medias, setMedias] = useState<string[]>([]);
  const [menus, setMenus] = useState<menuItem[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const [botGroups, setBotGroups] = useState<any[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);

  const loadBotGroups = async (botId: string) => {
    if (!botId) {
      setBotGroups([]);
      return;
    }
    setGroupsLoading(true);
    try {
      const res = await request('/groups/getByBotId', {
        method: 'GET',
        params: { botId },
      });
      if (res.success) setBotGroups(res.data || []);
    } catch (e) {
      console.error('加载群组失败:', e);
    } finally {
      setGroupsLoading(false);
    }
  };

  const variables = [
    { key: '{userId}', label: '用户ID', desc: '用户的 Telegram ID' },
    { key: '{nickname}', label: '用户昵称', desc: '用户的昵称/名字' },
    { key: '{userName}', label: '用户名', desc: '用户的 @username' },
    { key: '{userBalance}', label: '用户积分', desc: '用户的积分余额' },
    {
      key: '{userBalanceRanking}',
      label: '用户积分排名',
      desc: '显示当前用户在本群的积分排名数字',
    },
    {
      key: '{userBalanceRankingList}',
      label: '用户积分榜单',
      desc: '显示本群积分排名前10的用户列表',
    },
    { key: '{groupTitle}', label: '群名称', desc: '当前群组的名称' },
    { key: '{currentTime}', label: '当前时间', desc: '消息发送时的时间' },
    { key: '{currentBot}', label: '当前机器人', desc: '当前机器人的昵称' },
  ];

  const insertVariable = (variable: string) => {
    setContent((prev) => prev + variable);
  };

  useEffect(() => {
    if (initialValues) {
      const keywordStr = Array.isArray(initialValues.keyword)
        ? initialValues.keyword.join(', ')
        : initialValues.keyword || '';
      setKeywords(keywordStr);
      setContent(initialValues.content || '');
      const mediaList = initialValues.medias || [];
      setMedias(mediaList);
      setFileList(
        mediaList.filter(Boolean).map((url: string, idx: number) => ({
          uid: `media-${idx + 1}`,
          name: url.includes('/') ? url.split('/').pop() : url,
          status: 'done' as UploadFile['status'],
          url,
          thumbUrl: url, // 添加 thumbUrl 用于预览
        })),
      );
      setMenus(
        (initialValues.menus || []).map((m: any, idx: number) => ({
          _id: m._id || `menu-${idx}`,
          name: m.name,
          url: m.url,
          row: m.row || 0,
          style: m.style || 'primary',
        })),
      );

      const botId = initialValues.bot?._id || initialValues.bot;

      // 加载该 bot 的群组列表
      if (botId) loadBotGroups(botId);

      const groupId = initialValues.group?._id || initialValues.group;

      form.setFieldsValue({
        keyword: Array.isArray(initialValues.keyword)
          ? initialValues.keyword.join(', ')
          : initialValues.keyword,
        bot: botId,
        group: groupId ? String(groupId) : undefined,
        replyToMessage: initialValues.replyToMessage || false,
        replyToAdmin: initialValues.replyToAdmin !== false,
        deleteAfterSeconds: initialValues.deleteAfterSeconds || 0,
        deleteUserMsgAfterSeconds: initialValues.deleteUserMsgAfterSeconds || 0,
      });
    } else {
      setKeywords('');
      setContent('');
      setMedias([]);
      setFileList([]);
      setMenus([]);
    }
  }, [initialValues, form]);

  useEffect(() => {
    form.__getReplyRuleData = () => {
      const keywordArray = keywords
        .split(/[,，\n]/)
        .map((k) => k.trim())
        .filter((k) => k);
      return {
        keyword: keywordArray,
        content: content,
        medias: medias.map((m) => (m.includes('/') ? m.split('/').pop() : m)),
        menus: menus.map(({ name, url, row, style }) => ({
          name,
          url,
          row: row || 0,
          style: style || 'primary',
        })),
      };
    };
  }, [keywords, content, medias, menus, form]);

  const menuColumns: ProColumns<menuItem>[] = [
    {
      title: '按钮名称',
      dataIndex: 'name',
      formItemProps: { rules: [{ required: true, message: '请输入按钮名称' }] },
    },
    {
      title: '链接',
      dataIndex: 'url',
      formItemProps: {
        rules: [
          { required: true, message: '请输入链接' },
          { pattern: /^https?:\/\/.+/, message: '请输入有效的链接' },
        ],
      },
    },
    {
      title: '样式',
      dataIndex: 'style',
      valueType: 'select',
      width: 100,
      formItemProps: {
        rules: [{ required: true, message: '请选择样式' }],
      },
      fieldProps: {
        options: [
          { label: '蓝色', value: 'primary' },
          { label: '绿色', value: 'success' },
          { label: '红色', value: 'danger' },
        ],
      },
      render: (_, record) => {
        const styleMap = {
          primary: { color: '#1890ff', text: '蓝色' },
          success: { color: '#52c41a', text: '绿色' },
          danger: { color: '#ff4d4f', text: '红色' },
        };
        const style = styleMap[record.style] || styleMap.primary;
        return <span style={{ color: style.color, fontWeight: 'bold' }}>{style.text}</span>;
      },
    },
    {
      title: '行号',
      dataIndex: 'row',
      valueType: 'digit',
      width: 80,
      formItemProps: {
        rules: [{ required: true, message: '请输入行号' }],
      },
      fieldProps: {
        min: 0,
        precision: 0,
        placeholder: '0',
      },
      tooltip: '相同行号的按钮会显示在同一行',
    },
    {
      title: '操作',
      valueType: 'option',
      width: 100,
      render: (_, record, __, action) => [
        <a key="editable" onClick={() => action?.startEditable?.(`${record._id}`)}>
          编辑
        </a>,
      ],
    },
  ];

  return (
    <>
      <ProFormGroup>
        <BotSelect
          onChange={(botId) => {
            loadBotGroups(botId);
            form.setFieldValue('group', undefined);
          }}
        />

        <ProFormText
          name="keyword"
          label="关键词"
          width="md"
          rules={[{ required: true, message: '请输入关键词' }]}
          fieldProps={{
            value: keywords,
            onChange: (e) => setKeywords(e.target.value),
          }}
          placeholder="多个关键词用逗号分隔，支持 <tron_address>"
          tooltip="多个关键词用逗号分隔，任意一个匹配即触发回复。特殊关键词：<tron_address> 匹配所有波场地址"
        />
      </ProFormGroup>

      <Form.Item
        name="group"
        label="适用群组"
        rules={[{ required: true, message: '请选择适用群组' }]}
      >
        <Select
          placeholder="请选择群组"
          loading={groupsLoading}
          showSearch
          optionFilterProp="children"
        >
          {botGroups.map((group) => (
            <Option key={String(group._id)} value={String(group._id)}>
              {group.title}
              {group.username ? ` (@${group.username})` : ''}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <ProFormGroup>
        <ProFormDigit
          name="deleteAfterSeconds"
          label="阅后即焚(秒)"
          width="sm"
          min={0}
          initialValue={0}
          tooltip="设置后机器人回复的消息会在指定秒数后自动删除，0表示不删除"
          fieldProps={{ placeholder: '0为不删除' }}
        />
        <ProFormDigit
          name="deleteUserMsgAfterSeconds"
          label="删除用户消息(秒)"
          width="sm"
          min={0}
          initialValue={0}
          tooltip="设置后用户触发关键词的原始消息会在指定秒数后自动删除，0表示不删除"
          fieldProps={{ placeholder: '0为不删除' }}
        />
      </ProFormGroup>

      <ProFormGroup>
        <ProFormSwitch
          name="isFuzzy"
          label="模糊匹配"
          tooltip="开启后，消息中包含关键词即触发（包含匹配）；关闭则需要完全相等（精确匹配）"
        />
        <ProFormSwitch
          name="replyToMessage"
          label="引用用户消息"
          tooltip="启用后回复时会引用触发关键词的消息"
        />
        <ProFormSwitch
          name="replyToAdmin"
          label="回复管理员"
          tooltip="关闭后不会回复群组管理员的消息"
          initialValue={true}
        />
      </ProFormGroup>

      <div style={{ marginBottom: 16 }}>
        <span style={{ marginRight: 8, color: '#666', fontSize: 12 }}>插入变量：</span>
        <Space wrap size={[4, 4]}>
          {variables.map((v) => (
            <Tag
              key={v.key}
              color="blue"
              style={{ cursor: 'pointer' }}
              onClick={() => insertVariable(v.key)}
              title={v.desc}
            >
              {v.label}
            </Tag>
          ))}
        </Space>
      </div>

      <ProFormTextArea
        name="content"
        label="回复内容"
        required
        rules={[{ required: true, message: '请输入回复内容' }]}
        fieldProps={{
          placeholder: '请输入回复内容，支持变量...',
          rows: 8,
        }}
      />

      <Form.Item label="媒体文件（图片/视频）">
        <Upload
          onFileUpload={(url: string) => {
            setMedias((prev) => [...prev, url]);
          }}
          accept=".jpg,.jpeg,.png,.gif,.mp4,.mov,.avi,.mkv,.webm"
          defaultFileList={fileList}
          multiple
          onRemove={(file: UploadFile) => {
            const fileUrl = file.url || (file.response as any)?.data?.file;
            setMedias((prev) => prev.filter((m) => m !== fileUrl && !fileUrl?.includes(m)));
            return true;
          }}
        />
      </Form.Item>

      <EditableProTable<menuItem>
        rowKey="_id"
        headerTitle="内联菜单配置"
        columns={menuColumns}
        value={menus}
        onChange={(value) => setMenus([...value])}
        editable={{
          type: 'multiple',
          editableKeys,
          onChange: setEditableRowKeys,
        }}
        recordCreatorProps={{
          newRecordType: 'dataSource',
          position: 'bottom',
          record: () => ({
            _id: Date.now().toString(),
            name: '',
            url: '',
            row: 0,
            style: 'primary',
          }),
        }}
      />
    </>
  );
};

export default BasicForm;
