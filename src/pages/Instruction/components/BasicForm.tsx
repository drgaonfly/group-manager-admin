import { FormattedMessage, useIntl } from '@umijs/max';
import React, { useState } from 'react';
import { ProForm, ProFormText } from '@ant-design/pro-components';
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
                <span key={index}>{button}</span>
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
          <Editor value={content} onChange={handleEditorChange} placeholder="请输入内容" />
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
