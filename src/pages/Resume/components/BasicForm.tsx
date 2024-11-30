import { useIntl } from '@umijs/max';
import {
  ProForm,
  ProFormText,
  ProFormSelect,
  ProFormDatePicker,
  ProFormDigit,
} from '@ant-design/pro-components';
import CustomerSelect from '@/components/tearcher';

const BasicForm: React.FC = () => {
  const intl = useIntl();

  return (
    <>
      <ProForm.Group>
        <CustomerSelect />

        <ProFormText
          name="fullName"
          label={intl.formatMessage({ id: 'resume.fullName' })}
          width="md"
          rules={[{ required: true }]}
        />

        <ProFormDatePicker
          name="birthDate"
          label={intl.formatMessage({ id: 'resume.birthDate' })}
          width="md"
        />

        <ProFormText
          name="location"
          label={intl.formatMessage({ id: 'resume.location' })}
          width="md"
        />

        <ProFormSelect
          name="degree"
          label={intl.formatMessage({ id: 'resume.degree' })}
          width="md"
          valueEnum={{
            Bachelor: { text: intl.formatMessage({ id: 'resume.degree.bachelor' }) },
            Master: { text: intl.formatMessage({ id: 'resume.degree.master' }) },
            Doctor: { text: intl.formatMessage({ id: 'resume.degree.doctor' }) },
            Other: { text: intl.formatMessage({ id: 'resume.degree.other' }) },
          }}
          rules={[{ required: true }]}
        />

        <ProFormText
          name="school"
          label={intl.formatMessage({ id: 'resume.school' })}
          width="md"
          rules={[{ required: true }]}
        />

        <ProFormText name="major" label={intl.formatMessage({ id: 'resume.major' })} width="md" />

        <ProFormDigit
          name="teachingYears"
          label={intl.formatMessage({ id: 'resume.teachingYears' })}
          width="md"
          min={0}
          fieldProps={{ precision: 0 }}
        />

        <ProFormSelect
          name="teachingLevel"
          label={intl.formatMessage({ id: 'resume.teachingLevel' })}
          width="md"
          valueEnum={{
            Primary: { text: intl.formatMessage({ id: 'resume.level.primary' }) },
            Junior: { text: intl.formatMessage({ id: 'resume.level.junior' }) },
            Senior: { text: intl.formatMessage({ id: 'resume.level.senior' }) },
            College: { text: intl.formatMessage({ id: 'resume.level.college' }) },
            Other: { text: intl.formatMessage({ id: 'resume.level.other' }) },
          }}
          rules={[{ required: true }]}
        />

        <ProFormSelect
          name="status"
          label={intl.formatMessage({ id: 'resume.status' })}
          width="md"
          valueEnum={{
            draft: {
              text: intl.formatMessage({ id: 'resume.status.draft' }),
              status: 'Default',
            },
            published: {
              text: intl.formatMessage({ id: 'resume.status.published' }),
              status: 'Success',
            },
          }}
          rules={[{ required: true }]}
        />
      </ProForm.Group>
    </>
  );
};

export default BasicForm;
