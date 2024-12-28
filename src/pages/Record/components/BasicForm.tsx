import React from 'react';
import { ProForm } from '@ant-design/pro-components';
import { Form, Input } from 'antd';
import TopicSelect from '@/components/topicSelect';
import AnswerSelect from '@/components/AnswerSelect';
import UserSelect from '@/components/usersSelect';

interface Props {
  newRecord?: boolean;
  onFinish: (formData: any) => Promise<void>;
  values?: any;
}

const BasicForm: React.FC<Props> = ({ newRecord, onFinish, values }) => {
  return (
    <ProForm
      initialValues={{
        ...values,
        user: values?.user?._id,
        topic: values?.topic?._id,
        answer: values?.answer?._id,
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
        <TopicSelect />

        <AnswerSelect />

        <UserSelect />
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
