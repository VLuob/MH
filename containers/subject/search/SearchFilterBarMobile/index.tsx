import { Component } from 'react'
import { Dropdown, Menu, message } from 'antd'

import { AuthorType, SearchType } from '@base/enums'
import { config } from '@utils'

import CustomIcon from '@components/widget/common/Icon'
import ClassifyDropdown from '@components/common/ClassifyDropdown'

import './index.less'


const searchTabKeys = ['shots', 'article', 'author', 'brand', 'tag', 'topic']
const tabData = [
  { key: 'shots', name: '作品', searchType: SearchType.SHOTS },
  { key: 'author', name: '创作者', searchType: SearchType.AUTHOR },
  { key: 'service', name: '服务', searchType: SearchType.SERVICE },
  { key: 'enquiry', name: '询价', searchType: SearchType.ENQUIRY },
  { key: 'article', name: '文章', searchType: SearchType.ARTICLE },
  { key: 'brand', name: '品牌', searchType: SearchType.BRAND },
  { key: 'tag', name: '标签', searchType: SearchType.TAG },
  { key: 'topic', name: '专题', searchType: SearchType.TOPIC },
]

const sorts = [
  {
    key: 'match',
    name: '相关',
  }, {
    key: 'gmtCreate',
    name: `最新`,
  }, {
    key: 'degree',
    name: '热门',
  }
]

const authorTypes = [
  {
    key: null,
    name: '全部',
  },
  {
    key: AuthorType.PERSONAL,
    name: '个人',
  }, {
    key: AuthorType.BRANDER,
    name: '品牌主',
  }, {
    key: AuthorType.SERVER,
    name: '服务商',
  }
]


class SearchSubFilterBar extends Component {
  constructor(props) {
    super(props)
    const { query = {}, searchType } = props
    const sortKey = this.getSortKey()

    this.state = {
      showHighMenu: false,
      maskHeight: 0,
      sortKey,
      authorType: query.type ? Number(query.type) : null,
      searchType: searchType || SearchType.SHOTS,
      currentArea: '高级筛选'
    }
  }

  getSortKey() {
    const { query = {} } = this.props
    let label = ''
    if (query.follow === '') {
      label = 'follower'
    } else if (query.popular === '' || query.like === '' || query.read === '' || query.collection === '' || query.comment === '') {
      label = 'degree'
    } else if (query.newest === '') {
      label = 'gmtCreate'
    } else {
      label = 'recommended'
    }
    return label
  }

  handleToggleHighMenu = () => {
    this.setState({ showHighMenu: !this.state.showHighMenu })
    if (!this.state.showHighMenu) {
      const bodyHeight = document.querySelector('#__next').clientHeight
      this.setState({ maskHeight: bodyHeight })
    }
  }

  closeHighMenu() {
    this.setState({ showHighMenu: false })
  }

  handleDropdownClick = () => {
    this.closeHighMenu()
  }

  changeSearchType(searchType) {
    this.setState({ searchType })
  }
  changeSortKey(key) {
    this.setState({ sortKey: key })
  }
  changeAuthorType(type) {
    this.setState({ authorType: type })
  }

  handleTabSelect = (e) => {
    const { searchType } = this.state
    const { onTabChange } = this.props
    const type = Number(e.key)

    if (type === searchType) {
      return
    }

    if (onTabChange) {
      onTabChange(type)
    }
    this.changeSearchType(type)
  }

  handleSortSelect = (e) => {
    const { sortKey, searchType } = this.state
    const { onRequestList, compositionType, currentUser = {} } = this.props
    let param = {}
    let routeOption = {}

    if (e.key === sortKey) {
      return
    }

    switch (e.key) {
      case 'match':
        param = { term: { type: compositionType }, sort: [{ key: e.key, value: 'asc' }], recommended: false }
        // routeOption = {match: ''}
        onRequestList && onRequestList(param, routeOption)
        break
      case 'degree':
        param = { term: { type: compositionType }, sort: [{ key: e.key, value: 'desc' }], recommended: false }
        // routeOption = {popular: ''}
        onRequestList && onRequestList(param, routeOption)
        break
      case 'gmtCreate':
        const currKey = searchType === SearchType.AUTHOR ? 'gmtCreate' : 'gmtPublish'
        param = { term: { type: compositionType }, sort: [{ key: currKey, value: `desc` }], recommended: false }
        // routeOption = {newest: ''}
        onRequestList && onRequestList(param, routeOption)
        break
    }

    this.changeSortKey(e.key)
  }

  handleAuthorTypeSelect = (e) => {
    const { condition = {}, onRequestList, onChangeAuthorType } = this.props
    const key = Number(e.key) || null
    // const param = {
    //   ...condition,
    //   term: { ...condition.term, type: key},
    //   page: 1,
    // }
    // const routeOption = {type: key}
    // if (onRequestList) {
    //   onRequestList(param, routeOption)
    // }
    if (onChangeAuthorType) {
      onChangeAuthorType(key)
    }
    this.changeAuthorType(key)
  }

  handleSelectArea = (option) => {
    const { onRequestList, condition } = this.props
    const { type, cityId, cityName, provinceId, provinceName } = option
    let param = {}
    let routeOption = {}
    let currentArea = ''

    if (type === 'province') {
      currentArea = provinceName
      param = {
        ...condition,
        term: {
          ...condition.term,
          province: [provinceId],
          city: undefined,
        }
      }
      routeOption = { province: provinceId }
    } else if (type === 'city') {
      currentArea = cityName
      param = {
        ...condition,
        term: {
          ...condition.term,
          province: [provinceId],
          city: [cityId]
        }
      }
      routeOption = { province: provinceId, city: cityId }
    } else {
      currentArea = '全部地区'
      param = {
        ...condition,
        term: {
          ...condition.term,
          province: undefined,
          city: undefined,
        }
      }
    }

    onRequestList && onRequestList(param, routeOption)
    this.setState({ currentArea })
    this.closeHighMenu()
  }

