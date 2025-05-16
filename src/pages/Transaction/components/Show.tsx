import { ProDescriptions, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { Modal } from 'antd';

interface Props {
  onClose: (e: React.MouseEvent | React.KeyboardEvent) => void;
  open: boolean;
  currentRow: API.ItemData;
  columns: ProDescriptionsItemProps<API.ItemData>[];
}

const Show: React.FC<Props> = (props) => {
  const { onClose, open, currentRow, columns } = props;
  const filteredColumns = columns
    .filter((col) => col.dataIndex !== 'option')
    .filter((_, index) => index !== 3);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width="80%"
      centered
      className="rounded-lg overflow-hidden"
    >
      {currentRow && (
        <>
          <ProDescriptions<API.ItemData>
            column={1}
            title={`账单记录`}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?._id,
            }}
            columns={filteredColumns as ProDescriptionsItemProps<API.ItemData>[]}
            bordered
            size="middle"
          />
        </>
      )}
    </Modal>
  );
};

export default Show;
