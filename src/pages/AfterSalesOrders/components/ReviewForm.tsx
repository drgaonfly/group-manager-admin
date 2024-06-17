import React, { useState } from 'react';
import {
  ModalForm,
  ProFormTextArea,
  ProFormRadio,
  ProForm,
  ProFormDateTimePicker,
} from '@ant-design/pro-components';
import { Form, Input } from 'antd';
import { useIntl } from '@umijs/max';
import moment from 'moment';

export type FormValueType = Partial<API.ItemData>;

export type UpdateFormProps = {
  onCancel: (visible: boolean) => void;
  onSubmit: (values: FormValueType) => Promise<void>;
  updateModalOpen: boolean;
  values: {
    afterSales?: boolean;
  } & Partial<API.ItemData>;
};

const ReviewForm: React.FC<UpdateFormProps> = (props) => {
  const intl = useIntl();
  const { updateModalOpen, onCancel, onSubmit, values } = props;
  const [status, setStatus] = useState('');

  return (
    <ModalForm
      title={intl.formatMessage({ id: 'review_after_sale' })}
      width="40%"
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      open={updateModalOpen}
      onOpenChange={onCancel}
      onFinish={async (values: any) => {
        await onSubmit({
          ...values,
        });
      }}
      initialValues={{ ...values }}
    >
      <>
        <ProFormRadio.Group
          name="status"
          label={intl.formatMessage({ id: 'review_result' })}
          options={[
            { value: 'Approved', label: intl.formatMessage({ id: 'review_approved' }) },
            { value: 'Rejected', label: intl.formatMessage({ id: 'review_rejected' }) },
          ]}
          rules={[
            { required: true, message: intl.formatMessage({ id: 'please_select_review_result' }) },
          ]}
          fieldProps={{
            onChange: (e) => setStatus(e.target.value),
          }}
        />
        <ProForm.Item
          name="reviewTime"
          label={intl.formatMessage({ id: 'applicationTime' })}
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
        {status === 'Rejected' && (
          <ProFormTextArea
            name="rejectionReason"
            label={intl.formatMessage({ id: 'rejection_reason' })}
            width="md"
            placeholder={intl.formatMessage({ id: 'enter_rejection_reason' })}
            rules={[
              {
                required: true,
                message: intl.formatMessage({ id: 'please_enter_rejection_reason' }),
              },
            ]}
          />
        )}
        <Form.Item name="_id" label={false}>
          <Input type="hidden" />
        </Form.Item>
      </>
    </ModalForm>
  );
};

export default ReviewForm;
