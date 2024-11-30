import { useIntl } from '@umijs/max';
import React from 'react';
import { ProForm, ProFormSelect, ProFormDigit, ProFormTextArea } from '@ant-design/pro-components';
import { Form, Input } from 'antd';

interface Props {
  newRecord?: boolean;
  onFinish: (formData: any) => Promise<void>;
  values?: any;
}

const BasicForm: React.FC<Props> = ({ newRecord, onFinish, values }) => {
  const intl = useIntl();
  const [formRef] = ProForm.useForm();

  return (
    <ProForm form={formRef} initialValues={values} onFinish={onFinish}>
      <ProForm.Group>
        {/* <ProFormSelect
          name="teacher"
          width="md"
          label={intl.formatMessage({ id: 'teacher' })}
          rules={[{ required: true, message: intl.formatMessage({ id: 'teacher.required' }) }]}
          // 这里需要从后端获取教师列表
          request={async () => {
            // TODO: 实现获取教师列表的逻辑
            return [];
          }}
        /> */}

        <ProFormSelect
          name="lessonType"
          width="md"
          label={intl.formatMessage({ id: 'lessonType' })}
          valueEnum={{
            'Trial Lesson': { text: intl.formatMessage({ id: 'type.trial' }) },
            'Conversational English': {
              text: intl.formatMessage({ id: 'type.conversational' }),
            },
            'Business English': { text: intl.formatMessage({ id: 'type.business' }) },
            'Meeting Preparation': {
              text: intl.formatMessage({ id: 'type.meeting' }),
            },
            'Presentation Skills': {
              text: intl.formatMessage({ id: 'type.presentation' }),
            },
            'Job Application': { text: intl.formatMessage({ id: 'type.job' }) },
            'Interview Preparation': {
              text: intl.formatMessage({ id: 'type.interview' }),
            },
            'Reading and Discussion': {
              text: intl.formatMessage({ id: 'type.reading' }),
            },
          }}
          rules={[{ required: true, message: intl.formatMessage({ id: 'type.required' }) }]}
        />

        <ProFormSelect
          name="language"
          width="md"
          label={intl.formatMessage({ id: 'language' })}
          valueEnum={{
            English: { text: intl.formatMessage({ id: 'language.english' }) },
            'Chinese (Mandarin)': {
              text: intl.formatMessage({ id: 'language.chinese' }),
            },
            Japanese: { text: intl.formatMessage({ id: 'language.japanese' }) },
            French: { text: intl.formatMessage({ id: 'language.french' }) },
            Spanish: { text: intl.formatMessage({ id: 'language.spanish' }) },
          }}
          rules={[
            {
              required: true,
              message: intl.formatMessage({ id: 'language.required' }),
            },
          ]}
        />

        <ProFormTextArea
          name="description"
          width="md"
          label={intl.formatMessage({ id: 'description' })}
          rules={[
            {
              required: true,
              message: intl.formatMessage({ id: 'description.required' }),
            },
            {
              max: 1000,
              message: intl.formatMessage({ id: 'description.maxLength' }),
            },
          ]}
        />

        <ProFormDigit
          name="price"
          width="md"
          label={intl.formatMessage({ id: 'price' })}
          min={0}
          rules={[{ required: true, message: intl.formatMessage({ id: 'price.required' }) }]}
        />

        <ProFormSelect
          name="duration"
          width="md"
          label={intl.formatMessage({ id: 'duration' })}
          valueEnum={{
            30: { text: intl.formatMessage({ id: 'duration.30' }) },
            45: { text: intl.formatMessage({ id: 'duration.45' }) },
            60: { text: intl.formatMessage({ id: 'duration.60' }) },
            90: { text: intl.formatMessage({ id: 'duration.90' }) },
            120: { text: intl.formatMessage({ id: 'duration.120' }) },
          }}
          rules={[
            {
              required: true,
              message: intl.formatMessage({ id: 'duration.required' }),
            },
          ]}
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
