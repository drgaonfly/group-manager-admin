import { useIntl } from '@umijs/max';
import { ProForm, ProFormDigit, ProFormSelect } from '@ant-design/pro-components';

interface Props {
  values?: any;
}

const BasicForm: React.FC<Props> = () => {
  const intl = useIntl();

  return (
    <>
      <ProForm.Group>
        <ProFormDigit
          name="amount"
          label={intl.formatMessage({ id: 'amount' })}
          width="md"
          rules={[{ required: true }]}
        />

        <ProFormDigit
          name="rate"
          label={intl.formatMessage({ id: 'rate' })}
          width="md"
          fieldProps={{
            precision: 2,
            min: 0,
            max: 1,
          }}
        />

        <ProFormDigit
          name="fixedRate"
          label={intl.formatMessage({ id: 'fixedRate' })}
          width="md"
          rules={[{ required: true }]}
        />

        <ProFormSelect
          name="transactionType"
          label={intl.formatMessage({ id: 'transactionType' })}
          width="md"
          rules={[{ required: true }]}
          valueEnum={{
            income: {
              text: intl.formatMessage({ id: 'transactionType.income' }),
              status: 'Success',
            },
            issue: { text: intl.formatMessage({ id: 'transactionType.issue' }), status: 'Error' },
          }}
        />
      </ProForm.Group>
    </>
  );
};

export default BasicForm;
