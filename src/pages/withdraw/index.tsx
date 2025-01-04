// import { useIntl } from '@umijs/max';
import { addItem, queryList, removeItem, updateItem } from '@/services/ant-design-pro/api';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { FooterToolbar, PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useAccess } from '@umijs/max';
import { message, Modal } from 'antd';
import React, { useRef, useState } from 'react';
import type { FormValueType } from './components/Update';
import Update from './components/Update';
import Create from './components/Create';
import Show from './components/Show';
import DeleteButton from '@/components/DeleteButton';
import DeleteLink from '@/components/DeleteLink';
import { Card, Row, Col, Button, Statistic } from 'antd';
/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: API.ItemData) => {
  const hide = message.loading(<FormattedMessage id="adding" defaultMessage="Adding..." />);
  try {
    await addItem('/withdraws', { ...fields });
    hide();
    message.success(<FormattedMessage id="add_successful" defaultMessage="Added successfully" />);
    return true;
  } catch (error: any) {
    hide();
    message.error(
      error?.response?.data?.message ?? (
        <FormattedMessage id="upload_failed" defaultMessage="Upload failed, please try again!" />
      ),
    );
    return false;
  }
};

/**
 * @en-US Update node
 * @zh-CN 更新节点
 *
 * @param fields
 */
const handleUpdate = async (fields: FormValueType) => {
  const hide = message.loading(<FormattedMessage id="updating" defaultMessage="Updating..." />);
  try {
    await updateItem(`/withdraws/${fields._id}`, fields);
    hide();

    message.success(<FormattedMessage id="update_successful" defaultMessage="Update successful" />);
    return true;
  } catch (error: any) {
    hide();
    message.error(
      error?.response?.data?.message ?? (
        <FormattedMessage id="update_failed" defaultMessage="Update failed, please try again!" />
      ),
    );
    return false;
  }
};

/**
 *  Delete node
 * @zh-CN 删除节点
 *
 * @param selectedRows
 */
const handleRemove = async (ids: string[]) => {
  const hide = message.loading(<FormattedMessage id="deleting" defaultMessage="Deleting..." />);
  if (!ids) return true;
  try {
    await removeItem('/withdraws', {
      ids,
    });
    hide();
    message.success(
      <FormattedMessage
        id="delete_successful"
        defaultMessage="Deleted successfully and will refresh soon"
      />,
    );
    return true;
  } catch (error: any) {
    hide();
    message.error(
      error.response.data.message ?? (
        <FormattedMessage id="delete_failed" defaultMessage="Delete failed, please try again" />
      ),
    );
    return false;
  }
};

