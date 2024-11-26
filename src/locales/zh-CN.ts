import component from './zh-CN/component';
import globalHeader from './zh-CN/globalHeader';
import menu from './zh-CN/menu';
import pages from './zh-CN/pages';
import pwa from './zh-CN/pwa';
import settingDrawer from './zh-CN/settingDrawer';
import settings from './zh-CN/settings';
import app from './zh-CN/app';

export default {
  'navBar.lang': '语言',
  'layout.user.link.help': '帮助',
  'layout.user.link.privacy': '隐私',
  'layout.user.link.terms': '条款',
  'app.preview.down.block': '下载此页面到本地项目',
  'app.welcome.link.fetch-blocks': '获取全部区块',
  'app.welcome.link.block-list': '基于 block 开发，快速构建标准页面',
  ...pages,
  ...globalHeader,
  ...menu,
  ...settingDrawer,
  ...settings,
  ...pwa,
  ...component,
  ...app,
  amount: '金额',
  rate: '费率',
  fixedRate: '固定汇率',
  transactionType: '交易类型',
  'transactionType.income': '收入',
  'transactionType.issue': '支出',
  createdAt: '创建时间',
  updatedAt: '更新时间',

  // 表单提示文字
  'enter.amount': '请输入金额',
  'enter.rate': '请输入费率',
  'enter.fixedRate': '请输入固定汇率',
  'select.transactionType': '请选择交易类型',
  'menu.bills': '账单',
  list: '列表',

  // Bot 相关字段
  botId: '机器人ID',
  botToken: '机器人Token',
  botUsername: '机器人用户名',
  botName: '机器人名称',
  telegramId: 'Telegram ID',
  telegramUsername: 'Telegram 用户名',

  // 操作相关
  create: '创建',
  modify: '修改',
  edit: '编辑',
  delete: '删除',

  // 提示信息
  'please.enter': '请输入',
  confirm_delete: '确认删除',
  confirm_delete_content: '确定要删除这条记录吗？',
  confirm: '确认',
  cancel: '取消',

  // 操作反馈
  'Added successfully': '添加成功',
  'Adding failed, please try again!': '添加失败，请重试！',
  'Updated successfully': '更新成功',
  'Update failed, please try again!': '更新失败，请重试！',
  'Deleted successfully and will refresh soon': '删除成功，即将刷新',
  'Delete failed, please try again': '删除失败，请重试',

  // 表格相关
  'pages.searchTable.titleOption': '操作',
  'pages.searchTable.new': '新建',
  'pages.searchTable.chosen': '已选择',
  'pages.searchTable.item': '项',
  'pages.searchTable.batchDeletion': '批量删除',

  // 模态框相关
  'modal.delete.title': '删除确认',
  'modal.delete.content': '确定要删除选中的记录吗？',
  'modal.okText': '确认',
  'modal.cancelText': '取消',

  // 表格相关
  'pages.searchTable.updateForm.title': '编辑机器人',
  'pages.searchTable.form.botId': '机器人ID',
  'pages.searchTable.form.botToken': '机器人Token',
  'pages.searchTable.form.botUsername': '机器人用户名',
  'pages.searchTable.form.botName': '机器人名称',
  'pages.searchTable.form.telegramId': 'Telegram ID',
  'pages.searchTable.form.telegramUsername': 'Telegram 用户名',
  'pages.searchTable.form.placeholder': '请输入',
  'pages.searchTable.form.required': '此项为必填项',
  description: '描述',
  'pages.searchTable.form.description.placeholder': '请输入机器人描述',
  'menu.bot': '机器人管理',
  'pages.bot.list': '列表',

  // 客户管理相关
  'list.customers': '客户管理',
  username: '用户名',
  enter_username: '请输入用户名',
  username_too_short: '用户名至少2个字符',
  username_too_long: '用户名最多50个字符',
  email: '邮箱',
  enter_email: '请输入邮箱',
  invalid_email: '请输入有效的邮箱地址',
  phone: '电话',
  enter_phone: '请输入电话号码',
  address: '地址',
  enter_address: '请输入地址',
  status: '状态',
  active: '活跃',
  inactive: '不活跃',
  created_at: '创建时间',
  updated_at: '更新时间',

  // 操作相关
  adding: '正在添加...',
  add_successful: '添加成功',
  updating: '正在更新...',
  update_successful: '更新成功',
  update_failed: '更新失败，请重试',
  deleting: '正在删除...',
  delete_successful: '删除成功，即将刷新',
  delete_failed: '删除失败，请重试',
  upload_failed: '上传失败，请重试',
  please_select_status: '请选择状态',

  // 菜单项
  'menu.list.customers': '客户管理',
  'menu.认证管理': '认证管理',
  'menu.认证管理.用户管理': '用户管理',
  'menu.认证管理.角色管理': '角色管理',
  'menu.认证管理.菜单管理': '菜单管理',
  'menu.认证管理.权限管理': '权限管理',
  'menu.认证管理.权限组管理': '权限组管理',
  'menu.认证管理.数据权限管理': '数据权限管理',
  'menu.用户管理': '客户管理',
  'menu.customers': '客户管理',

  // 标签页操作
  'tabs.close.left': '关闭左侧标签页',
  'tabs.close.right': '关闭右侧标签页',
  'tabs.close.others': '关闭其他标签页',
  'tabs.refresh': '刷新当前页面',

  // 客户管理相关
  'pages.customer.isTeacher': '是否是老师',
  'pages.customer.isTeacher.yes': '是',
  'pages.customer.isTeacher.no': '否',

  // 教师职称相关
  'pages.teacher.education': '学历',
  'pages.teacher.teachingAge': '教龄',
  'pages.teacher.title': '职称',
  'pages.teacher.title.teacher': '教师',
  'pages.teacher.title.gradeDirector': '年级主任',
  'pages.teacher.title.groupLeader': '教研组长',
  'pages.teacher.title.viceDirector': '副主任',
  'pages.teacher.title.director': '主任',

  // 教师学历相关
  'pages.teacher.education.bachelor': '本科',
  'pages.teacher.education.master': '硕士',
  'pages.teacher.education.doctor': '博士',
  'pages.teacher.education.other': '其他',

  // 教师管理相关
  'menu.教师管理': '教师管理',
  'menu.teacher': '教师管理',
  'list.teachers': '教师管理',
  'menu.teachers': '教师管理',

  // 教师相关
  'pages.teacher.avatar': '头像',
  'pages.teacher.avatar.required': '请上传头像',

  'pages.teacher.education.required': '请选择学历',

  'pages.teacher.teachingAge.required': '请输入教龄',

  'pages.teacher.lessonCategory': '课程类别',
  'pages.teacher.lessonCategory.speaking': '口语',
  'pages.teacher.lessonCategory.writing': '写作',
  'pages.teacher.lessonCategory.listening': '听力',
  'pages.teacher.lessonCategory.reading': '阅读',
  'pages.teacher.lessonCategory.spelling': '拼写',
  'pages.teacher.lessonCategory.grammar': '语法',
  'pages.teacher.lessonCategory.pronunciation': '发音',
  'pages.teacher.lessonCategory.all': '全部',
  'pages.teacher.lessonCategory.required': '请选择课程类别',

  'pages.teacher.speaks': '语言能力',
  'pages.teacher.speaks.spanish': '西班牙语',
  'pages.teacher.speaks.japanese': '日语',
  'pages.teacher.speaks.french': '法语',
  'pages.teacher.speaks.english': '英语',
  'pages.teacher.speaks.chinese': '中文（普通话）',
  'pages.teacher.speaks.required': '请选择语言能力',

  'pages.teacher.teacherType': '教师类型',
  'pages.teacher.teacherType.both': '两者都是',
  'pages.teacher.teacherType.communityTutor': '社区导师',
  'pages.teacher.teacherType.professionalTeacher': '专业教师',
  'pages.teacher.teacherType.required': '请选择教师类型',

  // 上传相关
  'upload.text': '点击或拖拽文件到此区域上传',
  'upload.hint': '支持单个或批量上传，严禁上传公司数据或其他违禁文件',
  please_upload_image: '请上传图片文件',
  image_must_smaller_than_2mb: '图片必须小于2MB',
};
