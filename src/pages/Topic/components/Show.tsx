import React, { useEffect, useState } from 'react';
import { ProDescriptions, ProDescriptionsItemProps } from '@ant-design/pro-components';
// import { FormattedMessage } from '@umijs/max';
import { Modal } from 'antd';
import AnswersTable, { AnswerItem } from './AnswersTable';
import { useIntl } from '@umijs/max';
interface Props {
  onClose: (e: React.MouseEvent | React.KeyboardEvent) => void;
  open: boolean;
  currentRow: API.ItemData;
  columns: ProDescriptionsItemProps<API.ItemData>[];
}

const Show: React.FC<Props> = (props) => {
  const { onClose, open, currentRow, columns } = props;
  const filteredColumns = columns.filter((col) => col.dataIndex !== 'option');

  const [answers, setAnswers] = useState<AnswerItem[]>(currentRow?.answers || []);
  const [loading, setLoading] = useState<boolean>(false);
  const intl = useIntl();

  useEffect(() => {
    if (currentRow) {
      setAnswers(currentRow.answers || []);
      setLoading(false);
    }
  }, [currentRow]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width="60%"
      centered
      className="rounded-lg overflow-hidden"
    >
      {currentRow?._id && (
        <>
          <ProDescriptions<API.ItemData>
            column={2}
            title={`${intl.formatMessage({ id: 'number' })}: ${currentRow?.id}`}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?._id,
            }}
            columns={filteredColumns as ProDescriptionsItemProps<API.ItemData>[]}
            style={{ marginTop: '20px' }}
            bordered
            labelStyle={{
              width: '10%',
              justifyContent: 'flex-end',
              padding: '8px 16px',
              backgroundColor: '#f0f0f0',
            }}
            contentStyle={{
              width: '50%',
              padding: '8px 16px',
            }}
            size="small"
            className="custom-descriptions"
          />
          <AnswersTable
            answers={answers}
            loading={loading}
            pagination={{ current: 1, pageSize: 5 }}
            setPagination={() => {}}
          />
        </>
      )}
    </Modal>
  );
};

export default Show;
