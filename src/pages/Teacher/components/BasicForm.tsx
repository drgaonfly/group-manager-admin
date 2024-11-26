import { useIntl } from '@umijs/max';
import React from 'react';
import { ProForm, ProFormText, ProFormSelect, ProFormDigit } from '@ant-design/pro-components';
import { Form, Input } from 'antd';

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
          rules={[{ required: true, message: intl.formatMessage({ id: 'enter_username' }) }]}
          width="md"
          label={intl.formatMessage({ id: 'username' })}
          name="username"
        />

        <ProFormText
          rules={[
            { required: true, message: intl.formatMessage({ id: 'enter_email' }) },
            { type: 'email', message: intl.formatMessage({ id: 'invalid_email' }) },
          ]}
          width="md"
          label={intl.formatMessage({ id: 'email' })}
          name="email"
        />

        <ProFormText width="md" label={intl.formatMessage({ id: 'phone' })} name="phone" />

        <ProFormText width="md" label={intl.formatMessage({ id: 'address' })} name="address" />

        {/* <ProFormSelect
          name="subject"
          width="md"
          label={intl.formatMessage({ id: 'pages.teacher.subject' })}
          mode="multiple"
          rules={[{ required: true, message: intl.formatMessage({ id: 'pages.teacher.subject.required' }) }]}
        /> */}

        <ProFormSelect
          name="education"
          width="md"
          label={intl.formatMessage({ id: 'pages.teacher.education' })}
          valueEnum={{
            bachelor: {
              text: intl.formatMessage({ id: 'pages.teacher.education.bachelor' }),
            },
            master: {
              text: intl.formatMessage({ id: 'pages.teacher.education.master' }),
            },
            doctor: {
              text: intl.formatMessage({ id: 'pages.teacher.education.doctor' }),
            },
            other: {
              text: intl.formatMessage({ id: 'pages.teacher.education.other' }),
            },
          }}
          rules={[
            {
              required: true,
              message: intl.formatMessage({ id: 'pages.teacher.education.required' }),
            },
          ]}
        />

        <ProFormDigit
          name="teachingAge"
          width="md"
          label={intl.formatMessage({ id: 'pages.teacher.teachingAge' })}
          min={0}
          rules={[
            {
              required: true,
              message: intl.formatMessage({ id: 'pages.teacher.teachingAge.required' }),
            },
          ]}
        />

        <ProFormSelect
          name="title"
          width="md"
          label={intl.formatMessage({ id: 'pages.teacher.title' })}
          valueEnum={{
            teacher: {
              text: intl.formatMessage({ id: 'pages.teacher.title.teacher' }),
            },
            gradeDirector: {
              text: intl.formatMessage({ id: 'pages.teacher.title.gradeDirector' }),
            },
            groupLeader: {
              text: intl.formatMessage({ id: 'pages.teacher.title.groupLeader' }),
            },
            viceDirector: {
              text: intl.formatMessage({ id: 'pages.teacher.title.viceDirector' }),
            },
            director: {
              text: intl.formatMessage({ id: 'pages.teacher.title.director' }),
            },
          }}
          rules={[
            { required: true, message: intl.formatMessage({ id: 'pages.teacher.title.required' }) },
          ]}
        />

        <ProFormSelect
          name="status"
          width="md"
          initialValue="active"
          label={intl.formatMessage({ id: 'status' })}
          valueEnum={{
            active: {
              text: intl.formatMessage({ id: 'active' }),
              status: 'Success',
            },
            inactive: {
              text: intl.formatMessage({ id: 'inactive' }),
              status: 'Error',
            },
          }}
          rules={[{ required: true, message: intl.formatMessage({ id: 'please_select_status' }) }]}
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
