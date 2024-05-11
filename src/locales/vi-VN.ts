import component from './vi-VN/component';
import globalHeader from './vi-VN/globalHeader';
import menu from './vi-VN/menu';
import pages from './vi-VN/pages';
import pwa from './vi-VN/pwa';
import settingDrawer from './vi-VN/settingDrawer';
import settings from './vi-VN/settings';
import app from './vi-VN/app';

export default {
  'navBar.lang': 'Ngôn ngữ',
  'layout.user.link.help': 'Giúp đỡ',
  'layout.user.link.privacy': 'Quyền riêng tư',
  'layout.user.link.terms': 'Điều khoản',
  'app.preview.down.block': 'Tải trang này về dự án cục bộ của bạn',
  'app.welcome.link.fetch-blocks': 'Nhận tất cả khối',
  'app.welcome.link.block-list': 'Nhanh chóng xây dựng trang chuẩn, dựa trên phát triển `block`',
  ...globalHeader,
  ...menu,
  ...settingDrawer,
  ...settings,
  ...pwa,
  ...component,
  ...app,
  ...pages,
};
