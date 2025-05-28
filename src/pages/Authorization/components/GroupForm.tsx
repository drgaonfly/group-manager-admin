import React, { useState } from 'react';
import { useIntl } from '@umijs/max';
import { Modal, Typography, Card, Descriptions, Badge } from 'antd';
import { FormattedMessage } from '@umijs/max';
import { ProTable, type ProColumns } from '@ant-design/pro-components';
import BotUserForm from './BotUserForm';

interface GroupFormProps {
  open: boolean;
  onCancel: (visible: boolean) => void;
  values: any;
}

const GroupForm: React.FC<GroupFormProps> = (props) => {
  const { open, onCancel, values } = props;
  const intl = useIntl();
  const [botUserModalVisible, setBotUserModalVisible] = useState<boolean>(false);
  const [currentGroup, setCurrentGroup] = useState<any>(null);
  const [currentBotUsers, setCurrentBotUsers] = useState<any[]>([]);

  // 定义群组表格的列
  const groupColumns: ProColumns<any>[] = [
    {
      title: intl.formatMessage({ id: 'ID', defaultMessage: 'ID' }),
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: intl.formatMessage({ id: 'title', defaultMessage: '群组名称' }),
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: intl.formatMessage({ id: 'type', defaultMessage: '类型' }),
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: intl.formatMessage({ id: 'exchange_rate', defaultMessage: '汇率' }),
      dataIndex: 'exchange_rate',
      key: 'exchange_rate',
    },
    {
      title: intl.formatMessage({ id: 'fee_rate', defaultMessage: '费率' }),
      dataIndex: 'fee_rate',
      key: 'fee_rate',
      render: (text) => `${text}%`,
    },
    {
      title: intl.formatMessage({ id: 'unit', defaultMessage: '单位' }),
      dataIndex: 'unit',
      key: 'unit',
    },
    {
      title: intl.formatMessage({ id: 'isOnline', defaultMessage: '状态' }),
      dataIndex: 'isOnline',
      key: 'isOnline',
      render: (isOnline) => (
        <Badge
          status={isOnline ? 'success' : 'error'}
          text={
            isOnline
              ? intl.formatMessage({ id: 'platform.online', defaultMessage: '在线' })
              : intl.formatMessage({ id: 'platform.offline', defaultMessage: '离线' })
          }
        />
      ),
    },
    {
      title: intl.formatMessage({ id: 'createdAt', defaultMessage: '创建时间' }),
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="操作" />,
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        // 查看成员 (botUsers)
        <a
          key="users"
          onClick={() => {
            setCurrentGroup(record);
            setCurrentBotUsers(values.botUsers || []);
            setBotUserModalVisible(true);
          }}
        >
          {intl.formatMessage({ id: 'view_members', defaultMessage: '查看成员' })}
        </a>,
      ],
    },
  ];

  return (
    <>
      <Modal
        title={intl.formatMessage({ id: 'group_list', defaultMessage: '群组列表' })}
        open={open}
        onCancel={() => onCancel(false)}
        width={1500}
        footer={null}
      >
        {values?.groups && values.groups.length > 0 ? (
          <>
            <Card className="mb-4">
              <Descriptions
                title={intl.formatMessage({ id: 'bot_info', defaultMessage: '机器人信息' })}
                bordered
              >
                <Descriptions.Item
                  label={intl.formatMessage({ id: 'botName', defaultMessage: '机器人名称' })}
                >
                  {values.botName}
                </Descriptions.Item>
                <Descriptions.Item
                  label={intl.formatMessage({ id: 'userName', defaultMessage: '用户名' })}
                >
                  @{values.userName}
                </Descriptions.Item>
                <Descriptions.Item
                  label={intl.formatMessage({ id: 'groups_count', defaultMessage: '群组数量' })}
                >
                  {values.groups.length}
                </Descriptions.Item>
              </Descriptions>
            </Card>
            <ProTable
              search={false}
              columns={groupColumns}
              dataSource={values.groups}
              rowKey="_id"
              pagination={{ pageSize: 5 }}
            />
          </>
        ) : (
          <Typography.Text>
            <FormattedMessage id="no_groups" defaultMessage="该机器人没有关联的群组" />
          </Typography.Text>
        )}
      </Modal>

      <BotUserForm
        open={botUserModalVisible}
        onCancel={setBotUserModalVisible}
        values={{ botUsers: currentBotUsers }}
        groupInfo={currentGroup}
      />
    </>
  );
};

export default GroupForm;
