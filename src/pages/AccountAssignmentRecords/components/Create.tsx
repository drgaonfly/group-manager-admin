import CountrySelect from '@/components/CountrySelect';
import PlatformSelect from '@/components/PlatformSelect';
import { addItem } from '@/services/ant-design-pro/api';
import { ProFormDigit, ProFormInstance, ProFormText, StepsForm } from '@ant-design/pro-components';
import { Empty, Modal, Table, message } from 'antd';
import { useState, useRef, useEffect } from 'react';

interface Props {
  open: boolean;
  onOpenChange: (visible: boolean) => void;
  onFinish: (formData: any) => Promise<void>;
}

const AccountTable = ({ accounts }: { accounts: any[] }) => {
  const columns = [
    {
      title: '下单账号序号',
      dataIndex: 'accountNumber',
      key: 'accountNumber',
      copyable: true,
    },
    {
      title: '登录账号',
      dataIndex: 'loginAccount',
      key: 'loginAccount',
    },
    {
      title: '登录密码',
      dataIndex: 'loginPassword',
      key: 'loginPassword',
    },
    {
      title: '是否分配',
      dataIndex: 'isAssigned',
      key: 'isAssigned',
      valueEnum: {
        true: { text: '已分配', status: 'Success' },
        false: { text: '未分配', status: 'Error' },
      },
    },
    {
      title: '最近分配时间',
      dataIndex: 'assignedTime',
      key: 'assignedTime',
      render: (text: string) => text || '未分配',
    },
  ];

  if (accounts.length === 0) {
    return <Empty description="找不到匹配的账号库" />;
  }

  return (
    <Table columns={columns} pagination={false} dataSource={accounts} rowKey="accountNumber" />
  );
};

const Create: React.FC<Props> = (props) => {
  const formRef = useRef<ProFormInstance>();
  const { open, onOpenChange, onFinish } = props;
  const [current, setCurrent] = useState<number>(0);
  const [accounts, setAccounts] = useState<any[]>([]);

  const [accountFeedback, setAccountFeedback] = useState('');

  useEffect(() => {
    const requestedAccounts = formRef.current?.getFieldsValue().numberOfAccounts;
    if (accounts.length !== Number(requestedAccounts)) {
      setAccountFeedback(`请求了 ${requestedAccounts} 个账号，但只找到 ${accounts.length} 个。`);
    } else {
      setAccountFeedback(`请求的 ${requestedAccounts} 个账号已成功找到。`);
    }
  }, [accounts, formRef]);

  return (
    <StepsForm
      current={current}
      stepsProps={{
        size: 'small',
      }}
      onFormFinish={async (formName, info) => {
        console.log(formName);
        console.log(info);
        if (formName === '0') {
          const hide = message.loading('正在添加');

          try {
            const res = await addItem('/assignments/available', { ...info.values });
            console.log(res);
            setAccounts(res?.data);
            // const res = await AddPayment({
            //   ...info.values
            // });
            hide();
            // if (res.code === 0) {
            //   message.error(`操作失败, ${res.msg}`);
            //   return false
            // } else {
            //   setPaymentId(res.data.id);
            //   message.success(res.msg);
            //   return true;
            // }
          } catch (error: any) {
            console.log(error);
            setAccounts([]);
            hide();
            message.error(error?.response?.data?.message || 'Adding failed, please try again!');
            return false;
          }
        }
      }}
      onCurrentChange={(current: number) => {
        setCurrent(current);
      }}
      stepsFormRender={(dom, submitter) => {
        return (
          <Modal
            width="50%"
            bodyStyle={{ padding: '32px 40px 48px' }}
            destroyOnClose
            title="自动分配账号"
            open={open}
            footer={submitter}
            onCancel={() => {
              onOpenChange(false);
            }}
          >
            {dom}
          </Modal>
        );
      }}
      // @ts-ignore
      onFinish={(values) => {
        if (accounts.length < 1) {
          message.error('没有账号库无法提交');
          return false;
        }

        if (accounts.length !== formRef.current?.getFieldsValue().numberOfAccounts) {
          Modal.confirm({
            title: '确认提交',
            content: '账号库数量不足，你确定要提交吗？',
            onOk() {
              setCurrent(0);
              onOpenChange(false);

              return onFinish({
                ...values,
                accountLibraries: accounts,
              });
            },
            onCancel() {
              // do nothing
            },
          });
          return;
        }

        setCurrent(0);
        onOpenChange(false);

        return onFinish({
          ...values,
          accountLibraries: accounts,
        });
      }}
    >
      <StepsForm.StepForm formRef={formRef} initialValues={{}} title="填写店铺账号和数量">
        <CountrySelect />

        <PlatformSelect />

        <ProFormText
          name="storeAccount"
          label="店铺账号"
          width="md"
          rules={[{ required: true, message: '请输入店铺账号' }]}
          placeholder="请输入店铺账号"
        />

        <ProFormDigit
          name="numberOfAccounts"
          label="账号数量"
          width="md"
          min={1} // Minimum number of accounts must be at least 1
          rules={[{ required: true, message: '请输入账号数量' }]}
          placeholder="请输入账号数量"
        />
      </StepsForm.StepForm>
      <StepsForm.StepForm
        initialValues={{
          target: '0',
          template: '0',
        }}
        title="自动选择账号库并提交"
      >
        {accountFeedback && (
          <div
            style={{
              color:
                accounts.length === formRef.current?.getFieldsValue().numberOfAccounts
                  ? 'green'
                  : 'red',
              marginBottom: '10px',
            }}
          >
            {accountFeedback}
          </div>
        )}
        <AccountTable accounts={accounts} />
      </StepsForm.StepForm>
    </StepsForm>
  );
};

export default Create;
