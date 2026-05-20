import { ProDescriptions, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { Modal } from 'antd';

interface Props {
  onClose: (e: React.MouseEvent | React.KeyboardEvent) => void;
  open: boolean;
  currentRow: API.ItemData;
  columns: ProDescriptionsItemProps<API.ItemData>[];
}

const Show: React.FC<Props> = ({ onClose, open, currentRow, columns }) => {
  const filteredColumns = columns.filter((col) => col.dataIndex !== 'option');

  return (
    <Modal open={open} onCancel={onClose} footer={null} width="70%" centered>
      {currentRow?._id && (
        <ProDescriptions<API.ItemData>
          column={1}
          title="帖子详情"
          request={async () => ({ data: currentRow || {} })}
          params={{ id: currentRow?._id }}
          columns={filteredColumns as ProDescriptionsItemProps<API.ItemData>[]}
          bordered
          size="middle"
        />
      )}
    </Modal>
  );
};

export default Show;
