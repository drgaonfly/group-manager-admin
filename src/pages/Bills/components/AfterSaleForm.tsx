import React, { useState } from 'react';
import { ModalForm, ProFormDigit, ProFormTextArea } from '@ant-design/pro-components';
import { Alert, Form, Input, message } from 'antd';
import AliyunOSSUpload from '@/components/AliyunOSSUpload';

export type FormValueType = Partial<API.ItemData>;

export type UpdateFormProps = {
  onCancel: (visible: boolean) => void;
  onSubmit: (values: FormValueType) => Promise<void>;
  updateModalOpen: boolean;
  values: {
    afterSales?: true;
  } & Partial<API.ItemData>;
};

const AfterSaleForm: React.FC<UpdateFormProps> = (props) => {
  const { updateModalOpen, onCancel, onSubmit, values } = props;
  const [file, setFile] = useState<string>('');
  return (
    <ModalForm
      title="申请售后"
      width="40%"
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      open={updateModalOpen}
      onOpenChange={onCancel}
      onFinish={async (values: any) => {
        if (!file) {
          message.error('请上传图片');
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
        <Alert message="您已经申请过售后了" type="warning" showIcon />
      ) : (
        <>
          <Form.Item required label="图片" name="image">
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
            label="售后原因"
            width="md"
            rules={[{ required: true, message: '请输入售后原因' }]}
            placeholder="请输入售后原因"
          />
          <ProFormDigit
            name="refundAmount"
            label="退款金额"
            width="md"
            rules={[{ required: true, message: '请输入退款金额' }]}
            placeholder="请输入退款金额"
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