  handleChangeCategories = (key) => {
    const { onChangeCategories } = this.props
    if (onChangeCategories) {
      onChangeCategories(key)
    }
    this.closeHighMenu()
  }
  handleChangeForms = (key) => {
    const { onChangeForms } = this.props
    if (onChangeForms) {
      onChangeForms(key)
    }
    this.closeHighMenu()
  }
  handleChangeClassifications = (e) => {
    const key = Number(e.key)
    const { onChangeClassifications } = this.props
    if (onChangeClassifications) {
      onChangeClassifications(key)
    }
  }

  requestClassifications = () => {
    const { onRequestClassifications } = this.props
    if (onRequestClassifications) {
      onRequestClassifications()
    }
  }

  renderShotsFilter() {
    const {
      categoryId,
      formId,
      categories = [],
      forms = [],
    } = this.props

    return (
      <div className="classify-wrapper">
        <div className="classify-item">
          <ClassifyDropdown
            classifyName="品类"
            currentId={categoryId}
            dataSource={categories}
            onChange={this.handleChangeCategories}
            onVisible={this.requestClassifications}
          />
        </div>
        <div className="classify-item">
          <ClassifyDropdown
            classifyName="形式"
            currentId={formId}
            dataSource={forms}
            onChange={this.handleChangeForms}
            onVisible={this.requestClassifications}
          />
        </div>
      </div>
    )
  }

  render() {
    const { showHighMenu, maskHeight, sortKey, authorType, searchType, currentArea } = this.state
    const {
      searchFilterData = {},
    } = this.props

    const hasHighMenu = [SearchType.SHOTS, SearchType.ARTICLE, SearchType.AUTHOR].includes(searchType)
    const hideSort = [SearchType.BRAND, SearchType.TAG].includes(searchType)
    const isShotsType = SearchType.SHOTS === searchType

    const classifications = ((searchFilterData.article || {}).classify || []).reduce((prevArr, item) => {
      if (prevArr.some(prevItem => prevItem.id === item.id)) {
        return prevArr
      }
      prevArr.push(item)
      return prevArr
    }, [])

    const searchTabs: Array<any> = tabData.map((item: any) => {
      const currentTabItem = searchFilterData[item.key] || {}
      item.count = currentTabItem.count || 0
      return item
    })



    const currSearchTypeItem = searchTabs.find(item => item.searchType === searchType) || searchTabs[0]
    const currSortItem = sorts.find(item => item.key === sortKey) || sorts[0]

    const tabMenu = (<Menu
      className="sort-drop-overlay-menu"
      onClick={this.handleTabSelect}
    >
      {searchTabs.map(item => (
        <Menu.Item key={item.searchType} value={item.searchType}>{item.name} ({item.count})</Menu.Item>
      ))}
    </Menu>)
    const sortMenu = (<Menu
      className="sort-drop-overlay-menu"
      onClick={this.handleSortSelect}
    >
      {sorts.map(item => (
        <Menu.Item key={item.key} value={item.key}>{item.name}</Menu.Item>
      ))}
    </Menu>)
    const authorTypeMenu = (<Menu
      className="sort-drop-overlay-menu"
      onClick={this.handleAuthorTypeSelect}
    >
      {authorTypes.map(item => (
        <Menu.Item key={item.key} value={item.key}>{item.name}</Menu.Item>
      ))}
    </Menu>)
    const classifyMenu = (<Menu
      className="sort-drop-overlay-menu"
      onClick={this.handleChangeClassifications}
    >
      {classifications.map(item => (
        <Menu.Item key={item.id}>{item.name}</Menu.Item>
      ))}
    </Menu>)

    let highMenuPanel = null
    switch (searchType) {
      case SearchType.ARTICLE:
        highMenuPanel = classifyMenu
        break
      case SearchType.AUTHOR:
        highMenuPanel = authorTypeMenu
        break
    }


    return (
      <div className="mb-filter-bar-wrapper author-filter-bar">
        <div className="mb-sub-filter-bar">
          <div className="filter-item">
            <Dropdown trigger={['click']} overlay={tabMenu}>
              <div className="sort-dropdown-btn" onClick={this.handleDropdownClick}><span>{currSearchTypeItem.name}</span> <CustomIcon name="arrow-down" /></div>
            </Dropdown>
          </div>
          {!hideSort && <div className="filter-item">
            <Dropdown trigger={['click']} overlay={sortMenu}>
              <div className="sort-dropdown-btn" onClick={this.handleDropdownClick}><span>{currSortItem.name}</span> <CustomIcon name="arrow-down" /></div>
            </Dropdown>
          </div>}
          {hasHighMenu &&
            <div className="filter-item">
              {isShotsType && <span onClick={this.handleToggleHighMenu}>
                <span>筛选</span> <CustomIcon name="funnel" />
              </span>}
              {!isShotsType && <Dropdown
                trigger={['click']}
                overlay={
                  <div className="filter-panel">
                    {highMenuPanel}
                  </div>
                }
              >
                <span >
                  <span>筛选</span> <CustomIcon name="funnel" />
                </span>
              </Dropdown>}
            </div>}
        </div>
        {showHighMenu && <div className="classify-filter-panel">
          <div
            className="classify-fliter-mask"
            onClick={this.handleToggleHighMenu}
            style={{ height: maskHeight }}
          ></div>
          {isShotsType && this.renderShotsFilter()}
        </div>}
      </div>
    )
  }
}

export default SearchSubFilterBar