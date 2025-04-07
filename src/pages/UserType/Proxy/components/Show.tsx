import { queryList } from '@/services/ant-design-pro/api';
import { ProDescriptions, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { Modal } from 'antd';
import React, { useEffect, useState } from 'react';
// import handleUpdate from '@/customer/index';
// import { Role } from '@/apiDataStructures/ApiDataStructure';
// import moment from 'moment';
import EmployeeTable from './EmployeeTable'; // 导入员工表格组件
import ProxyTable from './ProxyTable';
import CustomerTable from './CustomerTable';

interface Props {
  onClose: (e: React.MouseEvent | React.KeyboardEvent) => void;
  open: boolean;
  currentRow: API.ItemData;
  columns: ProDescriptionsItemProps<API.ItemData>[];
}

const Show: React.FC<Props> = (props) => {
  const { onClose, open, currentRow, columns } = props;
  const filteredColumns = columns.filter((col) => col.dataIndex !== 'option');
  const [employees, setEmployees] = useState<any[]>(currentRow?.employees || []);
  const [proxies, setProxies] = useState<any[]>(currentRow?.proxies || []);
  const [customers, setCustomers] = useState<any[]>(currentRow?.customers || []);
  const [loading, setLoading] = useState<boolean>(false);

  // 添加分页状态
  const [pagination, setPagination] = useState<{ current: number; pageSize: number }>({
    current: 1,
    pageSize: 5,
  });

  const query = async () => {
    setLoading(true);

    const response = (await queryList(`/users/${currentRow?._id}`, {}, {})) as any;

    if (response?.success) {
      const employeesData = response.data.employees || [];
      const proxiesData = response.data.proxies || [];
      const customersData = response.data.customers || [];

      setEmployees(employeesData);
      setProxies(proxiesData);
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
          <EmployeeTable
            employees={employees}
            loading={loading}
            pagination={pagination}
            setPagination={setPagination}
          />
          <ProxyTable
            proxies={proxies}
            loading={loading}
            pagination={pagination}
            setPagination={setPagination}
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
