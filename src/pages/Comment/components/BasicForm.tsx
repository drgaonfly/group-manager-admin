import { useIntl } from '@umijs/max';
import { ProForm, ProFormTextArea, ProFormRate } from '@ant-design/pro-components';
import CustomerSelect from '@/components/tearcher';
interface Props {
  newRecord?: boolean;
}

const BasicForm: React.FC<Props> = ({ newRecord = true }) => {
  const intl = useIntl();

  return (
    <>
      <ProForm.Group>
        {newRecord && <CustomerSelect />}

        <ProFormTextArea
          name="content"
          label={intl.formatMessage({ id: 'pages.comment.content' })}
          width="md"
          rules={[
            { required: true },
            { max: 500, message: intl.formatMessage({ id: 'pages.comment.content.maxLength' }) },
          ]}
          placeholder={intl.formatMessage({ id: 'pages.comment.content.placeholder' })}
        />

        <ProFormRate
          name="rating"
          label={intl.formatMessage({ id: 'pages.comment.rating' })}
          width="md"
          rules={[{ required: true }]}
          fieldProps={{
            count: 5,
            allowHalf: false,
            tooltips: ['1分', '2分', '3分', '4分', '5分'],
            style: { fontSize: 20 },
          }}
        />
      </ProForm.Group>
    </>
  );
};

export default BasicForm;
