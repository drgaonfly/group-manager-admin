import { message, Form } from 'antd';
import { FormattedMessage, useIntl } from '@umijs/max';
import { useState, useEffect } from 'react';
import { UploadFile } from 'antd/es/upload/interface';
import { updateItem } from '@/services/ant-design-pro/api';
import Upload from '@/components/Upload';
import {
  ModalForm,
  ProFormTextArea,
  ProFormGroup,
  ProColumns,
  EditableProTable,
} from '@ant-design/pro-components';

type MenuItem = {
  _id: string;
  name: string;
  url: string;
};

interface GroupWelcomeFormProps {
  open: boolean;
  onCancel: (visible: boolean) => void;
  currentRow?: any;
  onSuccess?: () => void;
}

const GroupWelcomeForm: React.FC<GroupWelcomeFormProps> = ({
  open,
  onCancel,
  currentRow,
  onSuccess,
}) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const [medias, setMedias] = useState<string[]>([]);
  const [menus, setMenus] = useState<MenuItem[]>([]);

  useEffect(() => {
    if (open && currentRow?._id) {
      form.resetFields();

      // 设置现有的群欢迎数据
      if (currentRow.groupWelcome) {
        const welcomeData = currentRow.groupWelcome;
        form.setFieldsValue({
          contents: welcomeData.contents?.join('\n') || '',
          caption: welcomeData.caption || '',
        });
        setMedias(welcomeData.medias || []);
        setMenus(welcomeData.menus || []);
      } else {
        // 如果没有群欢迎数据，重置表单
        form.setFieldsValue({
          contents: '',
          caption: '',
        });
        setMedias([]);
        setMenus([]);
      }
    }
  }, [open, currentRow, form]);

  // Default file list for showing existing medias
  const defaultMediaFileList: UploadFile[] = medias
    ? medias.filter(Boolean).map((url, idx) => ({
        uid: `${idx + 1}`,
        name: `media${idx + 1}`,
        status: 'done' as UploadFile['status'],
        url,
      }))
    : [];

  const menuColumns: ProColumns<MenuItem>[] = [
    {
      title: intl.formatMessage({ id: 'menuName', defaultMessage: '按钮名称' }),
      dataIndex: 'name',
      formItemProps: {
        rules: [
          {
            required: true,
            message: intl.formatMessage({
              id: 'menu_name_required',
              defaultMessage: '请输入按钮名称',
            }),
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
            message: intl.formatMessage({ id: 'url_required', defaultMessage: '请输入链接地址' }),
          },
          {
            type: 'url',
            message: intl.formatMessage({
              id: 'url_format_error',
              defaultMessage: '请输入正确的URL格式',
            }),
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
            action?.startEditable?.(record._id);
          }}
        >
          {intl.formatMessage({ id: 'edit' })}
        </a>,
      ],
    },
  ];

  const handleSubmit = async (values: any) => {
    try {
      const hide = message.loading(<FormattedMessage id="updating" defaultMessage="Updating..." />);

      // 构建群欢迎数据
      const groupWelcomeData = {
        contents: values.contents
          ? values.contents.split('\n').filter((line: string) => line.trim())
          : [],
        caption: values.caption || '',
        medias: medias,
        menus: menus.map(({ name, url }) => ({ name, url })),
      };

      // 更新机器人的群欢迎配置
      await updateItem(`/bots/${currentRow._id}`, {
        groupWelcome: groupWelcomeData,
      });

      hide();
      message.success(
        <FormattedMessage id="update_successful" defaultMessage="Update successful" />,
      );

      form.resetFields();
      setMedias([]);
      setMenus([]);
      onCancel(false);
      onSuccess?.();

      return true;
    } catch (error: any) {
      message.error(
        error?.response?.data?.message ?? (
          <FormattedMessage id="update_failed" defaultMessage="Update failed, please try again!" />
        ),
      );
      return false;
    }
  };

  return (
    <ModalForm
      title={intl.formatMessage({ id: 'group_welcome_config', defaultMessage: '群欢迎配置' })}
      open={open}
      form={form}
      width={800}
      modalProps={{
        destroyOnClose: true,
        onCancel: () => onCancel(false),
      }}
      onFinish={handleSubmit}
    >
      <ProFormGroup>
        <ProFormTextArea
          name="contents"
          label={intl.formatMessage({ id: 'welcome_message', defaultMessage: '欢迎消息' })}
          placeholder={intl.formatMessage({
            id: 'welcome_message_placeholder',
            defaultMessage: '请输入欢迎消息内容，每行一条消息\n可使用变量：{username} {memberName}',
          })}
          width="xl"
          fieldProps={{
            autoSize: { minRows: 6, maxRows: 10 },
          }}
          extra={intl.formatMessage({
            id: 'welcome_message_tip',
            defaultMessage:
              '每行一条消息，支持多条消息。可使用变量：{username}（@用户名）、{memberName}（真实姓名）',
          })}
        />

        <ProFormTextArea
          name="caption"
          label={intl.formatMessage({ id: 'media_caption', defaultMessage: '媒体说明' })}
          placeholder={intl.formatMessage({
            id: 'media_caption_placeholder',
            defaultMessage: '请输入媒体文件的说明文字\n可使用变量：{username} {memberName}',
          })}
          width="xl"
          fieldProps={{
            autoSize: { minRows: 3, maxRows: 6 },
          }}
          extra={intl.formatMessage({
            id: 'media_caption_tip',
            defaultMessage:
              '此文字将作为媒体文件的说明显示。可使用变量：{username}（@用户名）、{memberName}（真实姓名）',
          })}
        />

        <Form.Item
          label={intl.formatMessage({ id: 'welcome_medias', defaultMessage: '欢迎媒体' })}
          extra={intl.formatMessage({
            id: 'welcome_medias_tip',
            defaultMessage: '支持多个图片、视频等媒体文件',
          })}
        >
          <Upload
            onFileUpload={(url: string, signedUrl?: string) => {
              setMedias((prev) => [...prev, signedUrl || url]);
            }}
            accept=".jpg,.jpeg,.png,.gif,.mp4,.mov"
            defaultFileList={defaultMediaFileList}
            multiple
            onRemove={(file: UploadFile) => {
              setMedias((prev) => prev.filter((media) => media !== file.url));
              return true;
            }}
          />
        </Form.Item>
      </ProFormGroup>

      <EditableProTable<MenuItem>
        rowKey="_id"
        headerTitle={intl.formatMessage({
          id: 'welcome_menu_config',
          defaultMessage: '欢迎菜单配置',
        })}
        columns={menuColumns}
        value={menus}
        onChange={(value: readonly MenuItem[]) => setMenus([...value])}
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
      />
    </ModalForm>
  );
};

export default GroupWelcomeForm;
