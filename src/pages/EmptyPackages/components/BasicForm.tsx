import { useIntl } from '@umijs/max';
import React from 'react';
import { ProForm, ProFormDigit, ProFormSwitch } from '@ant-design/pro-components';
import { Form } from 'antd';
import { useAccess } from '@umijs/max';
import AliyunOSSUpload from '@/components/AliyunOSSUpload';
import CountrySelect from '@/components/CountrySelect';
import PlatformSelect from '@/components/PlatformSelect';
import UserSelect from '@/components/UserSelect';

interface Props {
  newRecord?: boolean;
  file?: string | undefined;
  setFile?: (url: string) => void;
  reviewFile?: string | undefined;
  setReviewFile?: (url: string) => void;
  initialValues?: any;
}

const BasicForm: React.FC<Props> = ({ newRecord, setFile, initialValues }) => {
  const intl = useIntl();
  const access = useAccess();

  return (
    <>
      <ProForm.Group>
        {access.canAdmin && <UserSelect />}
        <CountrySelect />

        <PlatformSelect />
        <ProFormDigit
          name="quantity"
          label={intl.formatMessage({ id: 'quantity' })}
          width="md"
          min={1}
          rules={[{ required: true, message: intl.formatMessage({ id: 'enter_quantity' }) }]}
          placeholder={intl.formatMessage({ id: 'enter_quantity' })}
        />
      </ProForm.Group>
      <ProForm.Group>
        {newRecord && (
          <Form.Item required label={intl.formatMessage({ id: 'file' })} name="file">
            <AliyunOSSUpload
              onFileUpload={(url: string) => {
                console.log('Uploaded file URL:', url);
                setFile!(url);
              }}
              accept=".pdf,.rar,.zip"
            />
          </Form.Item>
        )}
        {!newRecord && (
          <ProFormSwitch
            name="isProcessed"
            label={intl.formatMessage({ id: 'is_processed' })}
            tooltip={intl.formatMessage({ id: 'mark_processed' })}
            initialValue={initialValues?.isProcessed}
          />
        )}
      </ProForm.Group>
    </>
  );
};

export default BasicForm;
