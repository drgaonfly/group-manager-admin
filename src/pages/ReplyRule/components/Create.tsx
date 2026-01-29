import { ModalForm } from '@ant-design/pro-components';
import { Form } from 'antd';
import BasicForm from './BasicForm';

interface CreateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFinish: (values: any) => Promise<boolean>;
}

const Create: React.FC<CreateProps> = ({ open, onOpenChange, onFinish }) => {
  const [form] = Form.useForm();

  return (
    <ModalForm
      title="新建回复规则"
      width={800}
      open={open}
      onOpenChange={(visible) => {
        if (!visible) {
          form.resetFields();
        }
        onOpenChange(visible);
      }}
      form={form}
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      onFinish={async (values) => {
        const extraData = (form as any).__getReplyRuleData?.() || {};
        const finalValues = {
          ...values,
          ...extraData,
          menus_per_row: values.menus_per_row || 1,
        };
        return await onFinish(finalValues);
      }}
    >
      <BasicForm form={form} />
    </ModalForm>
  );
};

export default Create;
