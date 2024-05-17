import { Button, Modal } from 'antd';
import { useState } from 'react';
import { useIntl } from '@umijs/max';

const VideoPlayer = ({ videoUrl, entity }: { videoUrl: string; entity: any }) => {
  const [visible, setVisible] = useState<boolean>(false);
  const intl = useIntl();

  const showModal = () => {
    setVisible(true);
  };

  const handleOk = () => {
    setVisible(false);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  return (
    <>
      <Button type="primary" onClick={showModal}>
        {intl.formatMessage({ id: 'play_video' })}
      </Button>
      <Modal
        title={entity.title}
        open={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={800}
      >
        <video width="100%" height="480" controls>
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </Modal>
    </>
  );
};

export default VideoPlayer;
