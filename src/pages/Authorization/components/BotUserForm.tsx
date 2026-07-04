import React, { useEffect, useState } from 'react';
import { useIntl } from '@umijs/max';
import { Modal } from 'antd';
import { ProTable, type ProColumns } from '@ant-design/pro-components';
import { simpleGet } from '@/services/ant-design-pro/api';

interface BotUserFormProps {
  open: boolean;
  onCancel: (visible: boolean) => void;
  groupId: string;
  botId: string;
}

const BotUserForm: React.FC<BotUserFormProps> = (props) => {
  const { open, onCancel, groupId, botId } = props;
  const intl = useIntl();

  const [loading, setLoading] = useState(false);
  const [groupInfo, setGroupInfo] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 15, total: 0 });

  const loadMembers = async (current = 1, pageSize = 15) => {
    if (!groupId || !botId) return;
    setLoading(true);
    try {
      const res: any = await simpleGet(`/groups/${groupId}/members`, {
        botId,
        current,
        pageSize,
      });
      if (res?.success) {
        setGroupInfo(res.data.group);
        setMembers(res.data.members);
        setPagination({
          current: res.current,
          pageSize: res.pageSize,
          total: res.total,
        });
      }
    } catch (error) {
      console.error('加载成员列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && groupId && botId) {
      loadMembers(1, 15);
    }
  }, [open, groupId, botId]);

  const handlePageChange = (current: number, pageSize: number) => {
    loadMembers(current, pageSize);
  };

  // 定义用户表格的列
  const userColumns: ProColumns<any>[] = [
    {
      title: intl.formatMessage({ id: 'userName', defaultMessage: '用户名' }),
      dataIndex: 'userName',
      key: 'userName',
      render: (text, record) => (text ? `@${text}` : record.firstName || record.id),
    },
    {
      title: intl.formatMessage({ id: 'first_name_user_telegram', defaultMessage: '名字' }),
      dataIndex: 'firstName',
      key: 'firstName',
      render: (text) => text || '-',
    },
    {
      title: intl.formatMessage({ id: 'last_name_user_telegram', defaultMessage: '姓氏' }),
      dataIndex: 'lastName',
      key: 'lastName',
      render: (text) => text || '-',
    },
    {
      title: intl.formatMessage({ id: 'createdAt', defaultMessage: '创建时间' }),
      dataIndex: 'createdAt',
      key: 'createdAt',
      valueType: 'dateTime',
    },
  ];

  return (
    <Modal
      title={
        groupInfo?.title || intl.formatMessage({ id: 'group_info', defaultMessage: '群组信息' })
      }
      open={open}
      onCancel={() => onCancel(false)}
      width="90%"
      footer={null}
    >
      <ProTable
        search={false}
        columns={userColumns}
        dataSource={members}
        rowKey="_id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          onChange: handlePageChange,
          onShowSizeChange: handlePageChange,
        }}
        size="small"
      />
    </Modal>
  );
};

export default BotUserForm;
