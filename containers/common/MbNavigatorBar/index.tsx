import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import debounce from 'lodash/debounce'
import { Input, Dropdown } from 'antd'

import CustomIcon from '@components/widget/common/Icon'
import SearchDropPanel from '@containers/subject/search/SearchDropPanel'

import './index.less'

const Search = Input.Search

@inject(stores => {
  const { searchStore } = stores.store
  return {
    searchStore,
  }
})
@observer
class MbNavigatorBar extends Component {
  constructor(props) {
    super(props)

    this.state = {
      showTitle: !!props.showTitle,
      keywords: '',
      dropVisible: false,
    }

    this.reqSearchPopup = debounce(this.reqSearchPopup, 500)
  }

  reqSearchPopup(keys) {
    const { searchStore } = this.props
    const keywords = keys.replace(/\s+/g, '')
    if (keywords.trim() !== '') {
      searchStore.fetchSearchPopup({ keywords })
    }
  }

  handleSearch = (val) => {
    const keywords = (val || '').replace(/\s+/g, '')
    window.location.href = `/search!${keywords}`
  }

  handleSearchChange = (e) => {
    const keys = e.target.value
    this.setState({ keywords: keys })
    this.reqSearchPopup(keys)
  }

  handleSearchClick = (e) => {
    if (this.state.dropVisible) {
      e.stopPropagation()
    }
  }

  handleDropVisible = (visible) => {
    if (visible) {
      this.setState({ dropVisible: true })
    } else {
      this.setState({ dropVisible: false })
    }
  }

  handleSearchIcon = () => {
    this.setState({ showTitle: !this.state.showTitle })
  }

  renderBackBtn() {
    const { backBtn, hideBackBtn, btnType, backUrl } = this.props
    let renderBtn
    if (hideBackBtn) {
      renderBtn = null
    } else if (backBtn) {
      renderBtn = backBtn
    } else if (btnType === 'back') {
      renderBtn = <a href={backUrl || '/'} className="arrow"><CustomIcon name="arrow-left-o" /></a>
    } else {
      // renderBtn = <a href="/" className="logo"><img src="/static/images/logo_circle.svg" alt=""/></a>
      renderBtn = <a href="/" className="logo"><CustomIcon name="home-o" /></a>
    }
    return (
      <div className="btn-back">
        {renderBtn}
      </div>
    )
  }

  renderSearch() {
    const { keywordsAdLabel } = this.props
    const { keywords } = this.state

    return (
      <div className="search-wrapper">
        <Dropdown
          trigger={['click']}
          onVisibleChange={this.handleDropVisible}
          overlay={
            <SearchDropPanel
              className="mb-search-overlay-panel"
              keywords={keywords}
              onSelectHot={this.handleSearch}
            />
          }
        >
          <div>
            <Search
              value={keywords}
              className='search-input'
              placeholder={keywordsAdLabel || '请输入搜索内容'}
              onChange={this.handleSearchChange}
              onSearch={this.handleSearch}
              onClick={this.handleSearchClick}
            />
          </div>
        </Dropdown>
      </div>
    )
  }

  renderTitleBar() {
    const { title, hideSearchBtn } = this.props

    return (
      <>
        <div className="title-bar">
          {title}
        </div>
        <div className="search-btn">
          {!hideSearchBtn && <div className="search-icon" onClick={this.handleSearchIcon}>
            <CustomIcon name="search" />
          </div>}
        </div>
      </>
    )
  }

  render() {
    const { hideBackBtn } = this.props
    const { showTitle } = this.state
    const hideBack = hideBackBtn && !showTitle

    return (
      <div className="mb-navibator-bar">
        {!hideBack && this.renderBackBtn()}
        {showTitle ? this.renderTitleBar() : this.renderSearch()}
      </div>
    )
  }
}

export default MbNavigatorBar