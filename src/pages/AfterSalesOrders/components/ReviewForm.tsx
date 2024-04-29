import React, { useState } from 'react';
import { ModalForm, ProFormTextArea, ProFormRadio } from '@ant-design/pro-components';
import { Form, Input } from 'antd';

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
  const { updateModalOpen, onCancel, onSubmit, values } = props;
  const [status, setStatus] = useState('');

  return (
    <ModalForm
      title="审核售后"
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
          label="审核结果"
          options={[
            { value: 'Approved', label: '审核通过' },
            { value: 'Rejected', label: '审核不通过' },
          ]}
          rules={[{ required: true, message: '请选择审核结果' }]}
          fieldProps={{
            onChange: (e) => setStatus(e.target.value),
          }}
        />
        {status === 'Rejected' && (
          <ProFormTextArea
            name="rejectionReason"
            label="不通过原因"
            width="md"
            placeholder="如果审核不通过，请输入原因"
            rules={[{ required: true, message: '请输入不通过原因' }]}
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
