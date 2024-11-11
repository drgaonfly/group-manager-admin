import { ProDescriptions, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { Drawer } from 'antd';
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
    <Drawer width="70%" open={open} onClose={onClose} closable={false}>
      {currentRow?.name && (
        <ProDescriptions<API.ItemData>
          column={2}
          title={currentRow?.name}
          request={async () => ({
            data: currentRow || {},
          })}
          params={{
            id: currentRow?._id,
          }}
          columns={columns as ProDescriptionsItemProps<API.ItemData>[]}
        />
      )}
    </Drawer>
  );
};

export default Show;
