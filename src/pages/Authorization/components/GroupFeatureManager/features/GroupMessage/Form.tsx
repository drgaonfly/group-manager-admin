import { message, Form, Space } from 'antd';
import { FormattedMessage, useIntl, request } from '@umijs/max';
import { useState, useEffect } from 'react';
import { UploadFile } from 'antd/es/upload/interface';
import { addItem, updateItem } from '@/services/ant-design-pro/api';
import Upload from '@/components/Upload';
import RichTextEditor, { convertToTelegramHtml, toQuillHtml } from '@/components/RichTextEditor';
import InlineMenuEditor, { InlineMenuItem } from '@/components/InlineMenuEditor';
import { timeUnitToMinutes, TimeUnit } from '@/utils/intervalUtils';
import { toISOString } from '@/utils/dateUtils';
import {
  ModalForm,
  ProFormGroup,
  ProFormDigit,
  ProFormSelect,
  ProFormRadio,
  ProFormSwitch,
  ProFormDependency,
  ProFormDateTimePicker,
} from '@ant-design/pro-components';

type menuItem = InlineMenuItem;

interface GroupMessageFormProps {
  open: boolean;
  onCancel: (visible: boolean) => void;
  currentRow?: any;
  onSuccess?: () => void;
  /** 编辑时传入现有记录 */
  editingRecord?: any;
  /** 从外层直接传入群组 ID */
  fixedGroupId?: string;
}

