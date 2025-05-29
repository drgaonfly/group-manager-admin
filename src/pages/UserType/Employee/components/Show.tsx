import { queryList } from '@/services/ant-design-pro/api';
import { ProDescriptions, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { Modal } from 'antd';
import React, { useEffect, useState } from 'react';
import CustomerTable from '../../Proxy/components/CustomerTable';

interface Props {
  onClose: (e: React.MouseEvent | React.KeyboardEvent) => void;
  open: boolean;
  currentRow: API.ItemData;
  columns: ProDescriptionsItemProps<API.ItemData>[];
}

const Show: React.FC<Props> = (props) => {
  const { onClose, open, currentRow, columns } = props;
  const filteredColumns = columns.filter((col) => col.dataIndex !== 'option');
  const [loading, setLoading] = useState<boolean>(false);
  const [customers, setCustomers] = useState<any[]>([]);

  // 添加分页状态
  const [pagination, setPagination] = useState<{ current: number; pageSize: number }>({
    current: 1,
    pageSize: 20,
  });

  const query = async () => {
    setLoading(true);

    const response = (await queryList(`/users/${currentRow?._id}`, {}, {})) as any;

    if (response?.success) {
      const customersData = response.data.customers || [];

      setCustomers(customersData);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (currentRow) {
      query().catch(console.error);
    }
  }, [currentRow]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width="50%"
      centered
      className="rounded-lg overflow-hidden"
    >
      {currentRow?.email && (
        <>
          <ProDescriptions<API.ItemData>
            column={2}
            title={currentRow?.email}
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
              width: '10%',
              justifyContent: 'flex-end',
              padding: '8px 16px',
              backgroundColor: '#f0f0f0',
            }}
            contentStyle={{
              width: '50%',
              padding: '8px 16px',
            }}
            size="small"
            className="custom-descriptions"
          />
          <CustomerTable
            customers={customers}
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
