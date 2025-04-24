// Editor.tsx
import React from 'react';
import ReactQuill from 'react-quill';

// Define the type for the Editor component
interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

// Editor Component (Controlled Component)
const Editor: React.FC<EditorProps> & { modules: any; formats: string[] } = ({
  value,
  onChange,
  placeholder,
}) => {
  return (
    <ReactQuill
      theme="snow"
      value={value}
      onChange={onChange}
      modules={Editor.modules} // Access static property
      formats={Editor.formats} // Access static property
      placeholder={placeholder}
      style={{ height: '200px', marginBottom: '40px' }}
    />
  );
};

// Define the Quill modules
Editor.modules = {
  toolbar: ['link', 'image', 'bold', 'italic'],
};

// Define the Quill formats
Editor.formats = [
  'header',
  'font',
  'size',
  'bold',
  'italic',
  'underline',
  'strike',
  'blockquote',
  'list',
  'bullet',
  'indent',
  'link',
  'image',
];

export default Editor;
