import { useIntl, request } from '@umijs/max';
import React, { useState, useEffect } from 'react';
import {
  ModalForm,
  ProFormDigit,
  ProFormGroup,
  ProFormSwitch,
  ProFormRadio,
  ProFormDependency,
  ProFormSelect,
  ProFormDateTimePicker,
} from '@ant-design/pro-components';
import { Form, Input, message, Space } from 'antd';
import { UploadFile } from 'antd/es/upload/interface';
import { addItem, updateItem } from '@/services/ant-design-pro/api';
import { FormattedMessage } from '@umijs/max';
import Upload from '@/components/Upload';
import RichTextEditor, { convertToTelegramHtml, toQuillHtml } from '@/components/RichTextEditor';
import InlineMenuEditor, { InlineMenuItem } from '@/components/InlineMenuEditor';
import { timeUnitToMinutes, minutesToTimeUnit, TimeUnit } from '@/utils/intervalUtils';
import { toISOString } from '@/utils/dateUtils';

type menuItem = InlineMenuItem;

interface Props {
  open: boolean;
  onClose: () => void;
  currentRow: any;
  onSuccess: () => void;
  /** 编辑时传入现有记录 */
  editingRecord?: any;
  /** 固定的频道 ID（来自频道列表层，传入后不渲染频道选择） */
  fixedChannelId?: string;
}

const ChannelPostForm: React.FC<Props> = ({
  open,
  onClose,
  currentRow,
  onSuccess,
  editingRecord,
  fixedChannelId,
}) => {
  const intl = useIntl();
  const isEdit = !!editingRecord?._id;
  const [content, setContent] = useState('');
  const [form] = Form.useForm();
  const [menus, setMenus] = useState<menuItem[]>([]);
  const [medias, setMedias] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    if (isEdit) {
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
          row: m.row ?? 1,
          style: m.style || 'primary',
        })),
      );
      const { timeUnit, value: intervalValue } = minutesToTimeUnit(editingRecord.interval);
      form.setFieldsValue({
        sendType: editingRecord.sendType || 'scheduled',
        interval: intervalValue,
        timeUnit,
        startAt: editingRecord.startAt,
        endAt: editingRecord.endAt,
        weight: editingRecord.weight || 0,
        isOnline: editingRecord.isOnline !== false,
        isClearLastPost: editingRecord.isClearLastPost || false,
        isPinned: editingRecord.isPinned || false,
      });
    } else {
      setContent('');
      setMedias([]);
      setMenus([]);
    }
  }, [open, editingRecord]);

  const defaultMediaFileList: UploadFile[] = medias
    ? medias.filter(Boolean).map((media, idx) => ({
        uid: String(idx + 1),
        name: `media${idx + 1}`,
        status: 'done' as UploadFile['status'],
        url: media.startsWith('http') ? media : `/api/static/${media}`,
      }))
    : [];

  const handleSubmit = async (values: any) => {
    const telegramContent = convertToTelegramHtml(content);

    const formData = {
      ...values,
      content: telegramContent,
      bot: currentRow?._id,
      channel: fixedChannelId, // 主字段：单个频道
      menus: menus.map(({ name, type, url, callback, copy_text, row, style }) => ({
        name,
        type: type || 'url',
        url,
        callback,
        copy_text,
        row: row ?? 1,
        style: style || 'primary',
      })),
      medias,
    };

    if (isEdit) {
      const hide = message.loading('更新中...');
      try {
        const intervalMinutes = timeUnitToMinutes(
          values.interval || 1,
          values.timeUnit as TimeUnit,
        );
        await updateItem(`/channel-posts/${editingRecord._id}`, {
          ...formData,
          interval: intervalMinutes,
          startAt: toISOString(values.startAt),
          endAt: toISOString(values.endAt),
        });
        hide();
        message.success('更新成功');
        onSuccess();
        return true;
      } catch (error: any) {
        hide();
        message.error(error?.response?.data?.message ?? '更新失败，请重试');
        return false;
      }
    }

    const hide = message.loading(<FormattedMessage id="adding" defaultMessage="Adding..." />);
    try {
      const sendType = values.sendType || 'scheduled';
      const interval = timeUnitToMinutes(values.interval || 1, values.timeUnit as TimeUnit);

      // 如果是立即发送，调用 sendChannelPost 接口
      if (sendType === 'immediate') {
        await request(`/bots/${currentRow?._id}/send-channel-post`, {
          method: 'PUT',
          data: {
            title: values.title,
            content: telegramContent,
            medias,
            menus: formData.menus,
            channelId: fixedChannelId,
            isPinned: values.isPinned || false,
          },
        });
      } else {
        // 定时发送，创建记录
        await addItem('/channel-posts', {
          ...formData,
          interval,
          startAt: toISOString(values.startAt),
          endAt: toISOString(values.endAt),
        });
      }

      hide();
      message.success(<FormattedMessage id="add_successful" defaultMessage="添加成功" />);
      onSuccess();
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

  const resetState = () => {
    form.resetFields();
    setContent('');
    setMenus([]);
    setMedias([]);
  };

  return (
    <ModalForm
      title={
        isEdit
          ? intl.formatMessage({ id: 'edit_channel_post', defaultMessage: '编辑频道推广' })
          : intl.formatMessage({ id: 'add_channel_post', defaultMessage: '添加频道推广' })
      }
      open={open}
      form={form}
      modalProps={{
        destroyOnClose: true,
        onCancel: () => {
          resetState();
          onClose();
        },
      }}
      onOpenChange={(visible) => {
        if (!visible) {
          resetState();
          onClose();
        }
      }}
      onFinish={handleSubmit}
      initialValues={{
        interval: 1,
        weight: 0,
        isOnline: true,
        isClearLastPost: false,
        sendType: 'immediate',
        timeUnit: 'hours',
      }}
    >
      {/* 富文本编辑器 */}
      <Form.Item
        label={intl.formatMessage({ id: 'content', defaultMessage: '推广内容' })}
        required
        style={{ marginBottom: 24 }}
      >
        <RichTextEditor
          value={content}
          onChange={setContent}
          placeholder="请输入频道推广内容..."
          height={200}
          variables="groupOnly"
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
          tooltip="发送后将该消息置顶到频道顶部"
        />
      </ProFormGroup>

      <ProFormGroup>
        <ProFormRadio.Group
          name="sendType"
          label={intl.formatMessage({ id: 'send_type', defaultMessage: '发送类型' })}
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
                label={intl.formatMessage({ id: 'interval_time', defaultMessage: '发送间隔' })}
                style={{ marginBottom: 32 }}
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
                    name="interval"
                    width="xs"
                    min={1}
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
                <ProFormDigit
                  name="weight"
                  width="md"
                  label={intl.formatMessage({ id: 'weight', defaultMessage: '权重' })}
                  min={0}
                  tooltip="权重越小越靠前发送"
                />

                <ProFormSwitch
                  name="isOnline"
                  label={intl.formatMessage({ id: 'status', defaultMessage: '启用状态' })}
                  tooltip="是否启用自动发送"
                />

                <ProFormSwitch
                  name="isClearLastPost"
                  label={intl.formatMessage({
                    id: 'clearLastPost',
                    defaultMessage: '清除上条消息',
                  })}
                  tooltip="开启后，发送新消息前会删除上一条消息"
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

      <Form.Item name="bot" hidden>
        <Input value={currentRow?._id} />
      </Form.Item>
    </ModalForm>
  );
};

export default ChannelPostForm;
