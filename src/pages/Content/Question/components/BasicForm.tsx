import { FormattedMessage, useIntl } from '@umijs/max';
import React, { useState } from 'react';
import { ProForm, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { Form, Input } from 'antd';
import ReactQuill from 'react-quill';

// Define the type for the Editor component
interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

// Editor Component (Controlled Component)
const Editor: React.FC<EditorProps> & { modules: any; formats: string[] } = ({
  value,
  onChange,
  placeholder,
}) => {
  return (
    <ReactQuill
      theme="snow"
      value={value}
      onChange={onChange}
      modules={Editor.modules} // Access static property
      formats={Editor.formats} // Access static property
      placeholder={placeholder}
      className="h-72 w-96"
    />
  );
};

// Define the Quill modules
Editor.modules = {
  toolbar: ['link', 'image', 'bold', 'italic'],
};

// Define the Quill formats
Editor.formats = [
  'header',
  'font',
  'size',
  'bold',
  'italic',
  'underline',
  'strike',
  'blockquote',
  'list',
  'bullet',
  'indent',
  'link',
  'image',
];

interface Props {
  newRecord?: boolean;
  onFinish: (formData: any) => Promise<void>;
  values?: any;
}

const BasicForm: React.FC<Props> = ({ newRecord, onFinish, values }) => {
  const intl = useIntl();
  const [content, setContent] = useState(values?.content || ''); // State for content in the editor

  // Handle editor content change
  const handleEditorChange = (value: string) => {
    setContent(value);
  };

  return (
    <ProForm
      initialValues={{
        ...values,
      }}
      onFinish={async (values) => {
        await onFinish({
          ...values,
          content, // Include content from the editor
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
        <ProFormSelect
          name="lang"
          width="md"
          label={intl.formatMessage({ id: 'language' })}
          options={[
            { label: 'en', value: 'en' },
            { label: 'zh-TW', value: 'zh-TW' },
            { label: 'ja', value: 'ja' },
            { label: 'ko', value: 'ko' },
            { label: 'it', value: 'it' },
            { label: 'fr', value: 'fr' },
            { label: 'pt', value: 'pt' },
            { label: 'ru', value: 'ru' },
            { label: 'ar', value: 'ar' },
            { label: 'hi', value: 'hi' },
            { label: 'bg', value: 'bg' },
            { label: 'es', value: 'es' },
            { label: 'de', value: 'de' },
            { label: 'tr', value: 'tr' },
          ]}
          placeholder={intl.formatMessage({ id: 'selectLanguage' })}
          rules={[{ required: true, message: intl.formatMessage({ id: 'languageRequired' }) }]}
        />

        <ProFormText
          rules={[{ required: false }]}
          width="md"
          label={<FormattedMessage id="title" defaultMessage="标题" />}
          name="title"
          placeholder={intl.formatMessage({
            id: 'please_enter_title',
            defaultMessage: '请输入标题',
          })}
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProForm.Item
          label={<FormattedMessage id="content" defaultMessage="内容" />}
          name="content"
        >
          <Editor
            value={content}
            onChange={handleEditorChange}
            placeholder={intl.formatMessage({
              id: 'please_enter_content',
              defaultMessage: '请输入内容',
            })}
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
