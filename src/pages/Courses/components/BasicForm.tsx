import { useIntl } from '@umijs/max';
import { ProForm, ProFormText, ProFormDigit } from '@ant-design/pro-components';
import React from 'react';

interface Props {
  newRecord?: boolean;
  values?: any;
}

const BasicForm: React.FC<Props> = ({ newRecord }) => {
  const intl = useIntl();
  console.log(newRecord);
  return (
    <>
      <ProForm.Group>
        <ProFormText
          rules={[{ required: true, message: intl.formatMessage({ id: 'enter_title' }) }]}
          width="md"
          label={intl.formatMessage({ id: 'title' })}
          name="title"
          placeholder={intl.formatMessage({ id: 'enter_title' })}
        />
        <ProFormText
          rules={[{ required: true, message: intl.formatMessage({ id: 'enter_video_url' }) }]}
          width="md"
          label={intl.formatMessage({ id: 'video_url' })}
          name="videoUrl"
          placeholder={intl.formatMessage({ id: 'enter_video_url' })}
        />

        <ProFormDigit
          label={intl.formatMessage({ id: 'duration' })}
          name="duration"
          width="md"
          min={0}
          rules={[{ required: true, message: intl.formatMessage({ id: 'enter_duration' }) }]}
          placeholder={intl.formatMessage({ id: 'enter_duration' })}
        />
        <ProFormDigit
          label={intl.formatMessage({ id: 'weight' })}
          name="weight"
          width="md"
          min={0}
          rules={[{ required: true, message: intl.formatMessage({ id: 'enter_weight' }) }]}
          placeholder={intl.formatMessage({ id: 'enter_weight' })}
        />
      </ProForm.Group>
    </>
  );
};

export default BasicForm;
