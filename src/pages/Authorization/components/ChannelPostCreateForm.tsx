import { useIntl } from '@umijs/max';
import React, { useState } from 'react';
import {
  ModalForm,
  ProFormDigit,
  ProFormGroup,
  EditableProTable,
  ProFormSwitch,
  ProFormRadio,
  ProFormDependency,
  ProFormSelect,
  ProFormCheckbox,
} from '@ant-design/pro-components';
import { Form, Input, message, Space } from 'antd';
import { UploadFile } from 'antd/es/upload/interface';
import { addItem, updateItem } from '@/services/ant-design-pro/api';
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

const ChannelPostCreateForm: React.FC<Props> = ({ open, onOpenChange, currentRow, onSuccess }) => {
  const intl = useIntl();
  const [content, setContent] = useState('');
  const [form] = Form.useForm();
  const [menus, setMenus] = useState<menuItem[]>([]);
  const [medias, setMedias] = useState<string[]>([]);

  // Default file list for showing existing medias
  const defaultMediaFileList: UploadFile[] = medias.map((media, idx) => ({
    uid: String(idx + 1),
    name: `media${idx + 1}`,
    status: 'done' as UploadFile['status'],
    url: media.startsWith('http') ? media : `/api/static/${media}`,
  }));

  const handleSubmit = async (values: any) => {
    const hide = message.loading(<FormattedMessage id="adding" defaultMessage="Adding..." />);
    try {
      const sendType = values.sendType || 'scheduled';
      const telegramContent = convertToTelegramHtml(content);
      const formData = {
        ...values,
        content: telegramContent,
        bot: currentRow?._id,
        menus: menus.map(({ name, url }) => ({ name, url })),
        medias: medias,
        menus_per_row: values.menus_per_row || 1,
      };

      if (sendType === 'immediate') {
        // 立即发送 - 使用 bot 的 send-channel-post 路由
        await updateItem(`/bots/${currentRow?._id}/send-channel-post`, formData);
      } else {
        // 定时发送 - 处理间隔时间
        const interval =
          values.timeUnit === 'hours' ? (values.interval || 1) * 60 : values.interval || 60;
        await addItem('/channel-posts', {
          ...formData,
          interval,
        });
      }

      hide();
      message.success(
        sendType === 'immediate' ? (
          <FormattedMessage id="send_successful" defaultMessage="发送成功" />
        ) : (
          <FormattedMessage id="add_successful" defaultMessage="添加成功" />
        ),
      );
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

  return (
    <ModalForm
      title={intl.formatMessage({ id: 'add_channel_post', defaultMessage: '添加频道推广' })}
      open={open}
      onOpenChange={(visible) => {
        if (!visible) {
          // 关闭时重置状态
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
        interval: 60,
        weight: 0,
        isOnline: true,
        isClearLastPost: false,
        sendType: 'scheduled',
        timeUnit: 'minutes',
        menus_per_row: 1,
      }}
    >
      {/* 富文本编辑器 - 单独占满一行 */}
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
        <ProFormCheckbox.Group
          name="channels"
          width="lg"
          label={intl.formatMessage({ id: 'select_channels', defaultMessage: '选择频道' })}
          rules={[{ required: true, message: '请选择至少一个频道' }]}
          options={
            currentRow?.groups && Array.isArray(currentRow.groups)
              ? currentRow.groups
                  .filter((group: any) => group.type === 'channel')
                  .map((channel: any) => ({
                    label: channel.title,
                    value: channel._id,
                  }))
              : []
          }
        />
      </ProFormGroup>

      <ProFormGroup>
        <Form.Item label={intl.formatMessage({ id: 'media', defaultMessage: '媒体文件' })}>
          <Upload
            onFileUpload={(url: string) => {
              setMedias((prev) => [...prev, url]);
            }}
            accept=".jpg,.jpeg,.png,.gif,.mp4,.avi,.mov,.mkv,.webm"
            defaultFileList={defaultMediaFileList}
            multiple
            onRemove={(file: UploadFile) => {
              const fileUrl = file.url || '';
              const fileName = fileUrl.includes('/api/static/')
                ? fileUrl.replace('/api/static/', '')
                : fileUrl;
              setMedias((prev) => prev.filter((media) => media !== fileName && media !== fileUrl));
              return true;
            }}
          />
        </Form.Item>
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

        <ProFormDigit
          width="md"
          name="menus_per_row"
          label={intl.formatMessage({ id: 'menus_per_row', defaultMessage: '每行菜单数' })}
          min={1}
          tooltip="设置内联菜单每行显示的按钮数量"
        />
      </ProFormGroup>

      <ProFormDependency name={['sendType']}>
        {({ sendType }) =>
          sendType === 'scheduled' && (
            <>
              <ProFormGroup
                label={intl.formatMessage({ id: 'interval_time', defaultMessage: '发送间隔' })}
                style={{ marginBottom: 16 }}
              >
                <Space>
                  <ProFormSelect
                    name="timeUnit"
                    width="xs"
                    options={[
                      {
                        label: intl.formatMessage({ id: 'minutes', defaultMessage: '分钟' }),
                        value: 'minutes',
                      },
                      {
                        label: intl.formatMessage({ id: 'hours', defaultMessage: '小时' }),
                        value: 'hours',
                      },
                    ]}
                    noStyle
                  />
                  <ProFormDigit name="interval" width="xs" min={1} noStyle />
                </Space>
              </ProFormGroup>

              <ProFormGroup>
                <ProFormDigit
                  name="weight"
                  width="md"
                  label={intl.formatMessage({ id: 'weight' })}
                  min={0}
                  tooltip="权重越小越靠前显示"
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

      {/* 菜单配置 */}
      <EditableProTable<menuItem>
        rowKey="_id"
        headerTitle={intl.formatMessage({
          id: 'inline_menu_config',
          defaultMessage: '内联菜单配置',
        })}
        columns={[
          {
            title: intl.formatMessage({ id: 'menuName', defaultMessage: '按钮名称' }),
            dataIndex: 'name',
            formItemProps: {
              rules: [
                {
                  required: true,
                  message: '请输入按钮名称',
                },
              ],
            },
          },
          {
            title: intl.formatMessage({ id: 'url', defaultMessage: '链接地址' }),
            dataIndex: 'url',
            formItemProps: {
              rules: [
                {
                  required: true,
                  message: '请输入链接地址',
                },
              ],
            },
          },
          {
            title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="操作" />,
            valueType: 'option',
            width: 200,
            render: (_, record, __, action) => [
              <a
                key="editable"
                onClick={() => {
                  action?.startEditable?.(`${record._id}`);
                }}
              >
                {intl.formatMessage({ id: 'edit' })}
              </a>,
            ],
          },
        ]}
        value={menus}
        onChange={(value: readonly menuItem[]) => setMenus([...value])}
        editable={{
          type: 'multiple',
        }}
        recordCreatorProps={{
          newRecordType: 'dataSource',
          position: 'bottom',
          record: () => ({
            _id: Date.now().toString(),
            name: '',
            url: '',
          }),
        }}
        size="small"
      />

      {/* 隐藏字段 */}
      <Form.Item name="bot" hidden>
        <Input value={currentRow?._id} />
      </Form.Item>
    </ModalForm>
  );
};

export default ChannelPostCreateForm;