const WithdrawPage: React.FC = () => {
  // const intl = useIntl();
  /**
   * @en-US Pop-up window of new window
   * @zh-CN 新建窗口的弹窗
   *  */
  const [createModalOpen, handleModalOpen] = useState<boolean>(false);
  /**2024fc.xyz
   * @en-US The pop-up window of the distribution update window
   * @zh-CN 分布更新窗口的弹窗
   * */
  const [updateModalOpen, handleUpdateModalOpen] = useState<boolean>(false);
  // const [batchUploadPriceModalOpen, setBatchUploadPriceModalOpen] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.ItemData>();
  const [selectedRowsState, setSelectedRows] = useState<API.ItemData[]>([]);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const access = useAccess();

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  // Define roles object with index signature

  const columns: ProColumns<API.ItemData>[] = [
    {
      title: '提现编号',
      dataIndex: 'withdrawalNumber',
      copyable: true,
      hideInSearch: true,
    },
    {
      title: '申请时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      hideInSearch: false,
      search: {
        transform: (value) => {
          return {
            startTime: value[0],
            endTime: value[1],
          };
        },
      },
    },
    {
      title: '提现方式',
      dataIndex: 'withdrawalMethod',
      valueType: 'select',
      valueEnum: {
        WeChat: { text: '微信' },
        Alipay: { text: '支付宝' },
        Cash: { text: '现金' },
        Other: { text: '其他' },
      },
    },
    {
      title: '审核状态',
      dataIndex: 'reviewStatus',
      valueType: 'select',
      valueEnum: {
        unreviewed: { text: '待审核', status: 'default' },
        reviewed: { text: '已审核', status: 'success' },
      },
    },
    {
      title: '打款状态',
      dataIndex: 'paymentStatus',
      valueType: 'select',
      valueEnum: {
        unpaid: { text: '待打款', status: 'default' },
        paid: { text: '已打款', status: 'success' },
      },
    },
    {
      title: '提现金额(元)',
      dataIndex: 'amount',
      valueType: 'money',
      hideInSearch: true,
      search: false,
    },
    {
      title: '用户信息',
      dataIndex: ['user', 'username'],
      hideInSearch: true,
      render: (_, record) => <span>{record.user?.username || '-'}</span>,
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Operating" />,
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        access.canSuperAdmin && (
          <a
            key="edit"
            onClick={() => {
              setCurrentRow(record);
              handleUpdateModalOpen(true);
            }}
          >
            编辑
          </a>
        ),
        access.canSuperAdmin && (
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
  ];

  const handleWithdrawClick = () => {
    Modal.warning({
      title: '无法申请提现',
      content: '您的可用余额不足，暂时无法申请提现。',
      okText: '知道了',
    });
  };

  return (
    <PageContainer>
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={24}>
          <Col span={8}>
            <Statistic title="可用余额" value={0.0} precision={2} suffix="元" />
            <Button type="primary" style={{ marginTop: 16 }} onClick={handleWithdrawClick}>
              申请提现
            </Button>
          </Col>
          <Col span={8}>
            <Statistic title="不可用余额" value={0.0} precision={2} suffix="元" />
          </Col>
        </Row>
      </Card>

      <ProTable<API.ItemData, API.PageParams>
        headerTitle="提现记录"
        actionRef={actionRef}
        rowKey="_id"
        search={{ labelWidth: 120 }}
        request={async (params, sort, filter) => queryList('/withdraws', params, sort, filter)}
        columns={columns}
        rowSelection={
          access.canSuperAdmin && {
            onChange: (_, selectedRows) => {
              setSelectedRows(selectedRows);
            },
          }
        }
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              <FormattedMessage id="pages.searchTable.chosen" defaultMessage="Chosen" />{' '}
              <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a>{' '}
              <FormattedMessage id="pages.searchTable.item" defaultMessage="项" />
            </div>
          }
        >
          {(access.canSuperAdmin || access.canDeleteWithdraw) && (
            <DeleteButton
              onOk={async () => {
                await handleRemove(selectedRowsState?.map((item: any) => item._id!));
                setSelectedRows([]);
                actionRef.current?.reloadAndRest?.();
              }}
            />
          )}
        </FooterToolbar>
      )}
      {(access.canSuperAdmin || access.canCreateWithdraw) && (
        <Create
          open={createModalOpen}
          onOpenChange={handleModalOpen}
          onFinish={async (value) => {
            const success = await handleAdd(value as API.ItemData);
            if (success) {
              handleModalOpen(false);
              if (actionRef.current) {
                actionRef.current.reload();
              }
            }
          }}
        />
      )}
      {(access.canSuperAdmin || access.canUpdateWithdraw) && (
        <Update
          onSubmit={async (value) => {
            const success = await handleUpdate(value);
            if (success) {
              handleUpdateModalOpen(false);
              setCurrentRow(undefined);
              if (actionRef.current) {
                actionRef.current.reload();
              }
            }
          }}
          onCancel={handleUpdateModalOpen}
          updateModalOpen={updateModalOpen}
          values={currentRow || {}}
        />
      )}
      <Show
        open={showDetail}
        currentRow={currentRow as API.ItemData}
        columns={columns as ProDescriptionsItemProps<API.ItemData>[]}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
      />
    </PageContainer>
  );
};

export default WithdrawPage;
