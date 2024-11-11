import { useIntl } from '@umijs/max';
import { queryList, removeItem, addItem } from '@/services/ant-design-pro/api';
import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  PageContainer,
  ProTable,
  ModalForm,
  ProFormDigit,
  ProFormSelect,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { FormattedMessage } from '@umijs/max';
import { Button, message, Modal } from 'antd';
import React, { useRef, useState } from 'react';

const TableList: React.FC = () => {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);

  const columns: ProColumns<any>[] = [
    {
      title: intl.formatMessage({ id: 'pages.bills.amount' }),
      dataIndex: 'amount',
      valueType: 'money',
      sorter: true,
      search: true,
      fieldProps: {
        placeholder: intl.formatMessage({ id: 'pages.bills.amount.placeholder' }),
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.bills.type' }),
      dataIndex: 'type',
      valueEnum: {
        income: {
          text: intl.formatMessage({ id: 'pages.bills.income' }),
          status: 'Success',
        },
        expense: {
          text: intl.formatMessage({ id: 'pages.bills.expense' }),
          status: 'Error',
        },
      },
      fieldProps: {
        placeholder: intl.formatMessage({ id: 'pages.bills.type.placeholder' }),
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.bills.description' }),
      dataIndex: 'description',
      ellipsis: true,
      hideInSearch: true,
      fieldProps: {
        placeholder: intl.formatMessage({ id: 'pages.bills.description.placeholder' }),
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.bills.createTime' }),
      dataIndex: 'createTime',
      valueType: 'dateTime',
      sorter: true,
      hideInSearch: true,
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" />,
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        <Button
          key="delete"
          type="link"
          onClick={() => {
            Modal.confirm({
              title: intl.formatMessage({ id: 'pages.bills.confirmDelete' }),
              onOk: async () => {
                try {
                  await removeItem('/bills', { ids: [record._id] });
                  message.success('删除成功');
                  actionRef.current?.reload();
                } catch (error) {
                  message.error('删除失败');
                }
              },
            });
          }}
        >
          {intl.formatMessage({ id: 'pages.bills.delete' })}
        </Button>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable
        headerTitle={intl.formatMessage({ id: 'pages.bills.list' })}
        actionRef={actionRef}
        rowKey="_id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button type="primary" key="primary" onClick={() => setCreateModalVisible(true)}>
            <PlusOutlined />
            <FormattedMessage id="pages.bills.new" />
          </Button>,
        ]}
        request={async (params, sort, filter) => {
          try {
            return await queryList('/bills', params, sort, filter);
          } catch (error) {
            message.error('获取数据失败');
            return {
              data: [],
              success: false,
              total: 0,
            };
          }
        }}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
      />

      <ModalForm
        title={intl.formatMessage({ id: 'pages.bills.new' })}
        open={createModalVisible}
        onOpenChange={setCreateModalVisible}
        onFinish={async (values) => {
          try {
            await addItem('/bills', values);
            message.success('创建成功');
            setCreateModalVisible(false);
            actionRef.current?.reload();
            return true;
          } catch (error) {
            message.error('创建失败');
            return false;
          }
        }}
      >
        <ProFormDigit
          name="amount"
          label={intl.formatMessage({ id: 'pages.bills.amount' })}
          placeholder={intl.formatMessage({ id: 'pages.bills.amount.placeholder' })}
          rules={[{ required: true }]}
          min={0}
          fieldProps={{
            precision: 2,
          }}
        />
        <ProFormSelect
          name="type"
          label={intl.formatMessage({ id: 'pages.bills.type' })}
          placeholder={intl.formatMessage({ id: 'pages.bills.type.placeholder' })}
          options={[
            {
              label: intl.formatMessage({ id: 'pages.bills.income' }),
              value: 'income',
            },
            {
              label: intl.formatMessage({ id: 'pages.bills.expense' }),
              value: 'expense',
            },
          ]}
          rules={[{ required: true }]}
        />
        <ProFormTextArea
          name="description"
          label={intl.formatMessage({ id: 'pages.bills.description' })}
          placeholder={intl.formatMessage({ id: 'pages.bills.description.placeholder' })}
        />
      </ModalForm>

      {selectedRows.length > 0 && (
        <div style={{ backgroundColor: '#fff', padding: 24, marginTop: 24 }}>
          <span>
            <FormattedMessage id="pages.bills.chosen" /> {selectedRows.length}{' '}
            <FormattedMessage id="pages.bills.item" />
          </span>
          <Button
            style={{ marginLeft: 8 }}
            danger
            onClick={() => {
              Modal.confirm({
                title: intl.formatMessage({ id: 'pages.bills.batchDelete' }),
                onOk: async () => {
                  try {
                    await removeItem('/bills', {
                      ids: selectedRows.map((row) => row._id),
                    });
                    message.success('批量删除成功');
                    setSelectedRows([]);
                    actionRef.current?.reload();
                  } catch (error) {
                    message.error('批量删除失败');
                  }
                },
              });
            }}
          >
            <FormattedMessage id="pages.bills.batchDeletion" />
          </Button>
        </div>
      )}
    </PageContainer>
  );
};

export default TableList;
