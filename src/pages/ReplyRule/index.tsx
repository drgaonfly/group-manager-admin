import { useIntl, FormattedMessage, useAccess } from '@umijs/max';
import { addItem, queryList, removeItem, updateItem } from '@/services/ant-design-pro/api';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { FooterToolbar, PageContainer, ProTable } from '@ant-design/pro-components';
import { Button, message, Switch, Tag, Space } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons';
import React, { useRef, useState } from 'react';
import useIsMobile from '@/hooks/useIsMobile';
import type { FormValueType } from './components/Update';
import Update from './components/Update';
import Create from './components/Create';
import Show from './components/Show';
import DeleteButton from '@/components/DeleteButton';
import DeleteLink from '@/components/DeleteLink';

const handleAdd = async (fields: any) => {
  const hide = message.loading(<FormattedMessage id="adding" defaultMessage="Adding..." />);
  try {
    await addItem('/reply-rules', { ...fields });
    hide();
    message.success(<FormattedMessage id="add_successful" defaultMessage="Added successfully" />);
    return true;
  } catch (error: any) {
    hide();
    message.error(error?.response?.data?.message ?? '添加失败');
    return false;
  }
};

const handleUpdate = async (fields: FormValueType) => {
  const hide = message.loading(<FormattedMessage id="updating" defaultMessage="Updating..." />);
  try {
    await updateItem(`/reply-rules/${fields._id}`, fields);
    hide();
    message.success(<FormattedMessage id="update_successful" defaultMessage="Update successful" />);
    return true;
  } catch (error: any) {
    hide();
    message.error(error?.response?.data?.message ?? '更新失败');
    return false;
  }
};

const handleRemove = async (ids: string[]) => {
  const hide = message.loading(<FormattedMessage id="deleting" defaultMessage="Deleting..." />);
  if (!ids) return true;
  try {
    await removeItem('/reply-rules', { ids });
    hide();
    message.success(
      <FormattedMessage id="delete_successful" defaultMessage="Deleted successfully" />,
    );
    return true;
  } catch (error: any) {
    hide();
    message.error(error?.response?.data?.message ?? '删除失败');
    return false;
  }
};

