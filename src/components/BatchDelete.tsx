import { Button, message, Modal } from 'antd';
import { useIntl } from '@umijs/max';
import { removeItem } from '@/services/ant-design-pro/api';
import { FormInstance } from 'antd/lib/form';

interface BatchDeleteButtonProps {
  form: FormInstance;
  deleteUrl: string;
  key: string;
  actionRef: any;
}

const BatchDeleteButton: React.FC<BatchDeleteButtonProps> = ({
  form,
  key,
  deleteUrl,
  actionRef,
}) => {
  const intl = useIntl();

  const handleBatchDelete = async () => {
    // Show a loading message
    const hide = message.loading(
      intl.formatMessage({ id: 'deleting', defaultMessage: 'Deleting...' }),
      0,
    );

    try {
      // Perform the delete operation
      console.log('Delete button clicked', form.getFieldsValue());

      await removeItem(deleteUrl, {
        ...form.getFieldsValue(),
      });

      hide();

      message.success(
        intl.formatMessage({
          id: 'delete_success',
          defaultMessage: 'Delete successful',
        }),
      );
      actionRef.current?.reloadAndRest?.();
    } catch (error) {
      // Update the message
      hide();
      message.error(intl.formatMessage({ id: 'delete_failed', defaultMessage: 'Delete failed' }));
    }
  };

  return (
    <Button
      key={key}
      danger
      onClick={() => {
        return Modal.confirm({
          title: intl.formatMessage({ id: 'confirm_delete' }),
          onOk: handleBatchDelete,
          content: intl.formatMessage({ id: 'confirm_delete_content' }),
          okText: intl.formatMessage({ id: 'confirm' }),
          cancelText: intl.formatMessage({ id: 'cancel' }),
        });
      }}
    >
      {intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' })}
    </Button>
  );
};

export default BatchDeleteButton;
