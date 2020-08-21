import { Component } from 'react'
import classnames from 'classnames'

import { Button } from 'antd'
import FormNav from './FormNav'

import './index.less'

const allNavs = [
  {key: 'shots', url: '/shots', paramStr: `!0!0!#formCode#!0!0`, name: '作品'},
  {key: 'author', url: '/author', paramStr: `!0!0!0!0!#formCode#`, name: '创作者'},
  {key: 'enquiry', url: '/enquiry', paramStr: `!!#formCode#!`, name: '询价'},
  {key: 'article', url: '/article', paramStr: '', name: '文章'},
]

class SecondHeader extends Component {

  handleForm = (code) => {
    const { onFormSelect } = this.props
    if (onFormSelect) onFormSelect(code)
  }

  render() {
    const { className, navContainerClass, formCode=0, forms=[], navs=[], currentPage, hideNav, hideForm, extra } = this.props
    const currentNav = allNavs.find(item => item.key === currentPage) || {}
    const filterNavs = allNavs.filter(item => navs.includes(item.key))

    return (
      <div className={classnames('second-header', className)}>
        {!hideForm && <div className="form-nav-bar">
          <div className={classnames('sub-nav-container', navContainerClass)}>
            <FormNav
              formCode={formCode}
              forms={forms}
              onFormChange={this.handleForm}
            />
          </div>
        </div>}
        {!hideNav && <div className="sub-nav-bar">
          <div className={classnames('sub-nav-container', navContainerClass)}>
            <div className="second-header-nav">
              <div className="sub-nav-content">
                <div className="sub-nav-item first">{currentNav.name}</div>
                <div className="sub-nav-item divider"></div>
                {filterNavs.map(item => {
                  let jumpUrl = item.url
                  // 跳转增加相应的形式参数
                  if (!!formCode && formCode !== '0') {
                    jumpUrl += item.paramStr.replace('#formCode#', formCode)
                  }
                  return (
                    <div className="sub-nav-item" key={item.key}>
                      <a href={jumpUrl}>{item.name}</a>
                    </div>
                  )
                })}
              </div>
              {extra && <div className="sub-nav-extra">
                {extra}
              </div>}
            </div>
          </div>
        </div>}
      </div>
    )
  }
}

export default SecondHeader