const TableList: React.FC = () => {
  const intl = useIntl();
  const access = useAccess();
  const actionRef = useRef<ActionType>();
  const [activeKey, setActiveKey] = useState<string | undefined>('');
  const [createModalOpen, handleModalOpen] = useState<boolean>(false);
  const [updateModalOpen, handleUpdateModalOpen] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<any>();
  const [selectedRowsState, setSelectedRows] = useState<any[]>([]);
  const [showDetail, setShowDetail] = useState<boolean>(false);

  const isMobile = useIsMobile(1440);

  const columns: ProColumns<any>[] = React.useMemo(
    () => [
      {
        title: intl.formatMessage({ id: 'agent' }),
        dataIndex: 'proxy',
        hideInSearch: true,
        hideInTable: !access.canSuperAdmin,
        renderText: (_, record) => record?.proxy?.name,
      },
      {
        title: '机器人',
        dataIndex: 'bot',
        hideInSearch: true,
        render: (_, record) => record?.bot?.botName || '-',
      },
      {
        title: '关键词',
        dataIndex: 'keyword',
        render: (_, record) => {
          const keywords = Array.isArray(record.keyword) ? record.keyword : [record.keyword];
          return (
            <Space wrap size={[4, 4]}>
              {keywords.map((k: string, idx: number) => (
                <Tag key={idx} color="blue">
                  {k}
                </Tag>
              ))}
            </Space>
          );
        },
      },
      {
        title: '回复内容',
        dataIndex: 'content',
        width: 200,
        hideInSearch: true,
        render: (_, record) => (
          <div
            style={{
              maxWidth: 200,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            dangerouslySetInnerHTML={{ __html: record.content || '' }}
            title={record.content?.replace(/<[^>]+>/g, '') || ''}
          />
        ),
      },
      {
        title: '媒体数量',
        dataIndex: 'medias',
        hideInSearch: true,
        render: (_, record) => record?.medias?.length || 0,
      },
      {
        title: '菜单数量',
        dataIndex: 'menus',
        hideInSearch: true,
        render: (_, record) => record?.menus?.length || 0,
      },
      {
        title: '引用消息',
        dataIndex: 'replyToMessage',
        hideInSearch: true,
        render: (_, record) =>
          record.replyToMessage ? <Tag color="green">是</Tag> : <Tag>否</Tag>,
      },
      {
        title: '回复管理员',
        dataIndex: 'replyToAdmin',
        hideInSearch: true,
        render: (_, record) =>
          record.replyToAdmin !== false ? <Tag color="green">是</Tag> : <Tag>否</Tag>,
      },
      {
        title: '阅后即焚',
        dataIndex: 'deleteAfterSeconds',
        hideInSearch: true,
        render: (_, record) =>
          record.deleteAfterSeconds ? <Tag color="orange">{record.deleteAfterSeconds}秒</Tag> : '-',
      },
      {
        title: '删除用户消息',
        dataIndex: 'deleteUserMsgAfterSeconds',
        hideInSearch: true,
        render: (_, record) =>
          record.deleteUserMsgAfterSeconds ? (
            <Tag color="orange">{record.deleteUserMsgAfterSeconds}秒</Tag>
          ) : (
            '-'
          ),
      },
      {
        title: intl.formatMessage({ id: 'isOnline', defaultMessage: '是否在线' }),
        dataIndex: 'isOnline',
        hideInSearch: true,
        render: (_, record: any) => (
          <Switch
            checkedChildren={intl.formatMessage({ id: 'platform.online' })}
            unCheckedChildren={intl.formatMessage({ id: 'platform.offline' })}
            checked={record.isOnline}
            onChange={async () => {
              await handleUpdate({ _id: record?._id, isOnline: !record.isOnline });
              actionRef.current?.reload();
            }}
          />
        ),
      },
      {
        title: intl.formatMessage({ id: 'createdAt', defaultMessage: '创建时间' }),
        dataIndex: 'createdAt',
        hideInSearch: true,
        valueType: 'dateTime',
      },
      {
        title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="操作" />,
        dataIndex: 'option',
        valueType: 'option',
        width: 200,
        fixed: isMobile ? false : 'right',
        render: (_, record) => [
          <a
            key="detail"
            onClick={() => {
              setCurrentRow(record);
              setShowDetail(true);
            }}
          >
            <EyeOutlined /> 详情
          </a>,
          access.canUpdateBot && (
            <a
              key="edit"
              style={{ color: '#52c41a' }}
              onClick={() => {
                handleUpdateModalOpen(true);
                setCurrentRow(record);
              }}
            >
              <EditOutlined /> {intl.formatMessage({ id: 'edit' })}
            </a>
          ),
          access.canDeleteBot && (
            <DeleteLink
              key="delete"
              onOk={async () => {
                await handleRemove([record._id!]);
                setSelectedRows([]);
                actionRef.current?.reloadAndRest?.();
              }}
            />
          ),
        ],
      },
    ],
    [isMobile, intl, access],
  );

  return (
    <PageContainer>
      <ProTable<any, any>
        headerTitle="回复规则列表"
        actionRef={actionRef}
        rowKey="_id"
        scroll={{ x: 'max-content' }}
        search={{ collapsed: false }}
        toolBarRender={() => [
          access.canCreateBot && (
            <Button type="primary" key="primary" onClick={() => handleModalOpen(true)}>
              <PlusOutlined /> <FormattedMessage id="pages.searchTable.new" defaultMessage="New" />
            </Button>
          ),
        ]}
        toolbar={{
          menu: {
            type: 'tab',
            activeKey: activeKey,
            items: [
              { label: '所有', key: '' },
              { label: '在线', key: 'true' },
              { label: '离线', key: 'false' },
            ],
            onChange: (key: any) => {
              setActiveKey(key);
              actionRef.current?.reload();
            },
          },
        }}
        request={async (params, sort, filter) => {
          const response = await queryList(
            '/reply-rules',
            { ...params, isOnline: activeKey },
            sort,
            filter,
          );
          return response;
        }}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => setSelectedRows(selectedRows),
        }}
      />

      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              已选择 <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a> 项
            </div>
          }
        >
          <DeleteButton
            onOk={async () => {
              await handleRemove(selectedRowsState?.map((item: any) => item._id!));
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          />
        </FooterToolbar>
      )}

      <Create
        open={createModalOpen}
        onOpenChange={handleModalOpen}
        onFinish={async (value: any) => {
          const success = await handleAdd(value);
          if (success) {
            handleModalOpen(false);
            actionRef.current?.reload();
          }
          return success;
        }}
      />

      <Update
        onSubmit={async (value: FormValueType) => {
          const success = await handleUpdate(value);
          if (success) {
            handleUpdateModalOpen(false);
            setCurrentRow(undefined);
            actionRef.current?.reload();
          }
        }}
        onCancel={handleUpdateModalOpen}
        updateModalOpen={updateModalOpen}
        values={currentRow || {}}
      />

      <Show
        open={showDetail}
        currentRow={currentRow}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
      />
    </PageContainer>
  );
};

export default TableList;
