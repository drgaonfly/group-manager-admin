import React from 'react';
import { ProForm, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { Form, Input } from 'antd';
import TopicSelect from '@/components/topicSelect';
import AnswerSelect from '@/components/AnswerSelect';
import UserSelect from '@/components/usersSelect';
import { useIntl } from '@umijs/max';
interface Props {
  newRecord?: boolean;
  onFinish: (formData: any) => Promise<void>;
  values?: any;
}

const BasicForm: React.FC<Props> = ({ newRecord, onFinish, values }) => {
  const intl = useIntl();

  return (
    <ProForm
      initialValues={{
        ...values,
        user: values?.user?._id,
        answer: values?.answer?._id,
        topic: values?.topic?._id,
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

        <ProFormSelect
          name="issue"
          label={intl.formatMessage({ id: 'issue' })}
          width="md"
          valueEnum={{
            normal: { text: intl.formatMessage({ id: 'issue.normal', defaultMessage: 'Normal' }) },
            unfriendly: {
              text: intl.formatMessage({ id: 'issue.unfriendly', defaultMessage: 'Unfriendly' }),
            },
            recogError: {
              text: intl.formatMessage({
                id: 'issue.recogError',
                defaultMessage: 'Recognition Error',
              }),
            },
            videoError: {
              text: intl.formatMessage({ id: 'issue.videoError', defaultMessage: 'Video Error' }),
            },
          }}
        />

        <ProFormText
          name="answerCount"
          label={intl.formatMessage({ id: 'answerCount' })}
          width="md"
        />

        <ProFormSelect
          name="status"
          label={intl.formatMessage({ id: 'comment' })}
          width="md"
          valueEnum={{
            正在: { text: intl.formatMessage({ id: 'status.doing' }) },
            答对: { text: intl.formatMessage({ id: 'status.right' }) },
            答错: { text: intl.formatMessage({ id: 'status.wrong' }) },
          }}
        />
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
