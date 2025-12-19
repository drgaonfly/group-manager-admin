import React from 'react';
import { useIntl } from '@umijs/max';
import { Form, Input, message } from 'antd';
import { FormattedMessage } from '@umijs/max';
import { ModalForm, ProFormText } from '@ant-design/pro-components';
import { updateItem } from '@/services/ant-design-pro/api';

interface AddAuthorizerFormProps {
  open: boolean;
  onCancel: (visible: boolean) => void;
  values: any;
  onSuccess: () => void;
}

const AddAuthorizerForm: React.FC<AddAuthorizerFormProps> = (props) => {
  const { open, onCancel, values, onSuccess } = props;
  const intl = useIntl();
  const [form] = Form.useForm();

  const handleAddAuthorizer = async (formValues: { authorizer: string }) => {
    const hide = message.loading(<FormattedMessage id="adding" defaultMessage="Adding..." />);
    try {
      // 调用API添加authorizer
      await updateItem(`/bots/${values._id}/add-authorizer`, {
        authorizer: formValues.authorizer,
        id: values._id,
      });
      hide();
      message.success(<FormattedMessage id="add_successful" defaultMessage="Added successfully" />);
      onSuccess(); // 刷新列表
      return true;
    } catch (error: any) {
      hide();
      message.error(
        error?.response?.data?.message ?? (
          <FormattedMessage id="add_failed" defaultMessage="Add failed, please try again!" />
        ),
      );
      return false;
    }
  };

  return (
    <ModalForm
      title={intl.formatMessage({ id: 'add_authorizer', defaultMessage: '添加授权人' })}
      width="500px"
      form={form}
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      open={open}
      onOpenChange={onCancel}
      onFinish={async (formValues) => {
        const success = await handleAddAuthorizer(formValues as { authorizer: string });
        if (success) {
          onCancel(false);
          form.resetFields();
        }
        return success;
      }}
    >
      <ProFormText
        name="authorizer"
        label={intl.formatMessage({ id: 'authorizer', defaultMessage: '授权人' })}
        placeholder={intl.formatMessage({
          id: 'enter_authorizer',
          defaultMessage: '用户名',
        })}
        rules={[
          {
            required: true,
            message: intl.formatMessage({
              id: 'enter_authorizer_required',
              defaultMessage: '用户名',
            }),
          },
        ]}
      />

      <Form.Item name="_id" hidden initialValue={values._id}>
        <Input type="hidden" />
      </Form.Item>
    </ModalForm>
  );
};

export default AddAuthorizerForm;
