import { ProForm, ProFormText, ProFormSelect } from '@ant-design/pro-components';
import { useAccess } from '@umijs/max';

interface Props {
  newRecord?: boolean;
}

const BasicForm: React.FC<Props> = (props) => {
  const { newRecord } = props;
  const access = useAccess();
  return (
    <>
      <ProForm.Group>
        <ProFormText
          rules={[{ required: true, message: '请输入姓名' }]}
          width="md"
          label="姓名"
          name="name"
        />
        <ProFormText
          rules={[{ required: true, message: '请输入电子邮箱' }]}
          width="md"
          label="电子邮箱"
          name="email"
        />
        <ProFormText
          rules={[{ required: newRecord, message: '请输入密码' }]}
          width="md"
          label="密码"
          name="password"
        />
        {access.canSuperAdmin && (
          <ProFormSelect
            name="role"
            width="md"
            label="角色"
            valueEnum={{
              SUPER_ADMIN: '超级管理员',
              CUSTOMER: '客户',
              ORDER_CLERK: '下单员',
              ADMIN: '客服',
              FINANCIAL_STAFF: '财务人员',
            }}
          />
        )}
      </ProForm.Group>
    </>
  );
};

export default BasicForm;
