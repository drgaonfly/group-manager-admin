import React from 'react';
import {
  ModalForm,
  ProForm,
  ProFormDateTimePicker,
  ProFormDigit,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Alert, Form, Input } from 'antd';
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

const AfterSaleForm: React.FC<UpdateFormProps> = (props) => {
  const intl = useIntl();
  const { updateModalOpen, onCancel, onSubmit, values } = props;
  return (
    <ModalForm
      title={intl.formatMessage({ id: 'apply_after_sale', defaultMessage: 'Apply for After-sale' })}
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
      {values.afterSales ? (
        <Alert
          message={intl.formatMessage({
            id: 'after_sale_applied',
            defaultMessage: 'You have already applied for after-sale',
          })}
          type="warning"
          showIcon
        />
      ) : (
        <>
          <ProFormTextArea
            name="reason"
            label={intl.formatMessage({
              id: 'after_sale_reason',
              defaultMessage: 'After-sale Reason',
            })}
            width="md"
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: 'enter_after_sale_reason',
                  defaultMessage: 'Please enter the reason for after-sale',
                }),
              },
            ]}
            placeholder={intl.formatMessage({
              id: 'enter_after_sale_reason',
              defaultMessage: 'Please enter the reason for after-sale',
            })}
          />
          <ProFormDigit
            name="refundAmount"
            label={intl.formatMessage({ id: 'refund_amount', defaultMessage: 'Refund Amount' })}
            width="md"
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: 'enter_refund_amount',
                  defaultMessage: 'Please enter the refund amount',
                }),
              },
            ]}
            placeholder={intl.formatMessage({
              id: 'enter_refund_amount',
              defaultMessage: 'Please enter the refund amount',
            })}
            min={0}
          />

          <ProForm.Item
            name="applicationTime"
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

          <Form.Item name="_id" label={false}>
            <Input type="hidden" />
          </Form.Item>
        </>
      )}
    </ModalForm>
  );
};

export default AfterSaleForm;
