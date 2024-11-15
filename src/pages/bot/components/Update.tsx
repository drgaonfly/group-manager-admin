import { ModalForm, ProFormText, ProFormTextArea, ProForm } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';

export type FormValueType = {
  _id?: string;
  botId?: string;
  botToken?: string;
  botUsername?: string;
  botName?: string;
  telegramId?: string;
  telegramUsername?: string;
  description?: string;
};

export type UpdateFormProps = {
  onCancel: (flag?: boolean) => void;
  onSubmit: (values: FormValueType) => Promise<void>;
  updateModalOpen: boolean;
  values: Partial<FormValueType>;
};

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  const { updateModalOpen, onCancel, onSubmit, values } = props;
  const intl = useIntl();

  return (
    <ModalForm
      title={intl.formatMessage({ id: 'pages.searchTable.updateForm.title' })}
      open={updateModalOpen}
      modalProps={{
        onCancel: () => onCancel(false),
        width: '800px', // 调整模态框宽度
      }}
      onFinish={async (formValues) => {
        await onSubmit({
          ...values,
          ...formValues,
        });
        return true;
      }}
      initialValues={values}
    >
      <ProForm.Group>
        <ProFormText
          name="botId"
          label={intl.formatMessage({ id: 'botId' })}
          width="md"
          placeholder={intl.formatMessage({ id: 'please.enter' })}
        />
        <ProFormText
          name="botToken"
          label={intl.formatMessage({ id: 'botToken' })}
          width="md"
          rules={[{ required: true }]}
          placeholder={intl.formatMessage({ id: 'please.enter' })}
        />
        <ProFormText
          name="botUsername"
          label={intl.formatMessage({ id: 'botUsername' })}
          width="md"
          placeholder={intl.formatMessage({ id: 'please.enter' })}
        />
        <ProFormText
          name="botName"
          label={intl.formatMessage({ id: 'botName' })}
          width="md"
          placeholder={intl.formatMessage({ id: 'please.enter' })}
        />
        <ProFormText
          name="telegramId"
          label={intl.formatMessage({ id: 'telegramId' })}
          width="md"
          placeholder={intl.formatMessage({ id: 'please.enter' })}
        />
        <ProFormText
          name="telegramUsername"
          label={intl.formatMessage({ id: 'telegramUsername' })}
          width="md"
          placeholder={intl.formatMessage({ id: 'please.enter' })}
        />
        <ProFormTextArea
          name="description"
          label={intl.formatMessage({ id: 'description' })}
          width="xl"
          placeholder={intl.formatMessage({ id: 'please.enter' })}
          fieldProps={{
            autoSize: { minRows: 2, maxRows: 6 },
          }}
        />
      </ProForm.Group>
    </ModalForm>
  );
};

export default UpdateForm;
