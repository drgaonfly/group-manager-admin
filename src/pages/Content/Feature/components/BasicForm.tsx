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
          options={[
            {
              value:
                'M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z',
            },
            {
              value:
                'M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91c4.59-1.15 8-5.86 8-10.91V5l-8-3zm6 9.09c0 4-2.55 7.7-6 8.83c-3.45-1.13-6-4.82-6-8.83v-4.7l6-2.25l6 2.25v4.7z',
            },
            {
              value:
                'M13.95 2.013l7.054 7.053a1.5 1.5 0 0 1 0 2.121l-7.054 7.054a1.5 1.5 0 0 1-2.121 0l-7.054-7.054a1.5 1.5 0 0 1 0-2.121l7.054-7.053a1.5 1.5 0 0 1 2.121 0z',
            },
            {
              value:
                'M4 8h4V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2zm10-4h-4v4h4V4z',
            },
            {
              value:
                'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z',
            },
            {
              value: 'M7 2v11h3v9l7-12h-4l4-8z',
            },
            {
              value:
                'M12 23c6.075 0 11-4.925 11-11 0-6.075-3-8-3-8s0 4-2 4-2-7-7-7S7 7 5 9s-4 5-4 8c0 6.075 4.925 11 11 11zm0-8a3 3 0 100-6 3 3 0 000 6z',
            },
            {
              value:
                'M12 8l3.293-3.293a1 1 0 011.414 0l2.586 2.586a1 1 0 010 1.414L16 12l3.293 3.293a1 1 0 010 1.414l-2.586 2.586a1 1 0 01-1.414 0L12 16l-3.293 3.293a1 1 0 01-1.414 0L4.707 16.707a1 1 0 010-1.414L8 12 4.707 8.707a1 1 0 010-1.414l2.586-2.586a1 1 0 011.414 0L12 8z',
            },
            {
              value: 'M5 9.2h3V19H5V9.2zM10.6 5h2.8v14h-2.8V5zm5.6 8H19v6h-2.8v-6z',
            },
            {
              value: 'M12 2L2 8l10 6 10-6-10-6zM2 14l10 6 10-6-10-6-10 6z',
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
        <ProFormText name="title" width="md" label={intl.formatMessage({ id: 'title' })} />
        <ProFormSelect
          name="type"
          width="md"
          label={intl.formatMessage({ id: 'type' })}
          options={[
            { label: '项目特点', value: 'feature' },
            { label: '邀请步骤', value: 'step' },
          ]}
          rules={[{ required: true }]}
        />

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
