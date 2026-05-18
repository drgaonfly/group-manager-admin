import { useIntl } from '@umijs/max';
import React from 'react';
import {
  ProForm,
  ProFormText,
  ProFormCheckbox,
  ProFormSwitch,
  ProFormDigit,
  ProFormDateTimePicker,
} from '@ant-design/pro-components';
import { Form, Input, Spin, Typography } from 'antd';
import useQueryList from '@/hooks/useQueryList';

const { Title } = Typography;

interface Props {
  newRecord?: boolean;
  onFinish: (formData: any) => Promise<void>;
  values?: any;
}

const BasicForm: React.FC<Props> = ({ newRecord, onFinish, values }) => {
  const intl = useIntl();

  const { items: roles, loading } = useQueryList('/roles/filter/?type=proxy');

  const filteredRolesIds = React.useMemo(() => {
    if (!roles || !Array.isArray(roles)) return [];
    return roles
      .filter((role) => role !== null && typeof role === 'object' && role._id !== null)
      .map((role: { _id: string }) => role._id);
  }, [roles]);

  const [form] = Form.useForm();
  //表单初始化filteredRoles数据更新时，确保表单中的角色选择能加载出来
  React.useEffect(() => {
    if (roles && Array.isArray(roles) && filteredRolesIds.length > 0) {
      try {
        form.setFieldsValue({
          roles: filteredRolesIds,
        });
      } catch (error) {
        console.error('Error setting form values:', error);
      }
    }
  }, [roles, filteredRolesIds, form]);

  return (
    <ProForm
      form={form}
      initialValues={{
        availableBotCount: 1,
        ...(values || {}),
      }}
      onFinish={async (values) => {
        await onFinish({
          ...values,
          roles: filteredRolesIds.filter((id) => id !== null && id !== ''), // 过滤掉空值
        });
      }}
      submitter={{
        render: (props, dom) => {
          return (
            <div style={{ textAlign: 'right' }}>
              {dom.map((button, index) => (
                <span key={index} style={{ marginLeft: 8 }}>
                  {button}
                </span>
              ))}
            </div>
          );
        },
      }}
      loading={loading}
    >
      <ProForm.Group>
        <ProForm.Group>
          <ProFormText
            rules={[{ required: true }]}
            width="md"
            label={intl.formatMessage({ id: 'name' })}
            name="name"
          />
          <ProFormText
            rules={[{ required: true }]}
            width="md"
            label={intl.formatMessage({ id: 'email' })}
            name="email"
          />
        </ProForm.Group>

        <ProForm.Group>
          <ProFormText
            rules={[{ required: newRecord }]}
            width="md"
            label={intl.formatMessage({ id: 'password' })}
            name="password"
          />

          {newRecord &&
            (loading ? (
              <Spin spinning={loading} />
            ) : (
              <ProFormCheckbox.Group
                name="roles"
                layout="horizontal"
                label={intl.formatMessage({ id: 'role_choose' })}
                options={
                  roles && Array.isArray(roles)
                    ? roles
                        .filter(
                          (role) =>
                            role !== null &&
                            typeof role === 'object' &&
                            role._id !== null &&
                            role.name !== null,
                        )
                        .map((role: { name: string; _id: string }) => ({
                          label: role.name || '',
                          value: role._id,
                        }))
                    : []
                }
                fieldProps={{
                  disabled: true, // 确保在 loading 时禁用复选框
                }}
                initialValue={filteredRolesIds}
              />
            ))}
        </ProForm.Group>

        <ProForm.Group>
          <ProFormDigit
            label={intl.formatMessage({ id: 'availableBotCount' })}
            name="availableBotCount"
            width="md"
            min={0}
            fieldProps={{
              precision: 0,
            }}
          />

          <ProFormDateTimePicker
            label={intl.formatMessage({
              id: 'function_disabledAt',
              defaultMessage: '功能禁用时间',
            })}
            name="function_disabledAt"
            width="md"
            tooltip="设置后该代理用户的所有功能将在此时间后被禁用"
            fieldProps={{
              format: 'YYYY-MM-DD HH:mm:ss',
              showTime: true,
            }}
          />
        </ProForm.Group>
      </ProForm.Group>

      <div style={{ marginTop: 16, marginBottom: 16 }}>
        <Title level={5} style={{ marginBottom: 16 }}>
          {intl.formatMessage({ id: 'botFeatures' })}
        </Title>
        <ProForm.Group>
          <ProFormSwitch label={intl.formatMessage({ id: 'bidirectional' })} name="bidirectional" />
          <ProFormSwitch label={intl.formatMessage({ id: 'groupMessage' })} name="groupMessage" />
          <ProFormSwitch
            label={intl.formatMessage({ id: 'keyboardConfig' })}
            name="keyboardConfig"
          />
          <ProFormSwitch label={intl.formatMessage({ id: 'speech_static' })} name="speech_static" />
          <ProFormSwitch label={intl.formatMessage({ id: 'groupWelcome' })} name="groupWelcome" />
          <ProFormSwitch label={intl.formatMessage({ id: 'groupVerify' })} name="groupVerify" />
          <ProFormSwitch label={intl.formatMessage({ id: 'channelPost' })} name="channelPost" />
          <ProFormSwitch
            label={intl.formatMessage({ id: 'reportGroupMemberNameUpdated' })}
            name="reportGroupMemberNameUpdated"
          />
          <ProFormSwitch label={intl.formatMessage({ id: 'replyRule' })} name="replyRule" />
          <ProFormSwitch label={intl.formatMessage({ id: 'checkinRule' })} name="checkinRule" />
          <ProFormSwitch label={intl.formatMessage({ id: 'lotteryRule' })} name="lotteryRule" />
          <ProFormSwitch label={intl.formatMessage({ id: 'auctionRule' })} name="auctionRule" />
          <ProFormSwitch label={intl.formatMessage({ id: 'teaching' })} name="teaching" />
          <ProFormSwitch label={intl.formatMessage({ id: 'adRemoval' })} name="adRemoval" />
          <ProFormSwitch label={intl.formatMessage({ id: 'rankConferral' })} name="rankConferral" />
          <ProFormSwitch label={intl.formatMessage({ id: 'recharge' })} name="recharge" />
        </ProForm.Group>
      </div>

      {!newRecord && (
        <Form.Item name="_id" label={false}>
          <Input type="hidden" />
        </Form.Item>
      )}
    </ProForm>
  );
};

export default BasicForm;
