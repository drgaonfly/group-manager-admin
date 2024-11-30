import { useIntl } from '@umijs/max';
import React from 'react';
import { ProForm, ProFormText, ProFormSelect, ProFormDigit } from '@ant-design/pro-components';
import { Form, Input, message } from 'antd';
import { UploadFile } from 'antd/lib/upload/interface';
import AliyunOSSUpload from '@/components/AliyunOSSUpload';

interface Props {
  newRecord?: boolean;
  onFinish: (formData: any) => Promise<void>;
  values?: any;
  setImageUrl: (url: string) => void;
  imageUrl?: string;
  defaultFileList?: UploadFile[];
}

const BasicForm: React.FC<Props> = ({ newRecord, onFinish, values, setImageUrl, imageUrl }) => {
  const intl = useIntl();
  const [formRef] = ProForm.useForm();

  const defaultFileList: UploadFile[] = imageUrl
    ? [
        {
          uid: '-1',
          name: 'avatar.png',
          status: 'done' as const,
          url: imageUrl,
          type: 'image/png',
        },
      ]
    : [];

  const handleFormFinish = async (formData: any) => {
    try {
      // 只保留头像的验证，因为这是特殊字段
      if (!imageUrl) {
        message.error(intl.formatMessage({ id: 'pages.teacher.avatar.required' }));
        return;
      }

      // 构建提交数据
      const submitData = {
        ...formData,
        avatar: imageUrl,
        teachingAge: Number(formData.teachingAge), // 验证图片
      };

      await onFinish(submitData);
    } catch (error) {
      console.error('表单提交错误:', error);
      message.error('提交失败，请重试');
    }
  };

  return (
    <ProForm
      form={formRef}
      initialValues={values}
      onFinish={handleFormFinish}
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

        <ProFormSelect
          name="education"
          width="md"
          label={intl.formatMessage({ id: 'pages.teacher.education' })}
          valueEnum={{
            Bachelor: {
              text: intl.formatMessage({ id: 'pages.teacher.education.bachelor' }),
            },
            Master: {
              text: intl.formatMessage({ id: 'pages.teacher.education.master' }),
            },
            Doctor: {
              text: intl.formatMessage({ id: 'pages.teacher.education.doctor' }),
            },
            Other: {
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
            Teacher: {
              text: intl.formatMessage({ id: 'pages.teacher.title.teacher' }),
            },
            'Grade Director': {
              text: intl.formatMessage({ id: 'pages.teacher.title.gradeDirector' }),
            },
            'Group Leader': {
              text: intl.formatMessage({ id: 'pages.teacher.title.groupLeader' }),
            },
            'Vice Director': {
              text: intl.formatMessage({ id: 'pages.teacher.title.viceDirector' }),
            },
            Director: {
              text: intl.formatMessage({ id: 'pages.teacher.title.director' }),
            },
          }}
          rules={[
            { required: true, message: intl.formatMessage({ id: 'pages.teacher.title.required' }) },
          ]}
        />

        <AliyunOSSUpload
          onFileUpload={(url: string) => {
            console.log('Uploaded file URL:', url);
            setImageUrl!(url);
          }}
          accept=".jpg,.jpeg,.png,.pdf"
          defaultFileList={defaultFileList}
        />

        <ProFormSelect
          name="lessonCategory"
          width="md"
          label={intl.formatMessage({ id: 'pages.teacher.lessonCategory' })}
          mode="multiple"
          valueEnum={{
            Speaking: { text: intl.formatMessage({ id: 'pages.teacher.lessonCategory.speaking' }) },
            Writing: { text: intl.formatMessage({ id: 'pages.teacher.lessonCategory.writing' }) },
            Listening: {
              text: intl.formatMessage({ id: 'pages.teacher.lessonCategory.listening' }),
            },
            Reading: { text: intl.formatMessage({ id: 'pages.teacher.lessonCategory.reading' }) },
            Spelling: { text: intl.formatMessage({ id: 'pages.teacher.lessonCategory.spelling' }) },
            Grammar: { text: intl.formatMessage({ id: 'pages.teacher.lessonCategory.grammar' }) },
            Pronunciation: {
              text: intl.formatMessage({ id: 'pages.teacher.lessonCategory.pronunciation' }),
            },
            All: { text: intl.formatMessage({ id: 'pages.teacher.lessonCategory.all' }) },
          }}
          rules={[
            {
              required: true,
              message: intl.formatMessage({ id: 'pages.teacher.lessonCategory.required' }),
            },
          ]}
        />

        <ProFormSelect
          name="speaks"
          width="md"
          label={intl.formatMessage({ id: 'pages.teacher.speaks' })}
          mode="multiple"
          valueEnum={{
            Spanish: { text: intl.formatMessage({ id: 'pages.teacher.speaks.spanish' }) },
            Japanese: { text: intl.formatMessage({ id: 'pages.teacher.speaks.japanese' }) },
            French: { text: intl.formatMessage({ id: 'pages.teacher.speaks.french' }) },
            English: { text: intl.formatMessage({ id: 'pages.teacher.speaks.english' }) },
            'Chinese (Mandarin)': {
              text: intl.formatMessage({ id: 'pages.teacher.speaks.chinese' }),
            },
          }}
          rules={[
            {
              required: true,
              message: intl.formatMessage({ id: 'pages.teacher.speaks.required' }),
            },
          ]}
        />

        <ProFormSelect
          name="teacherType"
          width="md"
          label={intl.formatMessage({ id: 'pages.teacher.teacherType' })}
          valueEnum={{
            Both: { text: intl.formatMessage({ id: 'pages.teacher.teacherType.both' }) },
            'Community Tutor': {
              text: intl.formatMessage({ id: 'pages.teacher.teacherType.communityTutor' }),
            },
            'Professional Teacher': {
              text: intl.formatMessage({ id: 'pages.teacher.teacherType.professionalTeacher' }),
            },
          }}
          rules={[
            {
              required: true,
              message: intl.formatMessage({ id: 'pages.teacher.teacherType.required' }),
            },
          ]}
        />

        <ProFormSelect
          name="level"
          width="md"
          label={intl.formatMessage({ id: 'pages.teacher.level' })}
          initialValue="Intermediate"
          valueEnum={{
            Basic: { text: intl.formatMessage({ id: 'pages.teacher.level.basic' }) },
            Intermediate: { text: intl.formatMessage({ id: 'pages.teacher.level.intermediate' }) },
            Advanced: { text: intl.formatMessage({ id: 'pages.teacher.level.advanced' }) },
          }}
          rules={[
            { required: true, message: intl.formatMessage({ id: 'pages.teacher.level.required' }) },
          ]}
        />

        <ProFormSelect
          name="employmentType"
          width="md"
          label={intl.formatMessage({ id: 'pages.teacher.employmentType' })}
          initialValue="Part-time"
          valueEnum={{
            'Full-time': {
              text: intl.formatMessage({ id: 'pages.teacher.employmentType.fullTime' }),
            },
            'Part-time': {
              text: intl.formatMessage({ id: 'pages.teacher.employmentType.partTime' }),
            },
          }}
          rules={[
            {
              required: true,
              message: intl.formatMessage({ id: 'pages.teacher.employmentType.required' }),
            },
          ]}
        />

        <ProFormDigit
          name="hoursPerWeek"
          width="md"
          label={intl.formatMessage({ id: 'pages.teacher.hoursPerWeek' })}
          min={0}
          max={168}
          initialValue={0}
          rules={[
            {
              required: true,
              message: intl.formatMessage({ id: 'pages.teacher.hoursPerWeek.required' }),
            },
          ]}
        />

        <ProForm.Item
          name="introduction"
          label={intl.formatMessage({ id: 'pages.teacher.introduction' })}
          style={{ width: '100%' }}
        >
          <Input.TextArea
            rows={3}
            maxLength={1000}
            showCount
            style={{
              width: 330,
              resize: 'vertical',
            }}
            placeholder={intl.formatMessage({ id: 'pages.teacher.introduction.placeholder' })}
          />
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
