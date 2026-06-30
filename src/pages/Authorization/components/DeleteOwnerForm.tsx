import React from 'react';
import { useIntl } from '@umijs/max';
import { message, Modal } from 'antd';
import { FormattedMessage } from '@umijs/max';
import { updateItem } from '@/services/ant-design-pro/api';

interface DeleteOwnerFormProps {
  open: boolean;
  onCancel: (visible: boolean) => void;
  values: any;
  onSuccess: () => void;
}

const DeleteOwnerForm: React.FC<DeleteOwnerFormProps> = ({ open, onCancel, values, onSuccess }) => {
  const intl = useIntl();

  const owner = values?.owner;
  const ownerName = owner?.userName ? `@${owner.userName}` : owner?.firstName || 'Owner';

  const handleConfirm = async () => {
    const hide = message.loading(<FormattedMessage id="deleting" defaultMessage="Deleting..." />);
    try {
      await updateItem(`/bots/${values._id}/delete-owner`, {});
      hide();
      message.success(
        <FormattedMessage id="delete_successful" defaultMessage="Deleted successfully" />,
      );
      onSuccess();
      onCancel(false);
    } catch (error: any) {
      hide();
      message.error(
        error?.response?.data?.message ?? (
          <FormattedMessage id="delete_failed" defaultMessage="Delete failed, please try again!" />
        ),
      );
    }
  };

  return (
    <Modal
      title={intl.formatMessage({ id: 'delete_owner', defaultMessage: '移除 Owner' })}
      open={open}
      onCancel={() => onCancel(false)}
      onOk={handleConfirm}
      okText={intl.formatMessage({ id: 'confirm', defaultMessage: '确认移除' })}
      okButtonProps={{ danger: true }}
      cancelText={intl.formatMessage({ id: 'cancel', defaultMessage: '取消' })}
    >
      <p>
        {intl.formatMessage(
          { id: 'confirm_remove_owner', defaultMessage: '确认移除 {name} 的 Owner 权限？' },
          { name: <strong>{ownerName}</strong> },
        )}
      </p>
    </Modal>
  );
};

export default DeleteOwnerForm;
