import { useIntl } from '@umijs/max';
import React, { useState } from 'react';
import { Tag, Space, Button, Badge } from 'antd';
import { PlusOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { ModalForm } from '@ant-design/pro-components';

interface Props {
  values: string[];
  onAdd?: () => void;
  onDelete?: () => void;
  labelAdd?: string;
  labelDelete?: string;
  color?: string;
  title?: string;
}

const StringArrayWithActions: React.FC<Props> = ({
  values,
  onAdd,
  onDelete,
  labelAdd,
  labelDelete,
  color = 'blue',
}) => {
  const intl = useIntl();
  const [modalVisible, setModalVisible] = useState(false);
  const count = values?.length || 0;

  return (
    <>
      {/* 表格列中显示的内容：数量徽章 + 查看按钮 */}
      <Space>
        <Badge count={count} showZero color={color} />
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => setModalVisible(true)}
        >
          {intl.formatMessage({ id: 'view', defaultMessage: '查看' })}
        </Button>
      </Space>

      {/* ModalForm 弹窗 */}
      <ModalForm open={modalVisible} onOpenChange={setModalVisible} submitter={false} width={600}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* 操作按钮区域 */}
          <Space size="middle">
            {onAdd && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setModalVisible(false);
                  onAdd();
                }}
              >
                {labelAdd}
              </Button>
            )}
            {onDelete && count > 0 && (
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => {
                  setModalVisible(false);
                  onDelete();
                }}
              >
                {labelDelete}
              </Button>
            )}
          </Space>

          {/* 标签列表区域 */}
          {count > 0 ? (
            <Space size={[8, 8]} wrap>
              {values.map((val: any, index) => (
                <Tag
                  color={color}
                  key={val?.userName || val?._id || index}
                  style={{ fontSize: 14, padding: '4px 12px' }}
                >
                  @{val.userName || val.displayName || val.id}
                </Tag>
              ))}
            </Space>
          ) : (
            <div style={{ textAlign: 'center', color: '#999', padding: '40px 0' }}>
              {intl.formatMessage({ id: 'no_data', defaultMessage: '暂无数据' })}
            </div>
          )}
        </Space>
      </ModalForm>
    </>
  );
};

export default StringArrayWithActions;
