import { ProFormSelect } from '@ant-design/pro-components';
import React from 'react';
import { useIntl } from '@umijs/max';
import useQueryList from '@/hooks/useQueryList';

interface Props {
  newRecord?: boolean;
  onChange?: (value: string) => void;
}

const EmployeeSelect: React.FC<Props> = ({ newRecord = true, onChange }) => {
  const intl = useIntl();
  const { items: employees, loading } = useQueryList('/employees');

  return (
    <ProFormSelect
      options={employees.map((employee: any) => ({
        label: `${process.env.UMI_APP_FRONTEND_URL}?code=${employee.inviteCode}`,
        value: employee._id,
      }))}
      width="md"
      name="employee"
      label={intl.formatMessage({ id: 'employee.inviteCode' })}
      showSearch
      fieldProps={{
        loading,
        onChange: (value: string) => {
          if (onChange) {
            onChange(value);
          }
        },
      }}
      disabled={!newRecord}
    />
  );
};

export default EmployeeSelect;
