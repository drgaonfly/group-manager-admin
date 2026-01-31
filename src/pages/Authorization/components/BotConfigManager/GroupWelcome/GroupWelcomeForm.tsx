import { message, Form } from 'antd';
import { FormattedMessage, useIntl } from '@umijs/max';
import { useState, useEffect } from 'react';
import { UploadFile } from 'antd/es/upload/interface';
import { updateItem } from '@/services/ant-design-pro/api';
import Upload from '@/components/Upload';
import RichTextEditor, { convertToTelegramHtml, toQuillHtml } from '@/components/RichTextEditor';
import {
  ModalForm,
  ProFormGroup,
  ProColumns,
  EditableProTable,
  ProFormDigit,
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
  onSuccess?: (updatedBot?: any) => void;
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
  const [content, setContent] = useState('');
  const [caption, setCaption] = useState('');

  useEffect(() => {
    if (open && currentRow?._id) {
      form.resetFields();

      if (currentRow.groupWelcome) {
        const welcomeData = currentRow.groupWelcome;
        const formattedMenus = (welcomeData.menus || []).map((item: any, index: number) => ({
          _id: item._id || `${Date.now()}-${index}`,
          name: item.name || '',
          url: item.url || '',
        }));

        // 设置内容
        setContent(toQuillHtml(welcomeData.contents?.join('\n') || ''));
        setCaption(toQuillHtml(welcomeData.caption || ''));
        setMedias(welcomeData.medias || []);
        setMenus(formattedMenus);

        // 设置阅后即焚时间
        form.setFieldsValue({
          deleteAfterSeconds: welcomeData.deleteAfterSeconds || 0,
        });
      } else {
        setContent('');
        setCaption('');
        setMedias([]);
        setMenus([]);
        form.setFieldsValue({
          deleteAfterSeconds: 0,
        });
      }
    }
  }, [open, currentRow, form]);

  const defaultMediaFileList: UploadFile[] = medias.map((url, idx) => ({
    uid: `${idx + 1}`,
    name: `media${idx + 1}`,
    status: 'done',
    url,
  }));

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
            message: intl.formatMessage({ id: 'url_required', defaultMessage: '请输入菜单链接' }),
          },
        ],
      },
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="操作" />,
      valueType: 'option',
      width: 150,
      render: (_, record, __, action) => [
        <a
          key="editable"
          onClick={() => {
            action?.startEditable?.(record._id);
          }}
        >
          {intl.formatMessage({ id: 'edit', defaultMessage: '编辑' })}
        </a>,
      ],
    },
  ];

  const handleSubmit = async () => {
    try {
      const hide = message.loading(<FormattedMessage id="updating" defaultMessage="Updating..." />);

      const telegramContent = convertToTelegramHtml(content);
      const telegramCaption = convertToTelegramHtml(caption);
      const formValues = form.getFieldsValue();

      const groupWelcomeData = {
        contents: telegramContent
          ? telegramContent.split('\n').filter((v: string) => v.trim())
          : [],
        caption: telegramCaption || '',
        medias,
        menus: menus.map(({ name, url }) => ({ name, url })),
        deleteAfterSeconds: formValues.deleteAfterSeconds || 0,
      };

      // 使用专门的群欢迎更新接口
      const response: any = await updateItem(
        `/bots/${currentRow._id}/group-welcome`,
        groupWelcomeData,
      );

      hide();
      message.success(
        <FormattedMessage id="update_successful" defaultMessage="Update successful" />,
      );

      form.resetFields();
      setContent('');
      setCaption('');
      setMedias([]);
      setMenus([]);
      onCancel(false);
      // 传递更新后的 bot 数据，便于刷新 currentRow 中的 groupWelcome
      onSuccess?.(response?.data);

      return true;
    } catch (error: any) {
      console.error('更新失败:', error);
      message.error(
        error?.response?.data?.message ?? (
          <FormattedMessage id="update_failed" defaultMessage="Update failed" />
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
      {/* 富文本编辑器 - 单独占满一行 */}
      <Form.Item
        label={intl.formatMessage({ id: 'welcome_message', defaultMessage: '欢迎消息' })}
        style={{ marginBottom: 24 }}
      >
        <RichTextEditor
          value={content}
          onChange={setContent}
          placeholder="请输入欢迎消息..."
          height={150}
          variables="withUser"
        />
      </Form.Item>

      <Form.Item
        label={intl.formatMessage({ id: 'media_caption', defaultMessage: '媒体说明' })}
        style={{ marginBottom: 24 }}
      >
        <RichTextEditor
          value={caption}
          onChange={setCaption}
          placeholder="请输入媒体说明..."
          height={100}
          variables="withUser"
        />
      </Form.Item>

      <ProFormGroup>
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

        <ProFormDigit
          name="deleteAfterSeconds"
          label={intl.formatMessage({
            id: 'delete_after_seconds',
            defaultMessage: '阅后即焚（秒）',
          })}
          tooltip="设置消息发送后多少秒自动删除，0表示不删除"
          fieldProps={{
            min: 0,
            precision: 0,
            addonAfter: '秒',
          }}
          placeholder="0"
          width="md"
        />
      </ProFormGroup>

      <EditableProTable<menuItem>
        rowKey="_id"
        headerTitle={intl.formatMessage({
          id: 'welcome_menu_config',
          defaultMessage: '欢迎菜单配置',
        })}
        columns={menuColumns}
        value={menus}
        onChange={(value) => setMenus([...value])}
        recordCreatorProps={{
          newRecordType: 'dataSource',
          position: 'bottom',
          record: () => ({
            _id: Date.now().toString(),
            name: '',
            url: '',
          }),
        }}
        editable={{
          type: 'multiple',
        }}
      />
    </ModalForm>
  );
};

export default GroupWelcomeForm;
