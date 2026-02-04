import React, { useRef, useMemo, useImperativeHandle, forwardRef, useId } from 'react';
import { Space, Tag } from 'antd';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// 所有可用变量
const ALL_VARIABLES = [
  { key: '{member}', label: '带链接成员名', desc: '带链接的群成员名字' },
  { key: '{userId}', label: '用户ID', desc: '用户的 Telegram ID' },
  { key: '{nickname}', label: '用户昵称', desc: '用户的昵称/名字' },
  { key: '{userName}', label: '用户名', desc: '用户的 @username' },
  { key: '{userBalance}', label: '用户积分', desc: '用户的积分余额' },
  { key: '{groupTitle}', label: '群名称', desc: '当前群组的名称' },
  { key: '{currentTime}', label: '当前时间', desc: '消息发送时的时间' },
];

// 变量类型
export type VariableType =
  | 'member'
  | 'userId'
  | 'nickname'
  | 'userName'
  | 'userBalance'
  | 'groupTitle'
  | 'currentTime';

// 预设变量组合
export const VARIABLE_PRESETS = {
  // 所有变量
  all: [
    'member',
    'userId',
    'nickname',
    'userName',
    'userBalance',
    'groupTitle',
    'currentTime',
  ] as VariableType[],
  // 仅群组和时间（用于轮播广告等没有用户上下文的场景）
  groupOnly: ['groupTitle', 'currentTime'] as VariableType[],
  // 用户相关（用于关键词回复、群欢迎等有用户上下文的场景）
  withUser: [
    'member',
    'userId',
    'nickname',
    'userName',
    'userBalance',
    'groupTitle',
    'currentTime',
  ] as VariableType[],
  // 抽奖相关（用于抽奖通知内容编辑）
  lottery: [
    'lotteryTitle',
    'goodsList',
    'joinCondition',
    'openCondition',
    'joinNum',
    'nickname',
    'userId',
    'userName',
    'member',
  ] as VariableType[],
};

export interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  height?: number;
  /** 显示哪些变量，可以传入预设名称、VariableType数组或自定义变量对象数组 */
  variables?: VariableType[] | keyof typeof VARIABLE_PRESETS | { key: string; label: string }[];
  /** 是否显示变量插入区域 */
  showVariables?: boolean;
  /** 自定义标题 */
  title?: string;
}

export interface RichTextEditorRef {
  getEditor: () => any;
  insertText: (text: string) => void;
  getTelegramHtml: () => string;
}

// Quill 编辑器配置
const quillModules = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'],
    ['link'],
    ['blockquote', 'code-block'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['clean'],
  ],
};

const quillFormats = [
  'bold',
  'italic',
  'underline',
  'strike',
  'link',
  'blockquote',
  'code-block',
  'list',
  'bullet',
];

// 将 Quill HTML 转换为 Telegram 支持的 HTML
export const convertToTelegramHtml = (html: string): string => {
  if (!html) return '';
  return html
    .replace(/<strong>/g, '<b>')
    .replace(/<\/strong>/g, '</b>')
    .replace(/<em>/g, '<i>')
    .replace(/<\/em>/g, '</i>')
    .replace(/<s>/g, '<s>')
    .replace(/<\/s>/g, '</s>')
    .replace(/<pre class="ql-syntax" spellcheck="false">/g, '<pre>')
    .replace(/<\/pre>/g, '</pre>')
    .replace(/<blockquote>/g, '')
    .replace(/<\/blockquote>/g, '')
    .replace(/<ol>/g, '')
    .replace(/<\/ol>/g, '')
    .replace(/<ul>/g, '')
    .replace(/<\/ul>/g, '')
    .replace(/<li>/g, '• ')
    .replace(/<\/li>/g, '\n')
    .replace(/<p><br><\/p>/g, '\n')
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<p>/g, '')
    .replace(/<\/p>/g, '\n')
    .replace(/&nbsp;/g, ' ') // 将 &nbsp; 转换为普通空格
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

// 将换行符文本转换为 Quill HTML
export const toQuillHtml = (text: string): string =>
  text
    ? text
        .split('\n')
        .map((line) => `<p>${line || '<br>'}</p>`)
        .join('')
    : '';

const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
  (
    {
      value = '',
      onChange,
      placeholder = '请输入内容...',
      height = 200,
      variables = 'all',
      showVariables = true,
      title,
    },
    ref,
  ) => {
    const quillRef = useRef<ReactQuill>(null);
    const editorId = useId().replace(/:/g, '');

    // 解析要显示的变量
    const displayVariables = useMemo(() => {
      // 如果是字符串，使用预设
      if (typeof variables === 'string') {
        const varKeys = VARIABLE_PRESETS[variables];
        return ALL_VARIABLES.filter((v) => {
          const key = v.key.replace(/[{}]/g, '') as VariableType;
          return varKeys.includes(key);
        });
      }
      // 如果是数组，检查是否是自定义变量对象
      else if (
        Array.isArray(variables) &&
        variables.length > 0 &&
        typeof variables[0] === 'object' &&
        'label' in variables[0]
      ) {
        // 自定义变量对象，直接返回
        return (variables as { key: string; label: string }[]).map((v) => ({
          key: v.key,
          label: v.label,
          desc: v.label, // 使用 label 作为 desc
        }));
      }
      // 如果是 VariableType 数组，使用预设逻辑
      else if (Array.isArray(variables)) {
        const varKeys = variables as VariableType[];
        return ALL_VARIABLES.filter((v) => {
          const key = v.key.replace(/[{}]/g, '') as VariableType;
          return varKeys.includes(key);
        });
      }
      // 默认返回所有变量
      return ALL_VARIABLES;
    }, [variables]);

    // 插入变量到编辑器
    const insertVariable = (variable: string) => {
      const editor = quillRef.current?.getEditor();
      if (editor) {
        const range = editor.getSelection(true);
        if (range) {
          editor.insertText(range.index, variable);
          editor.setSelection(range.index + variable.length, 0);
        }
      }
    };

    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
      getEditor: () => quillRef.current?.getEditor(),
      insertText: (text: string) => insertVariable(text),
      getTelegramHtml: () => convertToTelegramHtml(value),
    }));

    return (
      <div>
        {title && <div style={{ marginBottom: 12, fontWeight: 500 }}>{title}</div>}
        {showVariables && displayVariables.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            <span style={{ marginRight: 8, color: '#666', fontSize: 12 }}>插入变量：</span>
            <Space wrap size={[4, 4]}>
              {displayVariables.map((v) => (
                <Tag
                  key={v.key}
                  color="blue"
                  style={{ cursor: 'pointer' }}
                  onClick={() => insertVariable(v.key)}
                  title={v.desc}
                >
                  {v.label}
                </Tag>
              ))}
            </Space>
          </div>
        )}
        <div id={editorId} style={{ background: '#fff', borderRadius: 4, marginBottom: 16 }}>
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={value}
            onChange={onChange}
            modules={quillModules}
            formats={quillFormats}
            placeholder={placeholder}
          />
          <style>{`
            #${editorId} .ql-container {
              min-height: ${height}px;
            }
            #${editorId} .ql-editor {
              min-height: ${height}px;
            }
          `}</style>
        </div>
      </div>
    );
  },
);

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;
