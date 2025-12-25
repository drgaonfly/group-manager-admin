import { ModalForm } from '@ant-design/pro-components';
import { Form } from 'antd';
import BasicForm from './BasicForm';

export type FormValueType = {
  _id?: string;
} & Partial<any>;

interface UpdateProps {
  onSubmit: (values: FormValueType) => Promise<void>;
  onCancel: (visible: boolean) => void;
  updateModalOpen: boolean;
  values: Partial<any>;
}

const Update: React.FC<UpdateProps> = ({ onSubmit, onCancel, updateModalOpen, values }) => {
  const [form] = Form.useForm();

  return (
    <ModalForm
      title="编辑回复规则"
      width={800}
      open={updateModalOpen}
      onOpenChange={(visible) => {
        if (!visible) {
          form.resetFields();
        }
        onCancel(visible);
      }}
      form={form}
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      onFinish={async (formValues) => {
        const extraData = (form as any).__getReplyRuleData?.() || {};
        const finalValues = {
          _id: values._id,
          ...formValues,
          ...extraData,
          menus_per_row: formValues.menus_per_row || 1,
        };
        await onSubmit(finalValues);
      }}
    >
      <BasicForm form={form} initialValues={values} />
    </ModalForm>
  );
};

export default Update;
