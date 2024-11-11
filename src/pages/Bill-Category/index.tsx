import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Button } from 'antd';
import React, { useRef } from 'react';

// 定义数据类型
type BillCategoryItem = {
  id: number;
  name: string;
  code: string;
  status: string;
  createTime: string;
  updateTime: string;
};

const BillCategory: React.FC = () => {
  const actionRef = useRef<ActionType>();

  // 定义表格列
  const columns: ProColumns<BillCategoryItem>[] = [
    {
      title: '类目名称',
      dataIndex: 'name',
      width: 200,
    },
    {
      title: '类目编码',
      dataIndex: 'code',
      width: 200,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      valueEnum: {
        0: { text: '禁用', status: 'Error' },
        1: { text: '启用', status: 'Success' },
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 200,
      valueType: 'dateTime',
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      width: 200,
      valueType: 'dateTime',
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      width: 120,
      render: (_, record: BillCategoryItem) => [
        <a
          key="edit"
          onClick={() => {
            console.log('编辑', record.id);
          }}
        >
          编辑
        </a>,
        <a
          key="delete"
          onClick={() => {
            console.log('删除', record.id);
          }}
        >
          删除
        </a>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<BillCategoryItem>
        headerTitle="账单类目列表"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button type="primary" key="primary" onClick={() => {}}>
            <PlusOutlined /> 新建
          </Button>,
        ]}
        // request={async (params, sorter, filter) => {
        //   // 这里需要实现接口调用
        //   // const { data, success } = await queryBillCategory({ ...params, sorter, filter });
        //   // return {
        //   //   data: data || [],
        //   //   success,
        //   // };
        // }}
        columns={columns}
      />
    </PageContainer>
  );
};

export default BillCategory;
