import React, { useEffect, useRef, useState } from 'react';
import { ProFormInstance, StepsForm } from '@ant-design/pro-components';
import { Empty, Form, Input, Modal, Spin, Table, message } from 'antd';
import AliyunOSSUpload from '@/components/AliyunOSSUpload';
import { FormattedMessage, useIntl } from '@umijs/max';
import { addItem } from '@/services/ant-design-pro/api';
import CopyToClipboard from '@/components/CopyToClipboard';

export type FormValueType = Partial<API.ItemData>;

export type UpdateFormProps = {
  open: boolean;
  onOpenChange: (visible: boolean) => void;
  onFinish: (formData: any) => Promise<void>;
  values: any;
};

interface DataSourceType {
  orderNumber: string;
}

const BillTable = ({ bills }: { bills: any[] }) => {
  const columns = [
    {
      title: <FormattedMessage id="order_number" defaultMessage="Order Number" />,
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 200,
    },
    {
      title: <FormattedMessage id="store_name" defaultMessage="Store Name" />,
      dataIndex: 'storeName',
      key: 'storeName',
      width: 200,
    },
    {
      title: <FormattedMessage id="amount" defaultMessage="Amount" />,
      dataIndex: 'amount',
      key: 'amount',
      width: 200,
    },
    {
      title: <FormattedMessage id="buyer_id" defaultMessage="Buyer ID" />,
      dataIndex: 'buyerId',
      key: 'buyerId',
      width: 200,
    },
  ];

  if (bills.length === 0) {
    return (
      <Empty description={<FormattedMessage id="no_bill_data" defaultMessage="No bill data" />} />
    );
  }

  const headers = ['账单数据'];
  const data = bills.map((item: DataSourceType) => [item.orderNumber]);
  const text = [headers, ...data].map((row) => row.join('\t')).join('\n');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'right', marginBottom: '10px' }}>
        <span>
          <FormattedMessage id="copy.tooltip" defaultMessage="Copy data" />
        </span>
        <CopyToClipboard text={text} />
      </div>
      <Table columns={columns} pagination={false} dataSource={bills} rowKey="accountNumber" />
    </div>
  );
};

const UploadForm: React.FC<UpdateFormProps> = (props) => {
  const intl = useIntl();
  const formRef = useRef<ProFormInstance>();
  const { open, onOpenChange, onFinish, values } = props;
  const [current, setCurrent] = useState<number>(0);
  const [bills, setBills] = useState<any[]>([]);
  const [file, setFile] = useState<string>('');
  const { _id } = values;

  const [billFeedback, setBillFeedback] = useState('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setBillFeedback(intl.formatMessage({ id: 'found_bills' }, { billsLength: bills.length }));
  }, [bills, formRef]);
  return (
    <StepsForm
      current={current}
      stepsProps={{
        size: 'small',
      }}
      onFormFinish={async (formName, info) => {
        console.log(info);
        if (formName === '0') {
          if (!file) {
            message.error(
              intl.formatMessage({
                id: 'upload_bill_file_prompt',
                defaultMessage: 'Please upload the bill file',
              }),
            );
            return;
          }
          try {
            setLoading(true);
            const res = await addItem('/tasks/get-bills-data', { _id: values._id, billFile: file });
            setBills(res?.data);
          } catch (error: any) {
            console.log(error);
            setBills([]);
            message.error(error?.response?.data?.message || 'Adding failed, please try again!');
            return false;
          } finally {
            setLoading(false);
          }
        }
      }}
      onCurrentChange={(current: number) => {
        console.log(current);
        if (!file) {
          setCurrent(0);
          return;
        }
        setCurrent(current);
      }}
      stepsFormRender={(dom, submitter) => {
        return (
          <Modal
            width="50%"
            bodyStyle={{ padding: '32px 40px 48px' }}
            destroyOnClose
            title={intl.formatMessage({ id: 'upload_bill', defaultMessage: 'Upload Bill' })}
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
      onFinish={() => {
        if (bills.length < 1) {
          message.error(intl.formatMessage({ id: 'no_bill_data' }));
          return false;
        }

        onOpenChange(false);
        setCurrent(0);
        setBills([]);
        setFile('');

        return onFinish({
          _id,
          billsData: bills,
        });
      }}
    >
      <StepsForm.StepForm
        formRef={formRef}
        initialValues={{}}
        title={intl.formatMessage({ id: 'upload_bill_file' })}
      >
        <Form.Item
          required
          label={intl.formatMessage({ id: 'bill_file', defaultMessage: 'Bill File' })}
          name="billFile"
        >
          <div style={{ marginBottom: '30px' }}>
            <a href="/api/static/BillTemplate.xlsx" download>
              {intl.formatMessage({ id: 'download_template', defaultMessage: 'Download Template' })}
            </a>
          </div>
          <AliyunOSSUpload
            onFileUpload={(url: string) => {
              console.log('Uploaded file URL:', url);
              setFile!(url);
            }}
            accept=".xls,.xlsx"
          />
        </Form.Item>
        <Form.Item name="_id" label={false}>
          <Input type="hidden" />
        </Form.Item>
      </StepsForm.StepForm>
      <StepsForm.StepForm
        initialValues={{
          target: '0',
          template: '0',
        }}
        title={intl.formatMessage({ id: 'confirm_bill_content' })}
      >
        {loading ? (
          <Spin />
        ) : (
          <>
            {billFeedback && (
              <div
                style={{
                  color: bills.length > 0 ? 'green' : 'red',
                  marginBottom: '10px',
                }}
              >
                {billFeedback}
              </div>
            )}
            <BillTable bills={bills} />
          </>
        )}
      </StepsForm.StepForm>
    </StepsForm>
  );
};

export default UploadForm;
