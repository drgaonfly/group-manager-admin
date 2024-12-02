import { useIntl } from '@umijs/max';
import { addItem, queryList, removeItem, updateItem } from '@/services/ant-design-pro/api';
import { PlusOutlined } from '@ant-design/icons';
import type {
  ActionType,
  ProColumns,
  ProDescriptionsItemProps,
  ProFormInstance,
} from '@ant-design/pro-components';
import { FooterToolbar, PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useAccess } from '@umijs/max';
import { Button, message, Modal } from 'antd';
import React, { useRef, useState } from 'react';
import type { FormValueType } from './components/Update';
import Update from './components/Update';
import Create from './components/Create';
import Show from './components/Show';
import DeleteLink from '@/components/DeleteLink';

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: API.ItemData) => {
  const hide = message.loading('Adding...');
  try {
    await addItem('/resumes', { ...fields });
    console.log('_________________', fields);
    hide();
    message.success('Added successfully');
    return true;
  } catch (error: any) {
    hide();
    message.error(error?.response?.data?.message ?? 'Adding failed, please try again!');
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
  const hide = message.loading('Updating...');
  try {
    await updateItem(`/resumes/${fields._id}`, fields);
    hide();

    message.success('Updated successfully');
    return true;
  } catch (error: any) {
    hide();
    message.error(error?.response?.data?.message ?? 'Update failed, please try again!');
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
  const hide = message.loading('Removing...');
  if (!ids) return true;
  try {
    console.log('Attempting to delete:', ids);
    const response = await removeItem('/resumes', {
      ids,
    });
    console.log('zhel', 'Delete response:', response);
    hide();
    message.success('Deleted successfully and will refresh soon');
    return true;
  } catch (error: any) {
    console.error('Delete error:', error);
    hide();
    message.error(error.response.data.message ?? 'Delete failed, please try again');
    return false;
  }
};

const TableList: React.FC = () => {
  const intl = useIntl();
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

  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const [currentRow, setCurrentRow] = useState<API.ItemData>();
  const [selectedRowsState, setSelectedRows] = useState<API.ItemData[]>([]);
  const access = useAccess();
  const [showDetail, setShowDetail] = useState<boolean>(false);
  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const columns: ProColumns<API.ItemData>[] = [
    {
      title: intl.formatMessage({ id: 'resume.customer' }),
      dataIndex: ['customer', 'username'],
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              setCurrentRow(entity);
              setShowDetail(true);
            }}
          >
            {dom}
          </a>
        );
      },
    },
    {
      title: intl.formatMessage({ id: 'resume.fullName' }),
      dataIndex: 'fullName',
    },
    {
      title: intl.formatMessage({ id: 'resume.birthDate' }),
      dataIndex: 'birthDate',
      valueType: 'date',
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'resume.location' }),
      dataIndex: 'location',
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'resume.degree' }),
      dataIndex: 'degree',
      valueEnum: {
        Bachelor: { text: intl.formatMessage({ id: 'resume.degree.bachelor' }) },
        Master: { text: intl.formatMessage({ id: 'resume.degree.master' }) },
        Doctor: { text: intl.formatMessage({ id: 'resume.degree.doctor' }) },
        Other: { text: intl.formatMessage({ id: 'resume.degree.other' }) },
      },
    },
    {
      title: intl.formatMessage({ id: 'resume.school' }),
      dataIndex: 'school',
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'resume.major' }),
      dataIndex: 'major',
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'resume.teachingYears' }),
      dataIndex: 'teachingYears',
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'resume.teachingLevel' }),
      dataIndex: 'teachingLevel',
      valueEnum: {
        Primary: { text: intl.formatMessage({ id: 'resume.level.primary' }) },
        Junior: { text: intl.formatMessage({ id: 'resume.level.junior' }) },
        Senior: { text: intl.formatMessage({ id: 'resume.level.senior' }) },
        College: { text: intl.formatMessage({ id: 'resume.level.college' }) },
        Other: { text: intl.formatMessage({ id: 'resume.level.other' }) },
      },
    },
    {
      title: intl.formatMessage({ id: 'resume.status' }),
      dataIndex: 'status',
      valueEnum: {
        draft: {
          text: intl.formatMessage({ id: 'resume.status.draft' }),
          status: 'Default',
        },
        published: {
          text: intl.formatMessage({ id: 'resume.status.published' }),
          status: 'Success',
        },
      },
    },

    {
      title: <FormattedMessage id="pages.searchTable.titleOption" />,
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        <a
          key="edit"
          onClick={() => {
            handleUpdateModalOpen(true);
            setCurrentRow(record);
          }}
        >
          {intl.formatMessage({ id: 'edit' })}
        </a>,
        <DeleteLink
          key="delete"
          onOk={async () => {
            await handleRemove([record._id!]);
            actionRef.current?.reloadAndRest?.();
          }}
        />,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.ItemData, API.PageParams>
        headerTitle={intl.formatMessage({ id: 'pages.bot.list' })}
        actionRef={actionRef}
        rowKey="_id"
        search={{
          labelWidth: 120,
          collapsed: false,
          span: {
            xs: 24, // 手机端占满
            sm: 24, // 平板端占满
            md: 6, // 电脑端
            lg: 6, // 大屏幕
            xl: 6, // 超大屏幕
            xxl: 6, // 超超大屏幕
          },
        }}
        formRef={formRef}
        toolbar={{}}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              handleModalOpen(true);
            }}
          >
            <PlusOutlined /> <FormattedMessage id="pages.searchTable.new" defaultMessage="New" />
          </Button>,
        ]}
        request={async (params, sort, filter) => queryList('/resumes', params, sort, filter)}
        pagination={{
          defaultPageSize: 10,
          showQuickJumper: true,
        }}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
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
          {(access.canSuperAdmin || access.canDeleteResume) && (
            <Button
              danger
              onClick={() => {
                return Modal.confirm({
                  title: intl.formatMessage({ id: 'modal.delete.title' }),
                  onOk: async () => {
                    await handleRemove(selectedRowsState?.map((item) => item._id!));
                    setSelectedRows([]);
                    actionRef.current?.reloadAndRest?.();
                  },
                  content: intl.formatMessage({ id: 'modal.delete.content' }),
                  okText: intl.formatMessage({ id: 'modal.okText' }),
                  cancelText: intl.formatMessage({ id: 'modal.cancelText' }),
                });
              }}
            >
              <FormattedMessage
                id="pages.searchTable.batchDeletion"
                defaultMessage="Batch deletion"
              />
            </Button>
          )}
        </FooterToolbar>
      )}
      {(access.canSuperAdmin || access.canCreateResume) && (
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
      {(access.canSuperAdmin || access.canCreateResume) && (
        <Show
          open={showDetail}
          currentRow={currentRow as API.ItemData}
          columns={columns as ProDescriptionsItemProps<API.ItemData>[]}
          onClose={() => {
            setCurrentRow(undefined);
            setShowDetail(false);
          }}
        />
      )}
      {(access.canSuperAdmin || access.canUpdateResume) && (
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
    </PageContainer>
  );
};

export default TableList;
