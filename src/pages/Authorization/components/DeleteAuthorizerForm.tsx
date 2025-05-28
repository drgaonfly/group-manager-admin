import React, { useState, useEffect } from 'react';
import { useIntl } from '@umijs/max';
import { Form, Input, message, Select } from 'antd';
import { FormattedMessage } from '@umijs/max';
import { ModalForm } from '@ant-design/pro-components';
import { updateItem } from '@/services/ant-design-pro/api';

interface DeleteAuthorizerFormProps {
  open: boolean;
  onCancel: (visible: boolean) => void;
  values: any;
  onSuccess: () => void;
}

const DeleteAuthorizerForm: React.FC<DeleteAuthorizerFormProps> = (props) => {
  const { open, onCancel, values, onSuccess } = props;
  const intl = useIntl();
  const [form] = Form.useForm();
  const [authorizers, setAuthorizers] = useState<string[]>([]);

  // 当values变化时，更新authorizers列表
  useEffect(() => {
    if (values && values.authorized_users && Array.isArray(values.authorized_users)) {
      setAuthorizers(values.authorized_users);
    } else {
      setAuthorizers([]);
    }
  }, [values]);

  const handleDeleteAuthorizer = async (formValues: { authorizer: string }) => {
    const hide = message.loading(<FormattedMessage id="deleting" defaultMessage="Deleting..." />);
    try {
      // 调用API删除authorizer
      await updateItem(`/bots/${values._id}/delete-authorizer`, {
        authorizer: formValues.authorizer,
        id: values._id,
      });
      hide();
      message.success(
        <FormattedMessage id="delete_successful" defaultMessage="Deleted successfully" />,
      );
      onSuccess(); // 刷新列表
      return true;
    } catch (error: any) {
      hide();
      message.error(
        error?.response?.data?.message ?? (
          <FormattedMessage id="delete_failed" defaultMessage="Delete failed, please try again!" />
        ),
      );
      return false;
    }
  };

  return (
    <ModalForm
      title={intl.formatMessage({ id: 'delete_authorizer', defaultMessage: '删除授权人' })}
      width="500px"
      form={form}
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      open={open}
      onOpenChange={onCancel}
      onFinish={async (formValues) => {
        const success = await handleDeleteAuthorizer(formValues as { authorizer: string });
        if (success) {
          onCancel(false);
          form.resetFields();
        }
        return success;
      }}
    >
      <Form.Item
        name="authorizer"
        label={intl.formatMessage({ id: 'authorizer', defaultMessage: '授权人' })}
        rules={[
          {
            required: true,
            message: intl.formatMessage({
              id: 'select_authorizer_required',
              defaultMessage: '请选择要删除的授权人',
            }),
          },
        ]}
      >
        <Select
          placeholder={intl.formatMessage({
            id: 'select_authorizer',
            defaultMessage: '请选择要删除的授权人',
          })}
          options={authorizers.map((authorizer) => ({ label: authorizer, value: authorizer }))}
          notFoundContent={intl.formatMessage({
            id: 'no_authorizers',
            defaultMessage: '没有可删除的授权人',
          })}
        />
      </Form.Item>

      <Form.Item name="_id" hidden initialValue={values._id}>
        <Input type="hidden" />
      </Form.Item>
    </ModalForm>
  );
};

export default DeleteAuthorizerForm;
