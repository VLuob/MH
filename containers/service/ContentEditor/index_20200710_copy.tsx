import { useState, useEffect, useCallback, useRef } from 'react'

const ContentEditor = (props) => {
  const { onChange, content } = props
  const editorRef = useRef()
  let editor

  useEffect(() => {
    initEditor()
    setEditorContent()
  }, [])

  const setEditorContent = useCallback(() => {
    editor.$txt.html(content)
  }, [content])
  
  
  const initEditor = () => {
    const JEditor = window.JEditor
    editor = new JEditor(editorRef.current)

    // // onchange 事件
    editor.onchange = function () {
      const text = editor.$txt.text()
      const html = editor.$txt.html()
      if (onChange) onChange({html, text})
    };

    editor.config.menus = [
        'source',
        '|',
        'head',
        'fontsize',
        'forecolor',
        'bold',
        'italic',
        '|',
        'quote',
        '|',
        'unorderlist',
        'orderlist',
        'alignleft',
        'aligncenter',
        'alignright',
        '|',
        // 'img',
        // 'video',
        // '|',
        // 'link',
        // 'unlink',
        'undo',
        'redo',
        // 'fullscreen',
        // '|',
        // 'insertshots',
    ];

    editor.create();
  }  

  return (
    <div ref={editorRef} style={{textAlign: 'left', height: '260px'}}></div>
  )
}

export default ContentEditor