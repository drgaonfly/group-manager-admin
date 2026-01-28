import { useState, useEffect } from 'react';

/**
 * 检测是否为移动端（PC端才固定列）
 * 使用媒体查询判断是否为PC端（更准确）
 * @param breakpoint 断点宽度，默认 1440px
 * @returns isMobile - 是否为移动端
 */
const useIsMobile = (breakpoint: number = 1440): boolean => {
  // 初始值根据当前屏幕宽度计算，避免初始渲染时状态不正确
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return !window.matchMedia(`(min-width: ${breakpoint}px)`).matches;
    }
    return false;
  });

  useEffect(() => {
    // 使用媒体查询判断是否为PC端（更准确）
    const mediaQuery = window.matchMedia(`(min-width: ${breakpoint}px)`);

    const checkMobile = () => {
      const isPC = mediaQuery.matches;
      setIsMobile(!isPC);
    };

    // 初始检查
    checkMobile();

    // 监听媒体查询变化
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', checkMobile);
      return () => mediaQuery.removeEventListener('change', checkMobile);
    } else {
      // 兼容旧浏览器
      mediaQuery.addListener(checkMobile);
      return () => mediaQuery.removeListener(checkMobile);
    }
  }, [breakpoint]);

  return isMobile;
};

export default useIsMobile;
