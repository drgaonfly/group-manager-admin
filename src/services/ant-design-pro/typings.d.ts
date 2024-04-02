// @ts-ignore
/* eslint-disable */

declare namespace API {
  type CurrentUser = {
    data?: any;
    name?: string;
    avatar?: string;
    role?: string;
    _id?: string;
    userid?: string;
    email?: string;
    signature?: string;
    title?: string;
    group?: string;
    tags?: { key?: string; label?: string }[];
    notifyCount?: number;
    unreadCount?: number;
    country?: string;
    access?: string;
    geographic?: {
      province?: { label?: string; key?: string };
      city?: { label?: string; key?: string };
    };
    address?: string;
    phone?: string;
  };

  type ItemData = {
    uploadedFile?: string;
    file?: string;
    user?: any;
    resourceUrl?: any;
    category?: any;
    imageUrl?: string;
    title?: string;
    email?: string;
    _id?: string;
    types?: string;
    userinfo?: any;
    account?: string;
    id?: number;
    key?: number;
    disabled?: boolean;
    href?: string;
    avatar?: string;
    name?: string;
    owner?: string;
    desc?: string;
    callNo?: number;
    status?: number;
    updatedAt?: string;
    createdAt?: string;
    progress?: number;
  };

  type ResData = {
    /** 列表的内容总数 */
    code?: number;
    data?: any;
    msg?: string;
  };

  type DataList = {
    data?: ListItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type ListItem = {
    id?: number;
    _id?: string;
    name?: string;
    createdAt?: string;
    updatedAt?: string;
  };

  type LoginResult = {
    refreshToken?: string;
    success?: boolean;
    token?: string;
  };

  type RefreshResult = {
    refreshToken: string;
    success: boolean;
    token: string;
  };

  type PageParams = {
    current?: number;
    pageSize?: number;
  };

  type RuleList = {
    data?: ItemData[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type FakeCaptcha = {
    code?: number;
    status?: string;
  };

  type LoginParams = {
    email?: string;
    password?: string;
  };

  type refreshParams = {
    refreshToken: string;
  };

  type ErrorResponse = {
    /** 业务约定的错误码 */
    errorCode: string;
    /** 业务上的错误信息 */
    errorMessage?: string;
    /** 业务上的请求是否成功 */
    success?: boolean;
  };

  type NoticeIconList = {
    data?: NoticeIconItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type NoticeIconItemType = 'notification' | 'message' | 'event';

  type NoticeIconItem = {
    id?: string;
    extra?: string;
    key?: string;
    read?: boolean;
    avatar?: string;
    title?: string;
    status?: string;
    datetime?: string;
    description?: string;
    type?: NoticeIconItemType;
  };
}
