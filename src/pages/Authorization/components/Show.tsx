import { ProDescriptions, ProDescriptionsItemProps } from '@ant-design/pro-components';
import BotUserTable from './BotUserTable';
import GroupTable from './GroupTable';
import { Modal, Tabs } from 'antd';
import React, { useState } from 'react';
import { useIntl } from '@umijs/max';

interface Props {
  onClose: (e: React.MouseEvent | React.KeyboardEvent) => void;
  open: boolean;
  currentRow: API.ItemData;
  columns: ProDescriptionsItemProps<API.ItemData>[];
}

const Show: React.FC<Props> = (props) => {
  const { onClose, open, currentRow, columns: cols } = props;
  const intl = useIntl();
  const filteredColumns = cols.filter((col) => col.dataIndex !== 'option');

  const [pagination, setPagination] = useState<{ current: number; pageSize: number }>({
    current: 1,
    pageSize: 20,
  });

  const tabItems = [
    {
      key: 'basic',
      label: intl.formatMessage({ id: 'basic_info', defaultMessage: '基本信息' }),
      children: (
        <ProDescriptions<API.ItemData>
          column={2}
          title={currentRow?.botName}
          request={async () => ({
            data: currentRow || {},
          })}
          params={{
            id: currentRow?._id,
          }}
          columns={filteredColumns as ProDescriptionsItemProps<API.ItemData>[]}
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
      ),
    },
    {
      key: 'groups',
      label: intl.formatMessage({ id: 'group', defaultMessage: '群组' }),
      children: <GroupTable currentRow={currentRow} />,
    },
    {
      key: 'users',
      label: intl.formatMessage({ id: 'user_count', defaultMessage: '用户数量' }),
      children: (
        <BotUserTable
          botUsers={currentRow?.botUsers || currentRow?.botUserConfigs || []}
          pagination={pagination}
          setPagination={setPagination}
        />
      ),
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width="80%"
      centered
      className="rounded-lg overflow-hidden"
    >
      {currentRow?._id && (
        <Tabs defaultActiveKey="basic" items={tabItems} style={{ marginTop: '20px' }} />
      )}
    </Modal>
  );
};

export default Show;
