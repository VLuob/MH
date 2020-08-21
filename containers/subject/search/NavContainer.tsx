import { Component } from 'react'
import { Input, Dropdown } from 'antd'
import { utils } from '@utils'
import { Router } from '@routes'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'
import classnames from 'classnames'
import isEqual from 'lodash/isEqual'
import debounce from 'lodash/debounce'
import CustomIcon from '@components/widget/common/Icon'

import SearchHotBox from './SearchHotBox'
import SearchDropPanel from './SearchDropPanel'

const Search = Input.Search

@inject(stores => {
    const { searchStore, adStore } = stores.store
    const { clientKeywords, searchHotList, searchSimilarWords, searchPopup } = searchStore
    const { searchKeywordsAds } = adStore

    const keywordsAds = []
    for (let k in searchKeywordsAds) {
        const keyAds = searchKeywordsAds[k]
        if (Array.isArray(toJS(keyAds))) {
            keywordsAds.push(...toJS(keyAds))
        }
    }

    return {
        searchStore,
        clientKeywords,
        searchHotList,
        searchSimilarWords,
        searchPopup,
        searchKeywordsAds,
        keywordsAds,
    }
})
@observer
export default class NavContainer extends Component {
    constructor(props) {
        super(props)

        this.state = {
            val: props.clientKeywords,
            dropPanel: false,
            searchKeywords: props.clientKeywords,

            keywordsAds: props.keywordsAds,
            keywordsAdLabel: '',
        }

        this.searchFocus = false

        this.reqSearchPopup = debounce(this.reqSearchPopup, 500)
    }

    static getDerivedStateFromProps(props, state) {
        if (!isEqual(props.keywordsAds, state.keywordsAds)) {
            return {
                keywordsAds: props.keywordsAds,
            }
        }
        if(!props.clientKeywords) {
            return {
                searchKeywords: props.navProps.keywords
            }
        } else {
            return {
                searchKeywords: state.searchKeywords
            }
        }
    }

    componentDidMount() {
        const { query } = this.props
        // const searchKeywords = utils.getUrlParam(`k`)
        const searchKeywords = query.k
        this.setState({ searchKeywords })

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
            this.setState({keywordsAdLabel})
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
                    this.setState({keywordsAdLabel})
                    if (speed < 5000) {
                        speed = 5000
                        startDowncount()
                    }
                }
            }, speed)
        }

        startDowncount()
    }

    handleSearch = val => {
        const keywords = val || this.state.keywordsAdLabel
        window.location.href = `/search!${encodeURIComponent(keywords)}`
    }

    handleChangeSearch = e => {
        const searchKeywords = e.target.value

        this.setState({ searchKeywords })
    }

    handleSearchFocus = (e) => {
        const { searchStore } = this.props
        const searchKeywords = e.target.value
        this.setState({searchKeywords})
        // if (searchKeywords.trim() !== '') {
        //     searchStore.fetchSearchPopup({keywords: searchKeywords})
        // }
        this.reqSearchPopup(searchKeywords)
    }

    handleSearchBlur = (e) => {
        // setTimeout(() => {
        //     this.setState({dropPanel: false})
        // }, 200)
    }

    handleSearchClick = (e) => {

        if (this.state.dropPanel) {
            e.stopPropagation()
        }
    }

    handleSearchChange = (e) => {
        // const { searchStore } = this.props
        const searchKeywords = e.target.value
        this.setState({searchKeywords})
        // if (searchKeywords.trim() !== '') {
        //     searchStore.fetchSearchPopup({keywords: searchKeywords})
        // }
        this.reqSearchPopup(searchKeywords)
    }
    reqSearchPopup(searchKeywords) {
        const { searchStore } = this.props
        const keywords = searchKeywords.replace(/\s+/g,'')
        if (keywords.trim() !== '') {
            searchStore.fetchSearchPopup({keywords})
        }
    }

    handleVisibleChange = (visible) => {
        if (visible) {
            this.setState({dropPanel: true})
        } else {
            this.setState({dropPanel: false})
        }
    }

    handleTopClick = (e) => {
        e.stopPropagation()
        window.open('/top')
    }

    render() {
        const { dropPanel, searchKeywords, keywordsAdLabel } = this.state
        const { searchSimilarWords } = this.props
        const value = decodeURIComponent(searchKeywords)
        const hasHots = searchSimilarWords.length > 0
        const similarWorks = (searchSimilarWords || []).slice(0, 5)

        return (
            <div className='nav-container'>
                <div className="search-wrapper">
                    <Dropdown
                        trigger={['click']}
                        onVisibleChange={this.handleVisibleChange}
                        overlay={
                            <SearchDropPanel 
                                // show={dropPanel} 
                                keywords={searchKeywords} 
                                onSelectHot={this.handleSearch} 
                            />
                        }
                    >
                        <div>
                            <Search
                                size='large'
                                value={value}
                                enterButton='搜索'
                                className='search-input'
                                placeholder={keywordsAdLabel || '请输入需要搜索的内容'}
                                onChange={this.handleSearchChange}
                                onSearch={value => this.handleSearch(value)} 
                                onFocus={this.handleSearchFocus}
                                // onBlur={this.handleSearchBlur}
                                onClick={this.handleSearchClick}
                                suffix={
                                    <a href="/top" target="_blank" className="search-suffix-text" onClick={this.handleTopClick}><CustomIcon name="fire" />作品排行榜</a>
                                }
                            />
                        </div>
                    </Dropdown>
                    {/* <div className={classnames('search-drop-panel', {'show': dropPanel})}>
                        <SearchHotBox
                            onSelect={this.handleSearch}
                        />
                    </div> */}
                </div>
                {hasHots && 
                <div className='recommend-search clearfix'>
                    <span className='name'>推荐搜索</span>
                    <ul className='tag-group right'>
                        {similarWorks.map((k, i) => (
                            <li onClick={e => this.handleSearch(k)} key={i}>
                                {k}
                            </li>
                        ))}
                    </ul>
                </div>}
            </div>
        )
    }
}