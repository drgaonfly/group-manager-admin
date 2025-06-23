import { Modal, Form, Input, message, Alert, InputNumber, Checkbox, Row, Col } from 'antd';
import { FormattedMessage, useIntl } from '@umijs/max';
import { request } from '@umijs/max';
import { useState, useEffect } from 'react';
import { UploadFile } from 'antd/es/upload/interface';
import { addItem } from '@/services/ant-design-pro/api';
import Upload from '@/components/Upload';

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
  const [form] = Form.useForm();
  const intl = useIntl();
  const [groups, setGroups] = useState<any[]>([]);
  const [imageUrl, setImageUrl] = useState<string>('');

  const fetchGroups = async () => {
    try {
      const response = await request('/groups', {
        method: 'GET',
        params: { bot: currentRow?._id },
      });
      setGroups(response.data || []);
    } catch (error) {
      console.error('Failed to fetch groups:', error);
      message.error(
        intl.formatMessage({ id: 'fetch_groups_failed', defaultMessage: 'Failed to load groups' }),
      );
    }
  };

  // Fetch groups when form opens
  useEffect(() => {
    if (open && currentRow?._id) {
      fetchGroups();
      // Reset form and state when opening
      form.resetFields();
      setImageUrl('');
    }
  }, [open, currentRow]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Ensure we're sending data exactly as the backend model requires
      if (!values.message) {
        message.error('Message content is required');
        return;
      }

      if (!currentRow?._id) {
        message.error('Bot ID is missing');
        return;
      }

      // Create data object for submission
      const data: {
        content: string;
        bot: string;
        intervalTime: number;
        isRealTime: boolean;
        groups: string[];
        image?: string;
      } = {
        content: values.message,
        bot: currentRow._id,
        intervalTime: values.intervalTime || 0,
        isRealTime: values.isRealTime || false,
        groups: values.groups || [],
        image: imageUrl,
      };

      // Add image URL if available
      if (imageUrl) {
        data.image = imageUrl;
      }

      console.log('Submitting data:', data);

      const success = await handleAdd(data);

      if (success) {
        form.resetFields();
        setImageUrl('');
        onCancel(false);
      }
    } catch (error) {
      console.log('Validation failed:', error);
    }
  };

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
    <Modal
      title={intl.formatMessage({ id: 'add_group_message', defaultMessage: 'Add Group Message' })}
      open={open}
      onOk={handleSubmit}
      onCancel={() => onCancel(false)}
      destroyOnClose
      width={600}
    >
      <Alert
        message={intl.formatMessage({
          id: 'group_message_info',
          defaultMessage: 'This message will be sent to the selected groups.',
        })}
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
      <Form form={form} layout="vertical">
        <Form.Item
          name="message"
          label={intl.formatMessage({ id: 'message_content', defaultMessage: 'Message Content' })}
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: 'please_input_message',
                defaultMessage: 'Please input message content',
              }),
            },
          ]}
        >
          <Input.TextArea
            rows={4}
            placeholder={intl.formatMessage({
              id: 'message_placeholder',
              defaultMessage: 'Please input message content',
            })}
          />
        </Form.Item>

        <Form.Item
          name="image"
          label={intl.formatMessage({ id: 'image', defaultMessage: 'Image' })}
        >
          <Upload
            onFileUpload={(url: string, signedUrl?: string) => {
              console.log('Uploaded image URL:', url);
              setImageUrl(signedUrl || url);
            }}
            accept=".jpg,.jpeg,.png,.gif"
            defaultFileList={defaultImageFileList}
          />
        </Form.Item>

        <Form.Item
          name="groups"
          label={intl.formatMessage({ id: 'select_groups', defaultMessage: 'Select Groups' })}
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: 'please_select_groups',
                defaultMessage: 'Please select at least one group',
              }),
            },
          ]}
        >
          <Checkbox.Group style={{ width: '100%' }}>
            <Row>
              {groups.map((group) => (
                <Col span={8} key={group.id}>
                  <Checkbox value={group._id}>{group.title}</Checkbox>
                </Col>
              ))}
            </Row>
          </Checkbox.Group>
        </Form.Item>

        <Form.Item
          name="intervalTime"
          label={intl.formatMessage({
            id: 'interval_time_hour',
            defaultMessage: 'Interval Time (hours)',
          })}
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item valuePropName="checked">
          <Checkbox name="isRealtime">
            {intl.formatMessage({ id: 'is_real_time', defaultMessage: 'Send in real time' })}
          </Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default GroupMessageForm;
