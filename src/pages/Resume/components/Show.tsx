import { ProDescriptions, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { Modal } from 'antd'; // 改用 Modal
import React from 'react';

interface Props {
  onClose: (e: React.MouseEvent | React.KeyboardEvent) => void;
  open: boolean;
  currentRow: API.ItemData;
  columns: ProDescriptionsItemProps<API.ItemData>[];
}

const Show: React.FC<Props> = (props) => {
  const { onClose, open, currentRow, columns } = props;
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width="60%"
      centered
      className="rounded-lg overflow-hidden"
    >
      {currentRow?.customer && ( // 修改为 botId，因为您的数据中使用的是 botId
        <ProDescriptions<API.ItemData>
          column={2}
          title={currentRow?.customer.username} // 使用 botId 作为标题
          request={async () => ({
            data: currentRow || {},
          })}
          params={{
            id: currentRow?._id,
          }}
          columns={columns as ProDescriptionsItemProps<API.ItemData>[]}
          style={{ marginTop: '20px' }}
        />
      )}
    </Modal>
  );
};

export default Show;
