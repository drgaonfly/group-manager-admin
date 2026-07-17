import React, { useEffect, useState } from 'react';
import { EditableProTable, type ProColumns } from '@ant-design/pro-components';
import { Card, Button, message, Divider, Form, Input, InputNumber } from 'antd';
import { simpleGet, updateItem } from '@/services/ant-design-pro/api';
import { useModel } from '@umijs/max';

interface SubscriptionPlan {
  id: string;
  label: string;
  months: number;
  price: number;
}

const SystemSetting: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<SubscriptionPlan[]>([]);
  const { initialState } = useModel('@@initialState');
  const currentUser = initialState?.currentUser;

  // 加载设置
  const loadSetting = async () => {
    setLoading(true);
    try {
      const res: any = await simpleGet('/settings');
      if (res?.data) {
        const { subscriptionPlans, ...otherFields } = res.data;
        form.setFieldsValue(otherFields);

        // 转换订阅套餐数据，添加唯一 id
        const plansWithId = (subscriptionPlans || []).map((plan: any, index: number) => ({
          ...plan,
          id: `plan_${index}`,
        }));
        setDataSource(plansWithId);
      }
    } catch (err: any) {
      message.error(err?.response?.data?.message || '加载设置失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSetting();
  }, []);

  // 保存设置
  const handleSubmit = async (values: any) => {
    if (!currentUser?.isAdmin) {
      message.error('只有管理员可以修改系统设置');
      return;
    }

    setLoading(true);
    try {
      // 移除 id 字段，只保留实际数据
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const subscriptionPlans = dataSource.map(({ id: _id, ...plan }) => plan);

      await updateItem('/settings', {
        ...values,
        subscriptionPlans,
      });
      message.success('设置保存成功');
      loadSetting();
    } catch (err: any) {
      message.error(err?.response?.data?.message || '保存设置失败');
    } finally {
      setLoading(false);
    }
  };

  const columns: ProColumns<SubscriptionPlan>[] = [
    {
      title: '套餐名称',
      dataIndex: 'label',
      width: '25%',
      formItemProps: {
        rules: [{ required: true, message: '请输入套餐名称' }],
      },
    },
    {
      title: '月数',
      dataIndex: 'months',
      width: '25%',
      valueType: 'digit',
      fieldProps: {
        min: 1,
        addonAfter: '月',
      },
      formItemProps: {
        rules: [{ required: true, message: '请输入月数' }],
      },
    },
    {
      title: '价格',
      dataIndex: 'price',
      width: '25%',
      valueType: 'digit',
      fieldProps: {
        min: 0,
        addonAfter: 'USDT',
      },
      formItemProps: {
        rules: [{ required: true, message: '请输入价格' }],
      },
    },
    {
      title: '操作',
      valueType: 'option',
      width: '25%',
      render: (_text, record, _index, action) => [
        <a
          key="edit"
          onClick={() => {
            action?.startEditable?.(record.id);
          }}
        >
          编辑
        </a>,
        <a
          key="delete"
          onClick={() => {
            setDataSource(dataSource.filter((item) => item.id !== record.id));
          }}
          style={{ color: 'red' }}
        >
          删除
        </a>,
      ],
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card title="系统设置" loading={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            defaultFreeDays: 7,
            orderTimeoutMinutes: 30,
            subscriptionPlans: [
              { months: 1, price: 15, label: '一个月' },
              { months: 900, price: 400, label: '永久' },
            ],
          }}
        >
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              label="默认免费天数"
              name="defaultFreeDays"
              rules={[{ required: true, message: '请输入默认免费天数' }]}
              extra="新克隆的专属机器人默认免费使用天数"
              style={{ flex: 1 }}
            >
              <InputNumber min={0} style={{ width: '100%' }} disabled={!currentUser?.isAdmin} />
            </Form.Item>

            <Form.Item
              label="TRC20 充值地址"
              name="trx20Address"
              rules={[{ required: true, message: '请输入 TRC20 地址' }]}
              extra="用于接收 USDT 充值的 TRC20 地址"
              style={{ flex: 1 }}
            >
              <Input placeholder="请输入 TRC20 地址" disabled={!currentUser?.isAdmin} />
            </Form.Item>

            <Form.Item
              label="订单超时时间（分钟）"
              name="orderTimeoutMinutes"
              rules={[{ required: true, message: '请输入订单超时时间' }]}
              extra="订单未支付的超时时间，单位：分钟"
              style={{ flex: 1 }}
            >
              <InputNumber min={1} style={{ width: '100%' }} disabled={!currentUser?.isAdmin} />
            </Form.Item>
          </div>

          <Divider>订阅套餐配置</Divider>

          <EditableProTable<SubscriptionPlan>
            rowKey="id"
            value={dataSource}
            onChange={(value) => setDataSource(value as SubscriptionPlan[])}
            columns={columns}
            recordCreatorProps={
              currentUser?.isAdmin
                ? {
                    newRecordType: 'dataSource',
                    record: () => ({
                      id: `plan_${Date.now()}`,
                      label: '',
                      months: 1,
                      price: 0,
                    }),
                    creatorButtonText: '添加订阅套餐',
                  }
                : false
            }
            editable={{
              type: 'multiple',
              editableKeys,
              onValuesChange: (_record, recordList) => {
                setDataSource(recordList as SubscriptionPlan[]);
              },
              onChange: setEditableRowKeys,
              actionRender: (_row, _config, defaultDom) => [defaultDom.save, defaultDom.cancel],
            }}
            bordered
            pagination={false}
          />

          <Divider />

          <Form.Item>
            <Button
              type="primary"
              onClick={() => form.submit()}
              loading={loading}
              disabled={!currentUser?.isAdmin}
            >
              保存设置
            </Button>
            {!currentUser?.isAdmin && (
              <div style={{ marginTop: 8, color: '#999' }}>只有管理员可以修改系统设置</div>
            )}
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default SystemSetting;
