import { useState, useEffect, useCallback, useRef, Component, createRef } from 'react'

class ContentEditor extends Component {
  constructor(props) {
    super(props)
    this.editor
    this.editorRef = createRef()

    this.state = {
      content: props.content,
    }
  }

  // static getDerivedStateFromProps(nextProps, prevState) {
  //   const { content } = nextProps
  //   if (content !== prevState.content) {
  //     if (editor) {
  //       editor.$txt.html(content)
  //     }
  //     return {
  //       content
  //     }
  //   }
  //   return {}
  // }

  componentDidMount() {
    this.initEditor()
    this.initData()
  }

  initData() {
    const { content } = this.props
    this.editor.$txt.html(content)
  }
  

  initEditor = () => {
    const { onChange, content } = this.props
    const JEditor = window.JEditor
    this.editor = new JEditor(this.editorRef.current)

    // // onchange 事件
    this.editor.onchange = () => {
      const text = this.editor.$txt.text()
      const html = this.editor.$txt.html()
      this.setState({content: html})
      if (onChange) onChange({html, text})
    };

    this.editor.config.menus = [
        // 'source',
        // '|',
        // 'head',
        // 'fontsize',
        // 'forecolor',
        // 'bold',
        // 'italic',
        // '|',
        // 'quote',
        // '|',
        'unorderlist',
        'orderlist',
        // 'alignleft',
        // 'aligncenter',
        // 'alignright',
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

    this.editor.create();
  } 

  render() {
    return (
      <div ref={this.editorRef} style={{textAlign: 'left', height: '260px'}}></div>
    )
  }
} 

export default ContentEditor