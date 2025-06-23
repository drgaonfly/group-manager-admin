import { message, Form, Space } from 'antd';
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
  ProFormSelect,
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
          intervalTime:
            values.timeUnit === 'minutes'
              ? Number((values.intervalTime / 60).toFixed(2))
              : values.intervalTime,
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
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: 'please_input_message',
                defaultMessage: 'Please input message content',
              }),
            },
          ]}
          width="md"
        />

        <Form.Item label={intl.formatMessage({ id: 'image' })}>
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
        {currentRow?.groups?.length > 0 ? (
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

        <ProFormGroup
          title={intl.formatMessage({ id: 'interval_time', defaultMessage: 'Interval Time' })}
          size={8}
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
      </ProFormGroup>
    </ModalForm>
  );
};

export default GroupMessageForm;
