import { ProDescriptions, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { Modal } from 'antd';
import React, { useEffect, useState } from 'react';
import SubCustomerTable from './SubCustomerTable';

interface Props {
  onClose: (e: React.MouseEvent | React.KeyboardEvent) => void;
  open: boolean;
  currentRow: API.ItemData;
  columns: ProDescriptionsItemProps<API.ItemData>[];
}

const Show: React.FC<Props> = (props) => {
  const { onClose, open, currentRow, columns: cols } = props;
  const filteredColumns = cols.filter((col) => col.dataIndex !== 'option');
  const [loading, setLoading] = useState<boolean>(false);
  const [children, setChildren] = useState<any[]>(currentRow?.children || []);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
  });

  const query = async () => {
    setLoading(true);

    setChildren(currentRow.children);

    setLoading(false);
  };

  useEffect(() => {
    if (currentRow?._id) {
      query().catch(console.error);
    }
  }, [currentRow]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width="55%"
      centered
      className="rounded-lg overflow-hidden"
    >
      {currentRow?._id && (
        <>
          <ProDescriptions<API.ItemData>
            column={1}
            title={currentRow?.customer?.id}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?._id,
            }}
            columns={filteredColumns as ProDescriptionsItemProps<API.ItemData>[]}
            style={{ marginTop: '20px' }}
            bordered
            labelStyle={{
              justifyContent: 'flex-end',
              padding: '8px 16px',
              backgroundColor: '#f0f0f0',
            }}
            contentStyle={{
              padding: '8px 16px',
            }}
            size="middle"
            className="custom-descriptions"
          />

          <SubCustomerTable
            customers={children}
            loading={loading}
            pagination={pagination}
            setPagination={setPagination}
          />
        </>
      )}
    </Modal>
  );
};

export default Show;