const GroupMessageForm: React.FC<GroupMessageFormProps> = ({
  open,
  onCancel,
  currentRow,
  onSuccess,
  editingRecord,
  fixedGroupId,
}) => {
  const intl = useIntl();
  const isEdit = !!editingRecord?._id;
  const [content, setContent] = useState('');
  const [medias, setMedias] = useState<string[]>([]);
  const [form] = Form.useForm();
  const [menus, setMenus] = useState<menuItem[]>([]);

  useEffect(() => {
    if (!open) return;
    form.resetFields();

    if (isEdit) {
      setContent(toQuillHtml(editingRecord.content || ''));
      setMedias(Array.isArray(editingRecord.medias) ? editingRecord.medias : []);
      setMenus(
        (editingRecord.menus || []).map((m: any, i: number) => ({
          _id: m._id || `menu-${i}`,
          name: m.name,
          type: m.type || 'url',
          url: m.url,
          callback: m.callback,
          copy_text: m.copy_text,
          row: m.row ?? 1,
          style: m.style || 'primary',
        })),
      );
      form.setFieldsValue({
        sendType: editingRecord.sendType || 'scheduled',
        intervalTime: editingRecord.intervalTime || 0,
        startAt: editingRecord.startAt,
        endAt: editingRecord.endAt,
        autoDeletePrevious: editingRecord.autoDeletePrevious || false,
        isPinned: editingRecord.isPinned || false,
      });
    } else {
      setContent('');
      setMedias([]);
      setMenus([]);
    }
  }, [open, editingRecord]);

  // Default file list for showing existing medias
  const defaultMediaFileList: UploadFile[] = medias
    ? medias.filter(Boolean).map((url, idx) => ({
        uid: `${idx + 1}`,
        name: `media${idx + 1}`,
        status: 'done' as UploadFile['status'],
        url,
      }))
    : [];

  const handleFinish = async (values: any) => {
    const telegramContent = convertToTelegramHtml(content);

    if (isEdit) {
      // 编辑模式
      const hide = message.loading('更新中...');
      try {
        await updateItem(`/group-messages/${editingRecord._id}`, {
          ...values,
          bot: editingRecord.bot?._id ?? editingRecord.bot,
          content: telegramContent,
          medias,
          menus: menus.map(({ name, type, url, callback, copy_text, row, style }) => ({
            name,
            type: type || 'url',
            url,
            callback,
            copy_text,
            row: row ?? 1,
            style: style || 'primary',
          })),
          startAt: toISOString(values.startAt),
          endAt: toISOString(values.endAt),
        });
        hide();
        message.success('更新成功');
        form.resetFields();
        setContent('');
        setMedias([]);
        setMenus([]);
        onCancel(false);
        onSuccess?.();
        return true;
      } catch (error: any) {
        hide();
        message.error(error?.response?.data?.message ?? '更新失败，请重试');
        return false;
      }
    }

    // 新建模式
    const hide = message.loading(<FormattedMessage id="adding" defaultMessage="Adding..." />);
    try {
      const data = {
        ...values,
        content: telegramContent,
        bot: currentRow?._id,
        intervalTime:
          values.sendType === 'immediate'
            ? 0
            : timeUnitToMinutes(values.intervalTime || 0, values.timeUnit as TimeUnit),
        groups: fixedGroupId ? [fixedGroupId] : [],
        group: fixedGroupId,
        medias,
        sendType: values.sendType,
        menus: menus.map(({ name, type, url, callback, copy_text, row, style }) => ({
          name,
          type: type || 'url',
          url,
          callback,
          copy_text,
          row: row ?? 1,
          style: style || 'primary',
        })),
        startAt: toISOString(values.startAt),
        endAt: toISOString(values.endAt),
      };

      // 如果是立即发送，调用 sendGroupMessage 接口
      if (values.sendType === 'immediate') {
        await request(`/bots/${currentRow?._id}/send-group-message`, {
          method: 'PUT',
          data: {
            content: telegramContent,
            medias,
            menus: data.menus,
            groups: fixedGroupId ? [fixedGroupId] : [],
            isPinned: values.isPinned || false,
          },
        });
      } else {
        // 定时发送，创建记录
        await addItem('/group-messages', data);
      }

      hide();
      message.success(<FormattedMessage id="add_successful" defaultMessage="Added successfully" />);
      form.resetFields();
      setContent('');
      setMedias([]);
      setMenus([]);
      onCancel(false);
      onSuccess?.();
      return true;
    } catch (error: any) {
      hide();
      message.error(
        error?.response?.data?.message ?? (
          <FormattedMessage id="add_failed" defaultMessage="Add failed, please try again" />
        ),
      );
      return false;
    }
  };

  return (
    <ModalForm
      title={
        isEdit
          ? intl.formatMessage({ id: 'edit_group_message', defaultMessage: '编辑群发消息' })
          : intl.formatMessage({ id: 'add_group_message', defaultMessage: 'Add Group Message' })
      }
      open={open}
      form={form}
      modalProps={{
        destroyOnClose: true,
        onCancel: () => onCancel(false),
        width: window.innerWidth < 768 ? '100%' : 800,
        style: window.innerWidth < 768 ? { margin: 0, maxWidth: '100vw' } : undefined,
      }}
      onFinish={handleFinish}
    >
      {/* 富文本编辑器 - 单独占满一行 */}
      <Form.Item
        label={intl.formatMessage({ id: 'content', defaultMessage: 'Message Content' })}
        required
        style={{ marginBottom: 24 }}
      >
        <RichTextEditor
          value={content}
          onChange={setContent}
          placeholder="请输入消息内容..."
          height={200}
          variables="all"
        />
      </Form.Item>

      <ProFormGroup>
        <Form.Item label={intl.formatMessage({ id: 'media', defaultMessage: '媒体文件' })}>
          <Upload
            onFileUpload={(url: string, signedUrl?: string) => {
              // 支持多媒体上传
              setMedias((prev) => [...prev, signedUrl || url]);
            }}
            accept=".jpg,.jpeg,.png,.gif,.mp4,.avi,.mov,.mkv,.webm"
            defaultFileList={defaultMediaFileList}
            multiple
            onRemove={(file: UploadFile) => {
              setMedias((prev) => prev.filter((media) => media !== file.url));
              return true;
            }}
          />
        </Form.Item>

        <ProFormSwitch
          name="isPinned"
          label={intl.formatMessage({
            id: 'is_pinned',
            defaultMessage: '置顶消息',
          })}
          initialValue={false}
          tooltip="发送后将该消息置顶到群组顶部"
        />
      </ProFormGroup>

      <ProFormGroup>
        <ProFormRadio.Group
          name="sendType"
          label={intl.formatMessage({ id: 'send_type', defaultMessage: 'Send Type' })}
          initialValue="immediate"
          options={[
            {
              label: intl.formatMessage({ id: 'immediate_send', defaultMessage: '立即发送' }),
              value: 'immediate',
            },
            {
              label: intl.formatMessage({ id: 'scheduled_send', defaultMessage: '定时发送' }),
              value: 'scheduled',
            },
          ]}
        />
      </ProFormGroup>

      <ProFormDependency name={['sendType']}>
        {({ sendType }) =>
          sendType === 'scheduled' && (
            <>
              <ProFormGroup
                label={intl.formatMessage({ id: 'interval_time', defaultMessage: 'Interval Time' })}
                style={{
                  marginBottom: 32,
                }}
              >
                <Space>
                  <ProFormSelect
                    name="timeUnit"
                    width="xs"
                    initialValue="hours"
                    options={[
                      {
                        label: intl.formatMessage({ id: 'minutes', defaultMessage: 'Minutes' }),
                        value: 'minutes',
                      },
                      {
                        label: intl.formatMessage({ id: 'hours', defaultMessage: 'Hours' }),
                        value: 'hours',
                      },
                      {
                        label: intl.formatMessage({ id: 'weeks', defaultMessage: 'Weeks' }),
                        value: 'weeks',
                      },
                    ]}
                    noStyle
                  />

                  <ProFormDigit
                    name="intervalTime"
                    width="xs"
                    min={0}
                    fieldProps={{ style: { width: '100%' } }}
                    noStyle
                  />
                </Space>
              </ProFormGroup>

              <ProFormGroup>
                <ProFormDateTimePicker
                  width="md"
                  name="startAt"
                  label="发送开始时间"
                  fieldProps={{ format: 'YYYY-MM-DD HH:mm', showTime: { format: 'HH:mm' } }}
                  tooltip="允许发送消息的开始时间"
                />
                <ProFormDateTimePicker
                  width="md"
                  name="endAt"
                  label="发送结束时间"
                  fieldProps={{ format: 'YYYY-MM-DD HH:mm', showTime: { format: 'HH:mm' } }}
                  tooltip="允许发送消息的结束时间"
                />
              </ProFormGroup>

              <ProFormGroup>
                <ProFormSwitch
                  name="autoDeletePrevious"
                  label={intl.formatMessage({
                    id: 'auto_delete_previous',
                    defaultMessage: '自动删除上一条',
                  })}
                  initialValue={false}
                  tooltip="发送新消息前，自动删除该群组上一条已发送的消息"
                />
              </ProFormGroup>
            </>
          )
        }
      </ProFormDependency>

      <Form.Item
        label={intl.formatMessage({
          id: 'inline_menu_config',
          defaultMessage: '按钮设置',
        })}
      >
        <InlineMenuEditor value={menus} onChange={setMenus} showStyle />
      </Form.Item>
    </ModalForm>
  );
};

export default GroupMessageForm;
