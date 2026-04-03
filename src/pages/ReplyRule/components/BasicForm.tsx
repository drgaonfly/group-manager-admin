import { Form, Space, Tag } from 'antd';
import { useState, useEffect, useMemo } from 'react';
import { UploadFile } from 'antd/es/upload/interface';
import Upload from '@/components/Upload';
import BotSelect from '@/components/BotSelect';
import {
  ProFormText,
  ProFormGroup,
  ProFormDigit,
  ProFormSwitch,
  ProColumns,
  EditableProTable,
} from '@ant-design/pro-components';
import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

type menuItem = {
  _id: string;
  name: string;
  url: string;
  row: number;
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
  const quillRef = React.useRef<ReactQuill>(null);

  const variables = [
    { key: '{member}', label: '带链接成员名', desc: '带链接的群成员名字' },
    { key: '{userId}', label: '用户ID', desc: '用户的 Telegram ID' },
    { key: '{nickname}', label: '用户昵称', desc: '用户的昵称/名字' },
    { key: '{userName}', label: '用户名', desc: '用户的 @username' },
    { key: '{userBalance}', label: '用户积分', desc: '用户的积分余额' },
    {
      key: '{userBalanceRanking}',
      label: '用户积分排名',
      desc: '显示当前用户在本群的积分排名数字',
    },
    { key: '{groupTitle}', label: '群名称', desc: '当前群组的名称' },
    { key: '{currentTime}', label: '当前时间', desc: '消息发送时的时间' },
    { key: '{currentBot}', label: '当前机器人', desc: '当前机器人的昵称' },
  ];

  const quillModules = useMemo(
    () => ({
      toolbar: [
        ['bold', 'italic', 'underline', 'strike'],
        ['link'],
        ['blockquote', 'code-block'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['clean'],
      ],
    }),
    [],
  );

  const quillFormats = [
    'bold',
    'italic',
    'underline',
    'strike',
    'link',
    'blockquote',
    'code-block',
    'list',
    'bullet',
  ];

  const insertVariable = (variable: string) => {
    const editor = quillRef.current?.getEditor();
    if (editor) {
      const range = editor.getSelection(true);
      if (range) {
        editor.insertText(range.index, variable);
        editor.setSelection(range.index + variable.length, 0);
      }
    }
  };

  const convertToQuillHtml = (text: string): string => {
    if (!text) return '';
    return text
      .split('\n')
      .map((line) => `<p>${line || '<br>'}</p>`)
      .join('');
  };

  const convertToTelegramHtml = (html: string): string => {
    if (!html) return '';
    let result = html
      .replace(/<strong>/g, '<b>')
      .replace(/<\/strong>/g, '</b>')
      .replace(/<em>/g, '<i>')
      .replace(/<\/em>/g, '</i>')
      .replace(/<s>/g, '<s>')
      .replace(/<\/s>/g, '</s>')
      .replace(/<pre class="ql-syntax" spellcheck="false">/g, '<pre>')
      .replace(/<\/pre>/g, '</pre>')
      .replace(/<blockquote>/g, '')
      .replace(/<\/blockquote>/g, '')
      .replace(/<ol>/g, '')
      .replace(/<\/ol>/g, '')
      .replace(/<ul>/g, '')
      .replace(/<\/ul>/g, '')
      .replace(/<li>/g, '• ')
      .replace(/<\/li>/g, '\n')
      .replace(/<p><br><\/p>/g, '\n')
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<p>/g, '')
      .replace(/<\/p>/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    return result;
  };

  useEffect(() => {
    if (initialValues) {
      const keywordStr = Array.isArray(initialValues.keyword)
        ? initialValues.keyword.join(', ')
        : initialValues.keyword || '';
      setKeywords(keywordStr);
      setContent(convertToQuillHtml(initialValues.content || ''));
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
        })),
      );

      const botId = initialValues.bot?._id || initialValues.bot;

      form.setFieldsValue({
        keyword: Array.isArray(initialValues.keyword)
          ? initialValues.keyword.join(', ')
          : initialValues.keyword,
        bot: botId,
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
        content: convertToTelegramHtml(content),
        medias: medias.map((m) => (m.includes('/') ? m.split('/').pop() : m)),
        menus: menus.map(({ name, url, row }) => ({ name, url, row: row || 0 })),
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
        <BotSelect />

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

      <Form.Item label="回复内容" required rules={[{ required: true, message: '请输入回复内容' }]}>
        <div style={{ marginBottom: 8 }}>
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
        <div style={{ background: '#fff', borderRadius: 4, marginBottom: 50 }}>
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={content}
            onChange={setContent}
            modules={quillModules}
            formats={quillFormats}
            placeholder="请输入回复内容，支持富文本格式和变量..."
            style={{ height: 200 }}
          />
        </div>
      </Form.Item>

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
          record: () => ({ _id: Date.now().toString(), name: '', url: '', row: 0 }),
        }}
      />
    </>
  );
};

export default BasicForm;
