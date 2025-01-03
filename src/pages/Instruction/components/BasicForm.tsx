import { FormattedMessage, useIntl } from '@umijs/max';
import React from 'react';
import { ProForm, ProFormText } from '@ant-design/pro-components';
import { Form, Input } from 'antd';
import ReactQuill from 'react-quill';

interface Props {
  newRecord?: boolean;
  onFinish: (formData: any) => Promise<void>;
  values?: any;
}

const BasicForm: React.FC<Props> = ({ newRecord, onFinish, values }) => {
  const intl = useIntl();

  const [form] = Form.useForm();
  //表单初始化filteredRoles数据更新时，确保表单中的角色选择能加载出来

  return (
    <ProForm
      form={form}
      initialValues={{
        ...values,
      }}
      onFinish={async (values) => {
        await onFinish({
          ...values,
        });
      }}
      submitter={{
        render: (props, dom) => {
          return (
            <div style={{ textAlign: 'right' }}>
              {dom.map((button, index) => (
                <span key={index} style={{ marginLeft: 8 }}>
                  {button}
                </span>
              ))}
            </div>
          );
        },
      }}
    >
      <ProForm.Group>
        <ProFormText
          rules={[{ required: false }]}
          width="md"
          label={<FormattedMessage id="instruction.title" defaultMessage="标题" />}
          name="title"
          placeholder={intl.formatMessage({
            id: 'instruction.title',
            defaultMessage: '请输入标题',
          })}
        />

        <ProForm.Item
          label={<FormattedMessage id="instruction.content" defaultMessage="内容" />}
          name="content"
        >
          <ReactQuill placeholder="请输入内容" style={{ height: '200px', marginBottom: '50px' }} />
        </ProForm.Item>
      </ProForm.Group>

      {!newRecord && (
        <Form.Item name="_id" label={false}>
          <Input type="hidden" />
        </Form.Item>
      )}
    </ProForm>
  );
};

export default BasicForm;
