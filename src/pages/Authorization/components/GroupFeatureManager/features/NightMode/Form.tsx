import React, { useEffect, useState } from 'react';
import { Modal, Form, Switch, TimePicker, Row, Col, message, Alert } from 'antd';
import { request } from '@umijs/max';
import dayjs from 'dayjs';

/** 分钟数（0–1439）→ dayjs 对象，直接用 hour/minute 设置，不依赖 utc 插件 */
const minutesToDayjs = (minutes: number) =>
  dayjs()
    .hour(Math.floor(minutes / 60))
    .minute(minutes % 60)
    .second(0)
    .millisecond(0);

/** dayjs 对象 → 分钟数 */
const dayjsToMinutes = (d: dayjs.Dayjs) => d.hour() * 60 + d.minute();

interface Props {
  visible: boolean;
  record?: any;
  bot: any;
  group: any;
  onClose: (refresh?: boolean) => void;
}

const NightModeForm: React.FC<Props> = ({ visible, record, bot, group, onClose }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    if (record?._id) {
      form.setFieldsValue({
        isActive: record.isActive,
        startAt: minutesToDayjs(record.startAt),
        endAt: minutesToDayjs(record.endAt),
      });
    } else {
      form.setFieldsValue({
        isActive: true,
        startAt: minutesToDayjs(22 * 60), // 22:00
        endAt: minutesToDayjs(8 * 60), // 08:00
      });
    }
  }, [visible, record]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const payload = {
        isActive: values.isActive,
        startAt: dayjsToMinutes(values.startAt as dayjs.Dayjs),
        endAt: dayjsToMinutes(values.endAt as dayjs.Dayjs),
        bot: bot._id,
        group: group._id,
      };

      if (record?._id) {
        await request(`/night-modes/${record._id}`, { method: 'PUT', data: payload });
        message.success('更新成功');
      } else {
        await request('/night-modes', { method: 'POST', data: payload });
        message.success('创建成功');
      }

      onClose(true);
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err?.response?.data?.message ?? err?.message ?? '操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={record?._id ? '编辑夜间模式' : '新建夜间模式'}
      open={visible}
      onCancel={() => onClose()}
      onOk={handleOk}
      confirmLoading={loading}
      width={440}
      destroyOnClose
    >
      <Alert
        message="时间基于 UTC。跨午夜区间自动支持（如 22:00 ~ 08:00）。Bot 需拥有管理员权限才能修改群组权限。"
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Form form={form} layout="vertical">
        <Form.Item name="isActive" label="启用夜间模式" valuePropName="checked">
          <Switch checkedChildren="启用" unCheckedChildren="禁用" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="startAt"
              label="开始时间（UTC）"
              rules={[{ required: true, message: '请选择开始时间' }]}
            >
              <TimePicker
                format="HH:mm"
                minuteStep={5}
                showSecond={false}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="endAt"
              label="结束时间（UTC）"
              rules={[{ required: true, message: '请选择结束时间' }]}
            >
              <TimePicker
                format="HH:mm"
                minuteStep={5}
                showSecond={false}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default NightModeForm;
