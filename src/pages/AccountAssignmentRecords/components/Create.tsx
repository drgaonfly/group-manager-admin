import { FormattedMessage, useIntl } from '@umijs/max';
import CountrySelect from '@/components/CountrySelect';
import PlatformSelect from '@/components/PlatformSelect';
import { addItem } from '@/services/ant-design-pro/api';
import {
  ProForm,
  ProFormDateTimePicker,
  ProFormDigit,
  ProFormInstance,
  ProFormText,
  StepsForm,
} from '@ant-design/pro-components';
import { Empty, Modal, Table, message } from 'antd';
import { useState, useRef, useEffect } from 'react';
import CopyToClipboard from '@/components/CopyToClipboard';
import moment from 'moment';

interface Props {
  open: boolean;
  onOpenChange: (visible: boolean) => void;
  onFinish: (formData: any) => Promise<void>;
}

interface DataSourceType {
  accountNumber: string;
}

const AccountTable = ({ accounts }: { accounts: any[] }) => {
  const columns = [
    {
      title: <FormattedMessage id="order_account_number" defaultMessage="Order Account Number" />,
      dataIndex: 'accountNumber',
      key: 'accountNumber',
      copyable: true,
    },
    {
      title: <FormattedMessage id="login_account" defaultMessage="Login Account" />,
      dataIndex: 'loginAccount',
      key: 'loginAccount',
    },
    {
      title: <FormattedMessage id="login_password" defaultMessage="Login Password" />,
      dataIndex: 'loginPassword',
      key: 'loginPassword',
    },
    {
      title: <FormattedMessage id="recent_assigned_time" defaultMessage="Recent Assigned Time" />,
      dataIndex: 'assignedTime',
      key: 'assignedTime',
      render: (text: string) =>
        text || <FormattedMessage id="not_assigned" defaultMessage="Not Assigned" />,
    },
  ];

  if (accounts.length === 0) {
    return (
      <Empty
        description={
          <FormattedMessage
            id="no_matching_account_library"
            defaultMessage="No matching account library found"
          />
        }
      />
    );
  }

  const headers = ['订单账号'];
  const data = accounts.map((item: DataSourceType) => [item.accountNumber]);
  const text = [headers, ...data].map((row) => row.join('\t')).join('\n');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'right', marginBottom: '10px' }}>
        <span>
          <FormattedMessage id="copy.tooltip" defaultMessage="Copy data" />
        </span>
        <CopyToClipboard text={text} />
      </div>
      <Table columns={columns} pagination={false} dataSource={accounts} rowKey="accountNumber" />
    </div>
  );
};

const Create: React.FC<Props> = (props) => {
  const intl = useIntl();
  const formRef = useRef<ProFormInstance>();
  const { open, onOpenChange, onFinish } = props;
  const [current, setCurrent] = useState<number>(0);
  const [accounts, setAccounts] = useState<any[]>([]);

  const [accountFeedback, setAccountFeedback] = useState('');

  useEffect(() => {
    const requestedAccounts = formRef.current?.getFieldsValue().numberOfAccounts;
    if (accounts.length !== Number(requestedAccounts)) {
      setAccountFeedback(
        intl.formatMessage(
          { id: 'requested_accounts_not_found' },
          { requestedAccounts, accountsLength: accounts.length },
        ),
      );
    } else {
      setAccountFeedback(
        intl.formatMessage({ id: 'requested_accounts_found' }, { requestedAccounts }),
      );
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
          const hide = message.loading(<FormattedMessage id="adding" defaultMessage="Adding..." />);

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
            title={intl.formatMessage({ id: 'auto_assign_account' })}
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
          message.error(intl.formatMessage({ id: 'no_account_library' }));
          return false;
        }

        if (accounts.length !== formRef.current?.getFieldsValue().numberOfAccounts) {
          Modal.confirm({
            title: intl.formatMessage({ id: 'confirm_submit' }),
            content: intl.formatMessage({ id: 'insufficient_account_library' }),
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
      <StepsForm.StepForm
        formRef={formRef}
        initialValues={{}}
        title={intl.formatMessage({ id: 'fill_store_account_and_quantity' })}
      >
        <CountrySelect />

        <PlatformSelect />

        <ProForm.Item
          name="assignedTime"
          label={intl.formatMessage({ id: 'assigned_time' })}
          rules={[{ required: false }]}
          initialValue={moment()} // 设置默认值为当前日期
        >
          <ProFormDateTimePicker
            width="md"
            fieldProps={{
              format: 'YYYY-MM-DD', // 设置日期格式为年-月-日
              picker: 'date', // 设置 picker 类型为日期选择器
            }}
          />
        </ProForm.Item>

        <ProFormText
          name="storeAccount"
          label={intl.formatMessage({ id: 'store_account' })}
          width="md"
          rules={[{ required: true, message: intl.formatMessage({ id: 'enter_store_account' }) }]}
          placeholder={intl.formatMessage({ id: 'enter_store_account' })}
        />

        <ProFormDigit
          name="numberOfAccounts"
          label={intl.formatMessage({ id: 'account_quantity' })}
          width="md"
          min={1} // Minimum number of accounts must be at least 1
          rules={[
            { required: true, message: intl.formatMessage({ id: 'enter_account_quantity' }) },
          ]}
          placeholder={intl.formatMessage({ id: 'enter_account_quantity' })}
        />
      </StepsForm.StepForm>
      <StepsForm.StepForm
        initialValues={{
          target: '0',
          template: '0',
        }}
        title={intl.formatMessage({ id: 'auto_select_account_and_submit' })}
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
