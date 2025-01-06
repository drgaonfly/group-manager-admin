import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Button } from 'antd';

interface VideoPlayerProps {
  video1: string;
  video2: string;
  issue?: string;
  onSubmit: () => void;
  remainingCount: number;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video1,
  video2,
  issue,
  onSubmit,
  remainingCount,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoState, setVideoState] = useState({
    playbackRate: 1,
    activeVideo: 1,
    muted: true,
  });

  const videoControls = useMemo(
    () => ({
      handleFullScreen: () => {
        if (!videoRef.current) return;
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          videoRef.current.requestFullscreen();
        }
      },

      handlePlayPause: () => {
        if (!videoRef.current) return;
        if (videoRef.current.paused) {
          videoRef.current.play();
        } else {
          videoRef.current.pause();
        }
      },

      handleSpeedChange: (change: number) => {
        if (!videoRef.current) return;
        const newRate = Math.max(0.25, Math.min(2, videoRef.current.playbackRate + change));
        videoRef.current.playbackRate = newRate;
        setVideoState((prev) => ({ ...prev, playbackRate: newRate }));
      },

      handleVideoSwitch: (videoNum: number) => {
        setVideoState((prev) => ({ ...prev, activeVideo: videoNum, playbackRate: 1 }));
        if (!videoRef.current) return;

        videoRef.current.play().catch(() => {
          if (videoRef.current) {
            videoRef.current.muted = true;
            videoRef.current.play();
          }
        });
      },
    }),
    [],
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !(video1 || video2)) return;

    video.muted = videoState.muted;
    video.playbackRate = videoState.playbackRate;

    const playVideo = async () => {
      try {
        await video.play();
      } catch (error) {
        console.warn('视频播放失败:', error);
        if (video) {
          video.muted = true;
          video.play();
        }
      }
    };

    playVideo();
  }, [videoState.activeVideo, video1, video2, videoState.playbackRate, videoState.muted]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleRateChange = () => {
      setVideoState((prev) => ({ ...prev, playbackRate: video.playbackRate }));
    };

    video.addEventListener('ratechange', handleRateChange);
    return () => video.removeEventListener('ratechange', handleRateChange);
  }, []);

  useEffect(() => {
    const keyActions = {
      W: () => videoControls.handleSpeedChange(-0.25),
      S: () => videoControls.handlePlayPause(),
      E: () => videoControls.handleSpeedChange(0.25),
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      const action = keyActions[e.key.toUpperCase() as keyof typeof keyActions];
      if (action) action();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [videoControls]);

  return (
    <div>
      {/* 顶部控制栏 */}
      <div className="flex xl:flex-row flex-col xl:space-y-0 space-y-4 justify-between w-full p-2 border-b">
        {/* 左侧视频切换和信息 */}
        <div className="flex items-center gap-2 text-sm">
          <div
            className={`cursor-pointer ${
              videoState.activeVideo === 1 ? 'text-blue-500' : 'text-gray-500'
            }`}
            onClick={() => video1 && videoControls.handleVideoSwitch(1)}
            style={{
              padding: '8px',
              cursor: video1 ? 'pointer' : 'not-allowed',
              opacity: video1 ? 1 : 0.5,
            }}
          >
            视频一{!video1 && '(无)'}
          </div>
          <div
            className={`cursor-pointer ${
              videoState.activeVideo === 2 ? 'text-blue-500' : 'text-gray-500'
            }`}
            onClick={() => video2 && videoControls.handleVideoSwitch(2)}
            style={{
              padding: '8px',
              cursor: video2 ? 'pointer' : 'not-allowed',
              opacity: video2 ? 1 : 0.5,
            }}
          >
            视频二{!video2 && '(无)'}
          </div>
          {issue && <div className="text-gray-500 text-md">问题：{issue}</div>}
          <div className="px-1 py-1 text-sm">
            预计剩余 {remainingCount > 0 ? remainingCount + 1 : 0} 单
          </div>
        </div>

        {/* 右侧按钮组 */}
        <div className="flex flex-row gap-2 text-sm">
          <div className="flex gap-2">
            <Button onClick={videoControls.handleFullScreen} className="px-1 py-1 text-sm">
              全屏
            </Button>
            <Button type="primary" onClick={onSubmit} className="hidden sm:block">
              提交
            </Button>
            <Button
              onClick={() => videoControls.handleSpeedChange(-0.25)}
              className="px-1 py-1 text-sm"
            >
              减速(W)
            </Button>
          </div>
          <div className="flex gap-2 sm:mt-0">
            <Button onClick={videoControls.handlePlayPause} className="px-1 py-1 text-sm">
              暂停/播放(S)
            </Button>
            <Button
              onClick={() => videoControls.handleSpeedChange(0.25)}
              className="px-1 py-1 text-sm"
            >
              加速(E)
            </Button>
          </div>
        </div>
      </div>

      {/* 视频播放区域 */}
      <div className="relative bg-black aspect-video">
        <video
          ref={videoRef}
          className="w-full h-full"
          controls
          autoPlay
          key={videoState.activeVideo === 1 ? video1 : video2}
        >
          <source src={videoState.activeVideo === 1 ? video1 : video2} type="video/mp4" />
        </video>
        <div className="absolute top-2 right-2 text-white">
          {videoState.playbackRate.toFixed(1)}x
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
