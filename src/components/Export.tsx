import { Button, message } from 'antd';
import { useIntl } from '@umijs/max';
import { FormInstance } from 'antd/lib/form';
import { queryList } from '@/services/ant-design-pro/api';

interface ExportButtonProps {
  form: FormInstance;
  exportUrl: string;
  key: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({ form, key, exportUrl }) => {
  const intl = useIntl();

  const handleExport = async () => {
    // Show a loading message
    const hide = message.loading(
      intl.formatMessage({ id: 'exporting', defaultMessage: 'Exporting...' }),
      0,
    );

    try {
      // Perform the export operation
      console.log('Export button clicked', form.getFieldsValue());
      const response = await queryList(exportUrl, {
        ...form.getFieldsValue(),
      });

      hide();

      if (response?.data) {
        message.success(
          intl.formatMessage({
            id: 'file_ready',
            defaultMessage: 'File is ready, download will start soon',
          }),
        );
        // Open the download URL in a new tab
        // @ts-ignore
        window.open(response.data.signedURL, '_blank');
      } else {
        throw new Error('No download URL returned');
      }
    } catch (error) {
      // Update the message
      hide();
      message.error(intl.formatMessage({ id: 'export_failed', defaultMessage: 'Export failed' }));
    }
  };

  return (
    <Button key={key} type="dashed" onClick={handleExport}>
      {intl.formatMessage({ id: 'export', defaultMessage: 'Export' })}
    </Button>
  );
};

export default ExportButton;
