import { Modal } from 'antd';
import { useIntl } from '@umijs/max';

interface DeleteLinkProps {
  onOk: () => Promise<void>;
}

const DeleteLink: React.FC<DeleteLinkProps> = ({ onOk }) => {
  const intl = useIntl();

  return (
    <a
      key="delete"
      onClick={() => {
        return Modal.confirm({
          title: intl.formatMessage({ id: 'confirm_delete' }),
          onOk,
          content: intl.formatMessage({ id: 'confirm_delete_content' }),
          okText: intl.formatMessage({ id: 'confirm' }),
          cancelText: intl.formatMessage({ id: 'cancel' }),
        });
      }}
    >
      {intl.formatMessage({ id: 'delete' })}
    </a>
  );
};

export default DeleteLink;
