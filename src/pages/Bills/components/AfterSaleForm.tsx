import React, { useState } from 'react';
import { ModalForm, ProFormDigit, ProFormTextArea } from '@ant-design/pro-components';
import { Alert, Form, Input, message } from 'antd';
import AliyunOSSUpload from '@/components/AliyunOSSUpload';
import { useIntl } from '@umijs/max';

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
  const [file, setFile] = useState<string>('');
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
        if (!file) {
          message.error(
            intl.formatMessage({
              id: 'upload_image_prompt',
              defaultMessage: 'Please upload an image',
            }),
          );
          return;
        }

        await onSubmit({
          ...values,
          image: file,
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
          <Form.Item
            required
            label={intl.formatMessage({ id: 'image', defaultMessage: 'Image' })}
            name="image"
          >
            <AliyunOSSUpload
              onFileUpload={(url: string) => {
                console.log('Uploaded file URL:', url);
                setFile!(url);
              }}
              accept=".jpg,.jpeg,.png,.pdf"
            />
          </Form.Item>
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
          <Form.Item name="_id" label={false}>
            <Input type="hidden" />
          </Form.Item>
        </>
      )}
    </ModalForm>
  );
};

export default AfterSaleForm;
