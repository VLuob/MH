import { Component } from 'react'
import { Input } from 'antd'
import { utils } from '@utils'
import { Router } from '@routes'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'

const Search = Input.Search

@inject(stores => {
    const { searchStore } = stores.store
    const { searchHotList } = searchStore

    return {
      searchStore,
      searchHotList,
    }
})
@observer
export default class SearchHotBox extends Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
      const { searchHotList, searchStore } = this.props;
      if (searchHotList.length === 0) {
        searchStore.fetchSearchHot({limit: 8})
      }
    }

    handleSelect = (name) => {
      const { onSelect } = this.props
      if (onSelect) {
        onSelect(name)
      }
    }

    render() {
        const { searchHotList } = this.props

        return (
          <div className="search-hot-box">
              <div className="search-hot-header">热门搜索</div>
              <div className="search-hot-content">
                  <ul className="search-hot-list">
                      {searchHotList.map((item, i) => {
                          return (
                              <li className="search-hot-item" key={i} onClick={e => this.handleSelect(item.name)}> 
                                {/* <span className="search-count">{item.searchCount}</span> */}
                                <span className={`hot-sort-index${i < 3 ? ' hot' : ''}`}>{i + 1}</span> 
                                <span>{item.name}</span>
                              </li>
                          )
                      })}
                  </ul>
              </div>
          </div>
        )
    }
}