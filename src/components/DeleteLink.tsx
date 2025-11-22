import { Modal } from 'antd';
import { useIntl } from '@umijs/max';
import ActionButton from './ActionButton';

interface DeleteLinkProps {
  onOk: () => Promise<void>;
}

const DeleteLink: React.FC<DeleteLinkProps> = ({ onOk }) => {
  const intl = useIntl();

  return (
    <ActionButton
      type="delete"
      onClick={() => {
        return Modal.confirm({
          title: intl.formatMessage({ id: 'confirm_delete' }),
          onOk,
          content: intl.formatMessage({ id: 'confirm_delete_content' }),
          okText: intl.formatMessage({ id: 'confirm' }),
          cancelText: intl.formatMessage({ id: 'cancel' }),
        });
      }}
    />
  );
};

export default DeleteLink;
