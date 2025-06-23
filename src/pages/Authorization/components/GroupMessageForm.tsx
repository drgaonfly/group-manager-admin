import { message, Form } from 'antd';
import { FormattedMessage, useIntl } from '@umijs/max';
import { useState, useEffect } from 'react';
import { UploadFile } from 'antd/es/upload/interface';
import { addItem } from '@/services/ant-design-pro/api';
import Upload from '@/components/Upload';
import {
  ModalForm,
  ProFormTextArea,
  ProFormGroup,
  ProFormDigit,
  ProFormCheckbox,
} from '@ant-design/pro-components';

const handleAdd = async (data: any) => {
  const hide = message.loading(<FormattedMessage id="adding" defaultMessage="Adding..." />);

  try {
    await addItem('/group-messages', data);
    hide();
    message.success(<FormattedMessage id="add_successful" defaultMessage="Added successfully" />);
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

interface GroupMessageFormProps {
  open: boolean;
  onCancel: (visible: boolean) => void;
  currentRow?: any;
}

const GroupMessageForm: React.FC<GroupMessageFormProps> = ({ open, onCancel, currentRow }) => {
  const intl = useIntl();
  const [imageUrl, setImageUrl] = useState<string>('');
  const [form] = Form.useForm();

  useEffect(() => {
    if (open && currentRow?._id) {
      form.resetFields();
      setImageUrl('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentRow]);

  // Default file list for showing existing image
  const defaultImageFileList = imageUrl
    ? [
        {
          uid: '1',
          name: 'image',
          status: 'done' as UploadFile['status'],
          url: imageUrl,
        },
      ]
    : [];

  return (
    <ModalForm
      title={intl.formatMessage({ id: 'add_group_message', defaultMessage: 'Add Group Message' })}
      open={open}
      form={form}
      modalProps={{
        destroyOnClose: true,
        onCancel: () => onCancel(false),
      }}
      onFinish={async (values: any) => {
        const data = {
          content: values.message,
          bot: currentRow?._id,
          intervalTime: values.intervalTime || 0,
          groups: values.groups || [],
          image: imageUrl,
        };
        const success = await handleAdd(data);
        if (success) {
          form.resetFields();
          setImageUrl('');
          onCancel(false);
        }
        return success;
      }}
    >
      <ProFormGroup>
        <ProFormTextArea
          name="message"
          label={intl.formatMessage({ id: 'content', defaultMessage: 'Message Content' })}
          required
          width="md"
        />

        <Form.Item required label={intl.formatMessage({ id: 'image' })}>
          <Upload
            onFileUpload={(url: string, signedUrl?: string) => {
              setImageUrl(signedUrl || url);
            }}
            accept=".jpg,.jpeg,.png,.gif"
            defaultFileList={defaultImageFileList}
          />
        </Form.Item>
      </ProFormGroup>

      <ProFormGroup>
        {currentRow?.groups.length > 0 ? (
          <ProFormCheckbox.Group
            name="groups"
            width="md"
            label={intl.formatMessage({ id: 'select_groups', defaultMessage: 'Select Groups' })}
            options={currentRow.groups.map((group: any) => ({
              label: group.title,
              value: group._id,
            }))}
          />
        ) : (
          <ProFormCheckbox
            width="md"
            label={intl.formatMessage({
              id: 'no_groups_joined',
              defaultMessage: 'No groups joined',
            })}
            disabled
          />
        )}

        <ProFormDigit
          name="intervalTime"
          width="md"
          label={intl.formatMessage({
            id: 'interval_time_hour',
            defaultMessage: 'Interval Time (hours)',
          })}
          min={0}
          fieldProps={{ style: { width: '100%' } }}
        />
      </ProFormGroup>
    </ModalForm>
  );
};

export default GroupMessageForm;
