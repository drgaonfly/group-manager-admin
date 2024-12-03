import { ModalForm } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import BasicForm from './BasicForm';

export type FormValueType = {
  _id?: string;
  customer?: string | { _id: string; username: string };
  fullName?: string;
  birthDate?: string;
  location?: string;
  degree?: string;
  school?: string;
  major?: string;
  teachingYears?: number;
  teachingLevel?: string;
  status?: string | number;
};

export type UpdateFormProps = {
  onCancel: (flag: boolean) => void;
  onSubmit: (values: FormValueType) => Promise<void>;
  updateModalOpen: boolean;
  values: Partial<FormValueType>;
};

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  const { updateModalOpen, onCancel, onSubmit, values } = props;
  const intl = useIntl();

  const initialValues = {
    ...values,
    customer: typeof values.customer === 'object' ? values.customer._id : values.customer,
  };

  return (
    <ModalForm
      title={intl.formatMessage({ id: 'pages.searchTable.updateForm.title' })}
      open={updateModalOpen}
      modalProps={{
        onCancel: () => onCancel(false),
        width: '800px',
      }}
      onFinish={async (formValues) => {
        await onSubmit({
          ...values,
          ...formValues,
        });
        return true;
      }}
      initialValues={initialValues}
    >
      <BasicForm />
    </ModalForm>
  );
};

export default UpdateForm;
