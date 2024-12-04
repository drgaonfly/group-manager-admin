import { ModalForm } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import BasicForm from './BasicForm';

export type FormValueType = {
  _id?: string;
  content?: string;
  rating?: number;
  customer?: {
    _id: string;
    username: string;
  };
  createdAt?: string;
  updatedAt?: string;
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

  return (
    <ModalForm
      key={values._id}
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
      initialValues={values}
    >
      <BasicForm newRecord={false} />
    </ModalForm>
  );
};

export default UpdateForm;
