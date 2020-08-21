import React from 'react'
import { Icon, Input, Dropdown } from 'antd'
import isEqual from 'lodash/isEqual'
import SearchDropPanel from '@containers/subject/search/SearchDropPanel'
import classnames from 'classnames'
import CustomIcon from '@components/widget/common/Icon'


class HeaderInput extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      in: false,
      dropPanel: false,

      searchValue: '',

      keywordsAds: props.keywordsAds,
      keywordsAdLabel: '',
    }
  }

  static getDerivedStateFromProps(props, state) {
    if (!isEqual(props.keywordsAds, state.keywordsAds)) {
      return {
        keywordsAds: props.keywordsAds,
      }
    }
    return null
  }

  componentDidMount() {
    this.initKeywordsAds()
  }

  initKeywordsAds() {
    let keywordsAds
    let adLength
    let currIndex = 0
    let keywordsAdLabel
    let speed = 1000

    if (adLength > 0) {
      keywordsAdLabel = keywordsAds[currIndex].title
      this.setState({ keywordsAdLabel })
    }

    const startDowncount = () => {
      this.adLabelTimer && clearInterval(this.adLabelTimer)
      this.adLabelTimer = setInterval(() => {
        keywordsAds = this.state.keywordsAds
        adLength = keywordsAds.length
        // console.log('keywordsAds', keywordsAds)
        if (adLength !== 0) {
          currIndex++
          if (currIndex >= adLength) {
            currIndex = 0
          }
          keywordsAdLabel = keywordsAds[currIndex].title
          this.setState({ keywordsAdLabel })
          if (speed < 5000) {
            speed = 5000
            startDowncount()
          }
        }
      }, speed)
    }

    startDowncount()
  }

  toggleEnterState = () => {
    this.setState({ in: !this.state.in })
  }

  handleChange = (e) => {
    const { onChange } = this.props

    this.setState({ searchValue: e.target.value })

    if (onChange) {
      onChange(e)
    }
  }

  handleBtnSearch = (e) => {
    const { onSearch } = this.props
    const { searchValue, keywordsAdLabel } = this.state

    if (onSearch) {
      onSearch({ target: { value: searchValue || keywordsAdLabel } })
    }
  }

  handleSearch = (value) => {
    const { onSearch } = this.props
    const { keywordsAdLabel } = this.state
    // const value = e.target.value
    if (onSearch) {
      onSearch({ target: { value: value || keywordsAdLabel } })
    }
  }

  handleEnter = (e) => {
    this.handleSearch(e.target.value)
  }

  handleSearchFocus = (e) => {
    const { onSpread } = this.props
    this.setState({ dropPanel: true })
    this.handleOpen()
  }

  handleOpen = () => {
    const { onSpread } = this.props
    if (onSpread) {
      onSpread(true)
    }
  }

  handleClose = () => {
    const { onSpread } = this.props
    if (onSpread) {
      onSpread(false)
    }
  }

  handleSearchBlur = (e) => {
    setTimeout(() => {
      this.setState({ dropPanel: false })
      this.handleClose()
    }, 200)
  }

  handleVisibleChange = (visible) => {
    if (visible) {
      this.handleSearchFocus(visible)
    } else {
      this.handleSearchBlur(visible)
    }
  }

  handleSearchClick = (e) => {
    if (this.state.dropPanel) {
      e.stopPropagation()
    }
  }

  handleShotsTopClick = (e) => {
    window.open('/top/shots')
  }

  render() {
    const { show, onChange, onSearch, keywords, onSearchShow, spread } = this.props
    const { dropPanel, keywordsAdLabel } = this.state

    const fixIconStyle = { marginTop: '2px', fontSize: '13px', color: '#BBBBBB' }

    return (
      <div className={classnames('search-wrapper', { spread })}>
        <Dropdown
          trigger={['click']}
          onVisibleChange={this.handleVisibleChange}
          overlay={
            <SearchDropPanel
              // show={dropPanel} 
              keywords={keywords}
              onSelectHot={name => onSearch({ target: { value: name } })}
            />
          }
        >
          <div>
            <Input
              prefix={<CustomIcon name='search' />}
              // suffix={spread ? <span>
              //     {/* <CustomIcon name='jump' style={{marginRight: '10px'}} onClick={this.handleBtnSearch} /> */}
              //     <CustomIcon name='close' onClick={this.handleClose} />
              // </span> : <span />}
              suffix={<a onClick={this.handleShotsTopClick} className="search-input-suffix"><CustomIcon name="statistics" />作品排行榜</a>}
              className='header-search-box input-themes'
              placeholder={keywordsAdLabel || `请输入搜索内容`}
              onChange={this.handleChange}
              onPressEnter={this.handleEnter}
              // onFocus={this.handleSearchFocus}
              // onBlur={this.handleSearchBlur}
              onClick={this.handleSearchClick}
            />
          </div>
        </Dropdown>
        {/* <Input.Search 
                    className='header-search-box input-themes' 
                    placeholder={keywordsAdLabel || `请输入搜索内容`}
                    onChange={this.handleChange}
                    onSearch={this.handleSearch}
                    onFocus={this.handleSearchFocus}
                    onBlur={this.handleSearchBlur}
                /> */}

      </div>
    )
  }
}

export default HeaderInput