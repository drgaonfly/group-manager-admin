import { useIntl } from '@umijs/max';
import React from 'react';
import { ProForm, ProFormSelect, ProFormText } from '@ant-design/pro-components';
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
        <ProFormSelect
          name="icon"
          width="md"
          label={intl.formatMessage({ id: 'icon', defaultMessage: '图标' })}
          placeholder={intl.formatMessage({ id: 'selectIcon', defaultMessage: '请选择图标' })}
          options={[
            {
              value:
                'M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z',
            },
            {
              value:
                'M4 8h4V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2zm10-4h-4v4h4V4z',
            },
            // 可以根据需要添加更多图标选项
          ]}
          fieldProps={{
            optionItemRender: (item: { label?: React.ReactNode; value: string }) => (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <svg viewBox="0 0 24 24" width="20" height="20" style={{ marginRight: 8 }}>
                  <path d={item.value} />
                </svg>
                {item.label}
              </div>
            ),
          }}
        />
        <ProFormText
          name="title"
          width="md"
          label={intl.formatMessage({ id: 'title' })}
          placeholder={intl.formatMessage({ id: 'title' })}
        />
        <ProForm.Item
          name="text"
          label={intl.formatMessage({ id: 'text', defaultMessage: 'Text' })}
        >
          <Input.TextArea
            rows={4}
            placeholder={intl.formatMessage({ id: 'text', defaultMessage: 'Text' })}
            style={{ width: '328px' }}
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
