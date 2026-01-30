import { useIntl } from '@umijs/max';
import React, { useState } from 'react';
import {
  ModalForm,
  ProFormDigit,
  ProFormGroup,
  EditableProTable,
  ProFormSwitch,
  ProFormText,
  ProColumns,
} from '@ant-design/pro-components';
import { Form, message } from 'antd';
import { UploadFile } from 'antd/es/upload/interface';
import { addItem } from '@/services/ant-design-pro/api';
import { FormattedMessage } from '@umijs/max';
import Upload from '@/components/Upload';
import RichTextEditor, { convertToTelegramHtml } from '@/components/RichTextEditor';

type menuItem = {
  _id: string;
  name: string;
  url: string;
};

interface Props {
  open: boolean;
  onOpenChange: (visible: boolean) => void;
  currentRow: any;
  onSuccess: () => void;
}

const ReplyRuleForm: React.FC<Props> = ({ open, onOpenChange, currentRow, onSuccess }) => {
  const intl = useIntl();
  const [content, setContent] = useState('');
  const [form] = Form.useForm();
  const [menus, setMenus] = useState<menuItem[]>([]);
  const [medias, setMedias] = useState<string[]>([]);
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);

  const handleSubmit = async (values: any) => {
    const hide = message.loading(<FormattedMessage id="adding" defaultMessage="Adding..." />);
    try {
      const telegramContent = convertToTelegramHtml(content);
      const keywordArray = (values.keyword || '')
        .split(/[,，\n]/)
        .map((k: string) => k.trim())
        .filter((k: string) => k);

      const formData = {
        ...values,
        keyword: keywordArray,
        content: telegramContent,
        bot: currentRow?._id,
        menus: menus.map(({ name, url }) => ({ name, url })),
        medias: medias.map((m) => (m.includes('/') ? m.split('/').pop() : m)),
        menus_per_row: values.menus_per_row || 1,
      };

      await addItem('/reply-rules', formData);

      hide();
      message.success(<FormattedMessage id="add_successful" defaultMessage="添加成功" />);
      onSuccess();
      // 重置表单
      form.resetFields();
      setContent('');
      setMenus([]);
      setMedias([]);
      return true;
    } catch (error: any) {
      hide();
      message.error(
        error?.response?.data?.message ?? (
          <FormattedMessage id="operation_failed" defaultMessage="操作失败，请重试" />
        ),
      );
      return false;
    }
  };

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
    <ModalForm
      title={intl.formatMessage({ id: 'add_reply_rule', defaultMessage: '添加回复规则' })}
      open={open}
      onOpenChange={(visible) => {
        if (!visible) {
          form.resetFields();
          setContent('');
          setMenus([]);
          setMedias([]);
        }
        onOpenChange(visible);
      }}
      form={form}
      width={800}
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      onFinish={handleSubmit}
      initialValues={{
        menus_per_row: 1,
        replyToMessage: false,
        replyToAdmin: true,
        deleteAfterSeconds: 0,
        deleteUserMsgAfterSeconds: 0,
      }}
    >
      <ProFormGroup>
        <ProFormText
          name="keyword"
          label="关键词"
          width="lg"
          rules={[{ required: true, message: '请输入关键词' }]}
          placeholder="多个关键词用逗号分隔，支持 <tron_address>"
          tooltip="多个关键词用逗号分隔，任意一个匹配即触发回复。特殊关键词：<tron_address> 匹配所有波场地址"
        />
      </ProFormGroup>

      <Form.Item label="回复内容" required style={{ marginBottom: 24 }}>
        <RichTextEditor
          value={content}
          onChange={setContent}
          placeholder="请输入回复内容，支持富文本格式和变量..."
          height={200}
        />
      </Form.Item>

      <ProFormGroup>
        <ProFormDigit name="menus_per_row" label="每行菜单数" width="sm" min={1} />
        <ProFormDigit
          name="deleteAfterSeconds"
          label="阅后即焚(秒)"
          width="sm"
          min={0}
          tooltip="设置后机器人回复的消息会在指定秒数后自动删除，0表示不删除"
          fieldProps={{ placeholder: '0为不删除' }}
        />
        <ProFormDigit
          name="deleteUserMsgAfterSeconds"
          label="删除用户消息(秒)"
          width="sm"
          min={0}
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
        />
      </ProFormGroup>

      <Form.Item label="媒体文件（图片/视频）">
        <Upload
          onFileUpload={(url: string) => {
            setMedias((prev) => [...prev, url]);
          }}
          accept=".jpg,.jpeg,.png,.gif,.mp4,.mov,.avi,.mkv,.webm"
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
          record: () => ({ _id: Date.now().toString(), name: '', url: '' }),
        }}
      />
    </ModalForm>
  );
};

export default ReplyRuleForm;
