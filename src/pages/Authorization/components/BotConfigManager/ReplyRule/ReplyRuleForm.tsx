import { useIntl } from '@umijs/max';
import React, { useState, useEffect } from 'react';
import {
  ModalForm,
  ProFormDigit,
  ProFormGroup,
  ProFormSwitch,
  ProFormText,
} from '@ant-design/pro-components';
import { Form, message } from 'antd';
import { UploadFile } from 'antd/es/upload/interface';
import { addItem, updateItem } from '@/services/ant-design-pro/api';
import { FormattedMessage } from '@umijs/max';
import Upload from '@/components/Upload';
import RichTextEditor, { convertToTelegramHtml, toQuillHtml } from '@/components/RichTextEditor';
import InlineMenuEditor, { InlineMenuItem } from '@/components/InlineMenuEditor';

type menuItem = InlineMenuItem;

interface Props {
  open: boolean;
  onOpenChange: (visible: boolean) => void;
  currentRow: any;
  onSuccess: () => void;
  /** 编辑时传入现有记录，新建时不传 */
  editingRecord?: any;
  /** 从外层直接传入群组 ID */
  fixedGroupId?: string;
}

const ReplyRuleForm: React.FC<Props> = ({
  open,
  onOpenChange,
  currentRow,
  onSuccess,
  editingRecord,
  fixedGroupId,
}) => {
  const intl = useIntl();
  const isEdit = !!editingRecord?._id;
  const [content, setContent] = useState('');
  const [form] = Form.useForm();
  const [menus, setMenus] = useState<menuItem[]>([]);
  const [medias, setMedias] = useState<string[]>([]);

  // 编辑时回填数据
  useEffect(() => {
    if (open && isEdit) {
      setContent(toQuillHtml(editingRecord.content || ''));
      setMedias(editingRecord.medias || []);
      setMenus(
        (editingRecord.menus || []).map((m: any, i: number) => ({
          _id: m._id || `menu-${i}`,
          name: m.name,
          type: m.type || 'url',
          url: m.url,
          callback: m.callback,
          copy_text: m.copy_text,
          row: m.row || 1,
          style: m.style || 'primary',
        })),
      );
      form.setFieldsValue({
        keyword: Array.isArray(editingRecord.keyword)
          ? editingRecord.keyword.join(', ')
          : editingRecord.keyword,
        isFuzzy: editingRecord.isFuzzy || false,
        deleteAfterSeconds: editingRecord.deleteAfterSeconds || 0,
        deleteUserMsgAfterSeconds: editingRecord.deleteUserMsgAfterSeconds || 0,
        replyToMessage: editingRecord.replyToMessage || false,
        replyToAdmin: editingRecord.replyToAdmin !== false,
      });
    } else if (open && !isEdit) {
      setContent('');
      setMedias([]);
      setMenus([]);
    }
  }, [open, editingRecord]);

  const handleSubmit = async (values: any) => {
    const hide = message.loading(
      isEdit ? '更新中...' : <FormattedMessage id="adding" defaultMessage="Adding..." />,
    );
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
        group: fixedGroupId,
        menus: menus.map(({ name, type, url, callback, copy_text, row, style }) => ({
          name,
          type: type || 'url',
          url,
          callback,
          copy_text,
          row: row || 1,
          style: style || 'primary',
        })),
        medias: medias.map((m) => (m.includes('/') ? m.split('/').pop() : m)),
      };

      if (isEdit) {
        await updateItem(`/reply-rules/${editingRecord._id}`, formData);
      } else {
        await addItem('/reply-rules', formData);
      }

      hide();
      message.success(
        isEdit ? '更新成功' : <FormattedMessage id="add_successful" defaultMessage="添加成功" />,
      );
      onSuccess();
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

  return (
    <ModalForm
      title={
        isEdit
          ? intl.formatMessage({ id: 'edit_reply_rule', defaultMessage: '编辑回复规则' })
          : intl.formatMessage({ id: 'add_reply_rule', defaultMessage: '添加回复规则' })
      }
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
        isFuzzy: false,
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
        <ProFormSwitch
          name="isFuzzy"
          label="模糊匹配"
          tooltip="开启后，消息中包含关键词即触发（包含匹配）；关闭则需要完全相等（精确匹配）"
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
          key={editingRecord?._id || 'new'}
          onFileUpload={(url: string) => {
            setMedias((prev) => [...prev, url]);
          }}
          accept=".jpg,.jpeg,.png,.gif,.mp4,.mov,.avi,.mkv,.webm"
          multiple
          defaultFileList={medias.filter(Boolean).map((url, idx) => ({
            uid: `media-${idx}`,
            name: url.includes('/') ? url.split('/').pop()! : url,
            status: 'done' as const,
            url,
          }))}
          onRemove={(file: UploadFile) => {
            const fileUrl = file.url || (file.response as any)?.data?.file;
            setMedias((prev) => prev.filter((m) => m !== fileUrl && !fileUrl?.includes(m)));
            return true;
          }}
        />
      </Form.Item>

      <Form.Item label="内联菜单配置">
        <InlineMenuEditor value={menus} onChange={setMenus} showStyle />
      </Form.Item>
    </ModalForm>
  );
};

export default ReplyRuleForm;
