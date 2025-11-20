import React from 'react';
import { useIntl } from '@umijs/max';
import { Modal, Typography, Card, Descriptions } from 'antd';
import { FormattedMessage } from '@umijs/max';
import { ProTable, type ProColumns } from '@ant-design/pro-components';

interface BotUserFormProps {
  open: boolean;
  onCancel: (visible: boolean) => void;
  values: any;
  groupInfo: any;
}

const BotUserForm: React.FC<BotUserFormProps> = (props) => {
  const { open, onCancel, values, groupInfo } = props;
  const intl = useIntl();

  // 定义用户表格的列
  const userColumns: ProColumns<any>[] = [
    {
      title: intl.formatMessage({ id: 'ID', defaultMessage: 'ID' }),
      dataIndex: 'id',
      key: 'id',
      renderText: (text, record) => record.id || record._id || text,
    },
    {
      title: intl.formatMessage({ id: 'userName', defaultMessage: '用户名' }),
      dataIndex: 'userName',
      key: 'userName',
      render: (text) => (text ? `@${text}` : ''),
    },
    {
      title: intl.formatMessage({ id: 'first_name_user_telegram', defaultMessage: '名字' }),
      dataIndex: 'firstName',
      key: 'firstName',
    },
    {
      title: intl.formatMessage({ id: 'last_name_user_telegram', defaultMessage: '姓氏' }),
      dataIndex: 'lastName',
      key: 'lastName',
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
      title={intl.formatMessage({ id: 'bot_users_list', defaultMessage: '群组成员列表' })}
      open={open}
      onCancel={() => onCancel(false)}
      width={1000}
      footer={null}
    >
      {values?.botUsers && values.botUsers.length > 0 ? (
        <>
          <Card className="mb-4">
            <Descriptions
              title={intl.formatMessage({ id: 'group_info', defaultMessage: '群组信息' })}
              bordered
            >
              <Descriptions.Item
                label={intl.formatMessage({ id: 'title', defaultMessage: '群组名称' })}
              >
                {groupInfo?.title}
              </Descriptions.Item>
              <Descriptions.Item label={intl.formatMessage({ id: 'type', defaultMessage: '类型' })}>
                {groupInfo?.type}
              </Descriptions.Item>
              <Descriptions.Item
                label={intl.formatMessage({ id: 'members_count', defaultMessage: '成员数量' })}
              >
                {values.botUsers.length}
              </Descriptions.Item>
            </Descriptions>
          </Card>
          <ProTable
            search={false}
            columns={userColumns}
            dataSource={values.botUsers}
            rowKey="_id"
            pagination={{ pageSize: 20 }}
          />
        </>
      ) : (
        <Typography.Text>
          <FormattedMessage id="no_users" defaultMessage="该群组没有成员" />
        </Typography.Text>
      )}
    </Modal>
  );
};

export default BotUserForm;
