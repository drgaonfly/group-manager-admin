import { ProDescriptions, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { Modal } from 'antd';
import { useState } from 'react';
import ReceiptTable from './ReceiptTable';
import { useIntl } from '@umijs/max';

interface Props {
  onClose: (e: React.MouseEvent | React.KeyboardEvent) => void;
  open: boolean;
  currentRow: API.ItemData;
  columns: ProDescriptionsItemProps<API.ItemData>[];
}

const Show: React.FC<Props> = (props) => {
  const intl = useIntl();
  const { onClose, open, currentRow, columns } = props;
  const filteredColumns = columns
    .filter((col) => col.dataIndex !== 'option')
    .filter((_, index) => index !== 3);
  const [receiptPagination, setReceiptPagination] = useState<{ current: number; pageSize: number }>(
    {
      current: 1,
      pageSize: 5,
    },
  );

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
            title={intl.formatMessage({ id: 'detail' })}
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
          <ReceiptTable
            receipts={currentRow?.receipts || []}
            pagination={receiptPagination}
            setPagination={setReceiptPagination}
          />
        </>
      )}
    </Modal>
  );
};

export default Show;
