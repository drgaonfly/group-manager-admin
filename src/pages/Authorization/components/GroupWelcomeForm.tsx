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

type menuItem = {
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
  const [menus, setMenus] = useState<menuItem[]>([]);

  useEffect(() => {
    if (open && currentRow?._id) {
      form.resetFields();

      if (currentRow.groupWelcome) {
        const welcomeData = currentRow.groupWelcome;

        form.setFieldsValue({
          contents: welcomeData.contents?.join('\n') || '',
          caption: welcomeData.caption || '',
        });

        setMedias(welcomeData.medias || []);

        // ✅ 和 GroupMessageForm 一样，保证 _id 存在
        setMenus(
          (welcomeData.menus || []).map((item: any, index: number) => ({
            _id: item._id || `${Date.now()}-${index}`,
            name: item.name || item.name || '',
            url: item.url || '',
          })),
        );
      } else {
        form.setFieldsValue({
          contents: '',
          caption: '',
        });
        setMedias([]);
        setMenus([]);
      }
    }
  }, [open, currentRow, form]);

  const defaultMediaFileList: UploadFile[] = medias.map((url, idx) => ({
    uid: `${idx + 1}`,
    name: `media${idx + 1}`,
    status: 'done',
    url,
  }));

  // ✅ columns 完全按 GroupMessageForm
  const menuColumns: ProColumns<menuItem>[] = [
    {
      title: intl.formatMessage({ id: 'name', defaultMessage: '按钮' }),
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
      title: intl.formatMessage({ id: 'url', defaultMessage: '菜单链接' }),
      dataIndex: 'url',
      formItemProps: {
        rules: [
          {
            required: true,
            message: intl.formatMessage({
              id: 'url_required',
              defaultMessage: '请输入菜单链接',
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
            action?.startEditable?.(`${record._id}`);
          }}
        >
          {intl.formatMessage({ id: 'edit', defaultMessage: '编辑' })}
        </a>,
      ],
    },
  ];

  const handleSubmit = async (values: any) => {
    try {
      const hide = message.loading(
        <FormattedMessage id="updating" defaultMessage="Updating..." />,
      );

      const groupWelcomeData = {
        contents: values.contents
          ? values.contents.split('\n').filter((v: string) => v.trim())
          : [],
        caption: values.caption || '',
        medias,
        menus: menus.map(({ name, url }) => ({ name, url })),
      };

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
          <FormattedMessage
            id="update_failed"
            defaultMessage="Update failed, please try again"
          />
        ),
      );
      return false;
    }
  };

  return (
    <ModalForm
      title={intl.formatMessage({
        id: 'group_welcome_config',
        defaultMessage: '群欢迎配置',
      })}
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
          width="xl"
          fieldProps={{ autoSize: { minRows: 6 } }}
        />

        <ProFormTextArea
          name="caption"
          label={intl.formatMessage({ id: 'media_caption', defaultMessage: '媒体说明' })}
          width="xl"
          fieldProps={{ autoSize: { minRows: 3 } }}
        />

        <Form.Item label={intl.formatMessage({ id: 'welcome_medias', defaultMessage: '欢迎媒体' })}>
          <Upload
            onFileUpload={(url: string, signedUrl?: string) => {
              setMedias((prev) => [...prev, signedUrl || url]);
            }}
            accept=".jpg,.jpeg,.png,.gif,.mp4,.mov"
            defaultFileList={defaultMediaFileList}
            multiple
            onRemove={(file: UploadFile) => {
              setMedias((prev) => prev.filter((m) => m !== file.url));
              return true;
            }}
          />
        </Form.Item>
      </ProFormGroup>

      {/* ✅ EditableProTable 完全照 GroupMessageForm */}
      <EditableProTable<menuItem>
        rowKey="_id"
        name="menus"
        headerTitle={intl.formatMessage({
          id: 'welcome_menu_config',
          defaultMessage: '欢迎菜单配置',
        })}
        columns={menuColumns}
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
      />
    </ModalForm>
  );
};

export default GroupWelcomeForm;
