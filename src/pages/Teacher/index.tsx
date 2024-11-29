import { useIntl } from '@umijs/max';
import { addItem, queryList, removeItem, updateItem } from '@/services/ant-design-pro/api';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { FooterToolbar, PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useAccess } from '@umijs/max';
import { Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import React, { useRef, useState } from 'react';
import type { FormValueType } from './components/Update';
import Update from './components/Update';
import Create from './components/Create';
import Show from './components/Show';
import DeleteButton from '@/components/DeleteButton';
import DeleteLink from '@/components/DeleteLink';
// import DeleteLink from '@/components/DeleteLink';

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: API.ItemData) => {
  const hide = message.loading(<FormattedMessage id="adding" defaultMessage="Adding..." />);
  try {
    await addItem('/teachers', { ...fields });
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
    await updateItem(`/teachers/${fields._id}`, fields);
    console.log('Update Form Data:', fields);
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
    await removeItem('/teachers', {
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
      title: intl.formatMessage({ id: 'pages.teacher.avatar' }),
      dataIndex: 'image',
      hideInSearch: true,
      render: (_, record) => (
        <img
          src={record.avatar}
          alt="avatar"
          style={{
            width: '45px',
            height: '45px',
            borderRadius: '50%',
            objectFit: 'cover',
          }}
        />
      ),
    },
    {
      title: intl.formatMessage({ id: 'username' }),
      dataIndex: 'username',
      copyable: true,
      render: (dom, entity) => (
        <a
          onClick={() => {
            setCurrentRow(entity);
            setShowDetail(true);
          }}
        >
          {dom}
        </a>
      ),
    },
    {
      title: intl.formatMessage({ id: 'email' }),
      dataIndex: 'email',
      copyable: true,
    },
    {
      title: intl.formatMessage({ id: 'phone' }),
      dataIndex: 'phone',
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({ id: 'address' }),
      dataIndex: 'address',
      hideInSearch: true,
      ellipsis: true,
    },
    {
      title: intl.formatMessage({ id: 'pages.teacher.education', defaultMessage: '学历' }),
      dataIndex: 'education',
      valueType: 'select',
      valueEnum: {
        bachelor: {
          text: intl.formatMessage({ id: 'pages.teacher.education.bachelor' }),
        },
        master: {
          text: intl.formatMessage({ id: 'pages.teacher.education.master' }),
        },
        doctor: {
          text: intl.formatMessage({ id: 'pages.teacher.education.doctor' }),
        },
        other: {
          text: intl.formatMessage({ id: 'pages.teacher.education.other' }),
        },
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.teacher.teachingAge', defaultMessage: '教龄' }),
      dataIndex: 'teachingAge',
      valueType: 'digit',
      hideInSearch: true,
      sorter: true,
    },
    {
      title: intl.formatMessage({ id: 'pages.teacher.title', defaultMessage: '职称' }),
      dataIndex: 'title',
      valueType: 'select',
      valueEnum: {
        teacher: {
          text: intl.formatMessage({ id: 'pages.teacher.title.teacher' }),
        },
        gradeDirector: {
          text: intl.formatMessage({ id: 'pages.teacher.title.gradeDirector' }),
        },
        groupLeader: {
          text: intl.formatMessage({ id: 'pages.teacher.title.groupLeader' }),
        },
        viceDirector: {
          text: intl.formatMessage({ id: 'pages.teacher.title.viceDirector' }),
        },
        director: {
          text: intl.formatMessage({ id: 'pages.teacher.title.director' }),
        },
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.teacher.lessonCategory' }),
      dataIndex: 'lessonCategory',
      valueType: 'select',
      search: false,
      fieldProps: {
        mode: 'multiple', // 设置多选
      },
      valueEnum: {
        Speaking: { text: intl.formatMessage({ id: 'pages.teacher.lessonCategory.speaking' }) },
        Writing: { text: intl.formatMessage({ id: 'pages.teacher.lessonCategory.writing' }) },
        Listening: { text: intl.formatMessage({ id: 'pages.teacher.lessonCategory.listening' }) },
        Reading: { text: intl.formatMessage({ id: 'pages.teacher.lessonCategory.reading' }) },
        Spelling: { text: intl.formatMessage({ id: 'pages.teacher.lessonCategory.spelling' }) },
        Grammar: { text: intl.formatMessage({ id: 'pages.teacher.lessonCategory.grammar' }) },
        Pronunciation: {
          text: intl.formatMessage({ id: 'pages.teacher.lessonCategory.pronunciation' }),
        },
        All: { text: intl.formatMessage({ id: 'pages.teacher.lessonCategory.all' }) },
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.teacher.speaks' }),
      dataIndex: 'speaks',
      valueType: 'select',
      fieldProps: {
        mode: 'multiple', // 设置多选
      },
      valueEnum: {
        Spanish: { text: intl.formatMessage({ id: 'pages.teacher.speaks.spanish' }) },
        Japanese: { text: intl.formatMessage({ id: 'pages.teacher.speaks.japanese' }) },
        French: { text: intl.formatMessage({ id: 'pages.teacher.speaks.french' }) },
        English: { text: intl.formatMessage({ id: 'pages.teacher.speaks.english' }) },
        'Chinese (Mandarin)': { text: intl.formatMessage({ id: 'pages.teacher.speaks.chinese' }) },
      },
      search: false,
    },
    {
      title: intl.formatMessage({ id: 'pages.teacher.teacherType' }),
      dataIndex: 'teacherType',
      search: false,
      valueType: 'select',
      valueEnum: {
        Both: { text: intl.formatMessage({ id: 'pages.teacher.teacherType.both' }) },
        'Community Tutor': {
          text: intl.formatMessage({ id: 'pages.teacher.teacherType.communityTutor' }),
        },
        'Professional Teacher': {
          text: intl.formatMessage({ id: 'pages.teacher.teacherType.professionalTeacher' }),
        },
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.teacher.level' }),
      dataIndex: 'level',
      valueType: 'select',
      search: false,
      valueEnum: {
        Basic: { text: intl.formatMessage({ id: 'pages.teacher.level.basic' }) },
        Intermediate: { text: intl.formatMessage({ id: 'pages.teacher.level.intermediate' }) },
        Advanced: { text: intl.formatMessage({ id: 'pages.teacher.level.advanced' }) },
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.teacher.employmentType' }),
      dataIndex: 'employmentType',
      valueType: 'select',
      search: false,
      valueEnum: {
        'Full-time': { text: intl.formatMessage({ id: 'pages.teacher.employmentType.fullTime' }) },
        'Part-time': { text: intl.formatMessage({ id: 'pages.teacher.employmentType.partTime' }) },
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.teacher.hoursPerWeek' }),
      dataIndex: 'hoursPerWeek',
      valueType: 'digit',
      hideInSearch: true,
      sorter: true,
      render: (val, record) => {
        console.log('hoursPerWeek:', {
          value: val,
          type: typeof val,
          record: record.hoursPerWeek,
        });

        const hours = record.hoursPerWeek;

        const displayHours = Number.isFinite(hours) ? hours : 0;

        return `${displayHours} ${intl.formatMessage({ id: 'pages.teacher.hours' })}`;
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.teacher.introduction' }),
      dataIndex: 'introduction',
      valueType: 'text',
      hideInSearch: true,
      ellipsis: true,
      width: 200,
    },
    {
      title: intl.formatMessage({ id: 'created_at' }),
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      hideInSearch: true,
      sorter: true,
    },
    {
      title: intl.formatMessage({ id: 'updated_at' }),
      dataIndex: 'updatedAt',
      valueType: 'dateTime',
      hideInSearch: true,
      sorter: true,
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="操作" />,
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        access.canSuperAdmin && (
          <a
            key="edit"
            onClick={() => {
              handleUpdateModalOpen(true);
              setCurrentRow(record);
            }}
          >
            {intl.formatMessage({ id: 'edit' })}
          </a>
        ),
        access.canSuperAdmin && (
          <DeleteLink
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

  return (
    <PageContainer>
      <ProTable<API.ItemData, API.PageParams>
        headerTitle={intl.formatMessage({ id: 'list' })}
        actionRef={actionRef}
        rowKey="_id"
        search={{
          labelWidth: 85,
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
        scroll={{
          x: 2000, // 设置水平滚动宽度
        }}
        size="large"
        tableLayout="fixed" //
        toolBarRender={() => [
          access.canSuperAdmin && (
            <Button
              type="primary"
              key="primary"
              onClick={() => {
                handleModalOpen(true);
              }}
            >
              <PlusOutlined /> <FormattedMessage id="pages.searchTable.new" defaultMessage="New" />
            </Button>
          ),
        ]}
        request={async (params, sort, filter) => queryList('/teachers', params, sort, filter)}
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
          {(access.canSuperAdmin || access.canDeleteMenu) && (
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
      {(access.canSuperAdmin || access.canCreateMenu) && (
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
      {(access.canSuperAdmin || access.canUpdateMenu) && (
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

export default TableList;
