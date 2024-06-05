import { useIntl } from '@umijs/max';
import React, { useEffect, useState } from 'react';
import {
  ProForm,
  ProFormSelect,
  ProFormDateTimePicker,
  ProFormRadio,
  ProFormTextArea,
  ProFormDigit,
} from '@ant-design/pro-components';
import { Form } from 'antd';
import { useAccess } from '@umijs/max';
import AliyunOSSUpload from '@/components/AliyunOSSUpload';
import CountrySelect from '@/components/CountrySelect';
import PlatformSelect from '@/components/PlatformSelect';
import UserSelect from '@/components/UserSelect';
import moment from 'moment';

interface Props {
  newRecord?: boolean;
  file?: string | undefined;
  setFile?: (url: string) => void;
  reviewFile?: string | undefined;
  setReviewFile?: (url: string) => void;
  initialValues?: any;
}

const BasicForm: React.FC<Props> = ({ newRecord, setReviewFile, setFile, initialValues }) => {
  const intl = useIntl();
  const [reviewType, setReviewType] = useState(initialValues?.reviewType || '');
  const [orderTimeType, setOrderTimeType] = useState(initialValues?.orderTimeType || '');
  const access = useAccess();

  useEffect(() => {
    if (initialValues?.reviewType) {
      setReviewType(initialValues.reviewType);
    }
    if (initialValues?.orderTimeType) {
      setOrderTimeType(initialValues.orderTimeType);
    }
  }, [initialValues]);

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
          <Form.Item required label={intl.formatMessage({ id: 'upload_file' })} name="file">
            <AliyunOSSUpload
              onFileUpload={(url: string) => {
                console.log('Uploaded file URL:', url);
                setFile!(url);
              }}
              accept=".xls,.xlsx"
            />
          </Form.Item>
        )}
        <ProForm.Item
          name="uploadTime"
          label={intl.formatMessage({ id: 'upload_time' })}
          rules={[{ required: true, message: intl.formatMessage({ id: 'select_order_time' }) }]}
          initialValue={moment()}
        >
          <ProFormDateTimePicker
            width="md"
            fieldProps={{
              format: 'YYYY-MM-DD', // 设置日期格式为年-月-日
              picker: 'date', // 设置 picker 类型为日期选择器
            }}
          />
        </ProForm.Item>
      </ProForm.Group>

      <ProForm.Group>
        <ProForm.Item
          name="orderTimeType"
          label={intl.formatMessage({ id: 'order_time_selection' })}
        >
          <ProFormRadio.Group
            options={[
              { label: intl.formatMessage({ id: 'normal_order' }), value: 'NormalOrder' },
              {
                label: intl.formatMessage({ id: 'specific_time_order' }),
                value: 'SpecificTimeOrder',
              },
            ]}
            fieldProps={{
              defaultValue: 'NormalOrder',
              onChange: (e) => setOrderTimeType(e.target.value),
            }}
          />
        </ProForm.Item>

        {orderTimeType === 'SpecificTimeOrder' && (
          <ProForm.Item
            name="orderTime"
            label={intl.formatMessage({ id: 'order_time' })}
            rules={[{ required: true, message: intl.formatMessage({ id: 'select_order_time' }) }]}
            extra={
              <div style={{ color: '#ff4d4f' }}>
                {intl.formatMessage({ id: 'order_time_notice' })}
              </div>
            }
          >
            <ProFormDateTimePicker
              width="md"
              fieldProps={{
                showTime: { format: 'HH' },
                format: 'YYYY-MM-DD HH',
              }}
            />
          </ProForm.Item>
        )}
      </ProForm.Group>

      <ProForm.Item name="reviewType" label={intl.formatMessage({ id: 'review_type' })}>
        <ProFormRadio.Group
          options={[
            { label: intl.formatMessage({ id: 'normal_review' }), value: 'NormalReview' },
            {
              label: intl.formatMessage({ id: 'review_after_modification' }),
              value: 'ReviewAfterModification',
            },
          ]}
          fieldProps={{
            defaultValue: 'NormalReview',
            onChange: (e) => setReviewType(e.target.value),
          }}
        />
      </ProForm.Item>

      {reviewType === 'ReviewAfterModification' && (
        <Form.Item label={intl.formatMessage({ id: 'upload_review' })} name="uploadedFile">
          <AliyunOSSUpload
            onFileUpload={(url: string) => {
              console.log('Uploaded file URL:', url);
              setReviewFile!(url);
            }}
          />
        </Form.Item>
      )}
      <ProForm.Group>
        <ProFormSelect
          name="orderType"
          label={intl.formatMessage({ id: 'order_type' })}
          mode="multiple"
          width="md"
          options={[
            { label: intl.formatMessage({ id: 'normal_order' }), value: 'NormalOrder' },
            {
              label: intl.formatMessage({ id: 'contact_for_volume_weight' }),
              value: 'ContactForVolumeWeight',
            },
            {
              label: intl.formatMessage({ id: 'contact_for_inventory' }),
              value: 'ContactForInventory',
            },
            { label: intl.formatMessage({ id: 'contact_for_price' }), value: 'ContactForPrice' },
          ]}
          placeholder={intl.formatMessage({ id: 'please_select' })}
          rules={[{ required: false, message: intl.formatMessage({ id: 'please_select' }) }]}
          initialValue={['NormalOrder']}
        />
      </ProForm.Group>

      <ProFormTextArea
        name="orderNote"
        label={intl.formatMessage({ id: 'order_note' })}
        width="md"
        rules={[{ required: false, message: intl.formatMessage({ id: 'enter_order_note' }) }]}
        placeholder={intl.formatMessage({ id: 'enter_detailed_order_note' })}
      />
    </>
  );
};

export default BasicForm;
