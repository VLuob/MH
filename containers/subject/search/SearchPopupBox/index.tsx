import { Component } from 'react'
import { Tag, Avatar, Spin } from 'antd'
import { utils } from '@utils'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'
import moment from 'moment'
import CustomIcon from '@components/widget/common/Icon'
import UserIdentityComp from '@components/widget/common/UserIdentityComp'

import './index.less'

@inject(stores => {
    const { searchStore } = stores.store
    const { searchPopup } = searchStore

    return {
      searchStore,
      searchPopup,
    }
})
@observer
export default class SearchPopupBox extends Component {
  state = {
    brandShow: false,
    authorShow: false,
    shotsShow: false,
    articleShow: false,
    tagShow: false,
    enquiryShow: false,
    serviceShow: false,
  }

  handleToggleShow = (bool, type) => {
    this.setState({[`${type}Show`]: bool})
  }

  renderShowBtn(type) {
    const { searchPopup } = this.props
    const show = this.state[`${type}Show`]
    let visible = false
    let count =  0
    if (type === 'shots') {
      count = searchPopup[`work_quantity`]
    } else if (type === 'author') {
      count = searchPopup[`author_quantity`] || searchPopup[`author_count`]
    } else if (['enquiry','service'].includes(type)) {
      count = searchPopup[`${type}Quantity`]
    } else {
      count = searchPopup[`${type}_quantity`]
    }
    switch (type) {
      case 'shots':
      case 'article':
        visible = count > 3
        break
      case 'enquiry':
      case 'service':
        visible = count > 2
        break
      case 'brand':
      case 'author':
      case 'tag':
        visible = count > 1
        break
    }
    return visible ? <a onClick={e => this.handleToggleShow(!show, type)}>{!show ? '展开' : '收起'}</a> : null
  }

  render() {
      const { keywords, searchPopup } = this.props
      const { shotsShow, articleShow, brandShow, authorShow, tagShow, enquiryShow, serviceShow } = this.state
      const loading = searchPopup.isLoading
      const total = searchPopup.total_quantity || 0
      const brandCount = searchPopup.brand_quantity || 0
      const authorCount = searchPopup.author_quantity || searchPopup.author_count || 0
      const tagCount = searchPopup.tag_quantity || 0
      const articleCount = searchPopup.article_quantity || 0
      const shotsCount = searchPopup.work_quantity || 0
      const enquiryCount = searchPopup.enquiryQuantity || 0
      const serviceCount = searchPopup.serviceQuantity || 0
      const brandList = (searchPopup.brand_list || []).slice(0, brandShow ? 6 : 1)
      const authorList = (searchPopup.author_list || []).slice(0, authorShow ? 6 : 1)
      const tagList = (searchPopup.tag_list || []).slice(0, tagShow ? 6 : 1)
      const shotsList = (searchPopup.work_list || []).slice(0, shotsShow ? 6 : 3)
      const articleList = (searchPopup.article_list || []).slice(0, articleShow ? 6 : 3)
      const enquiryList = (searchPopup.enquiryList || []).slice(0, enquiryShow ? 4 : 2)
      const serviceList = (searchPopup.serviceList || []).slice(0, serviceShow ? 4 : 2)

      const showBrandMore = brandShow && brandCount > 6
      const showAuthorMore = authorShow && authorCount > 6
      const showTagMore = tagShow && tagCount > 6
      const showShotsMore = shotsShow && shotsCount > 6
      const showArticleMore = articleShow && articleCount > 6
      const showEnquiryMore = enquiryShow && enquiryCount > 4
      const showServiceMore = serviceShow && serviceCount > 4

      return (
        <div className="search-popup-box">
            <div className="search-popup-header"><span>共搜索到{total}个结果</span>{loading && <span className="search-popup-loading-inner"><Spin size="small" spinning={loading} /></span>}<a href={`/search!${keywords}`} target="_blank">查看全部</a></div>
            <div className="search-popup-content">
                {brandCount > 0 && <dl>
                  <dt>
                    <span>品牌 <Tag>{brandCount || 0}</Tag></span>
                    {this.renderShowBtn('brand')}
                  </dt>
                  <dd>
                    <ul className="search-brand-tag-list">
                      {brandList.map((item, i) => (
                        <li key={i}>
                        <a href={`/brand/${item.id}`} target="_blank">
                          <CustomIcon name="brand" /> <span>{item.chName}</span> {item.enName && <span>({item.enName})</span>}
                        </a>
                      </li>
                      ))}
                    </ul>
                    {showBrandMore && <div className="view-more">
                      <a href={`/search/brand!${keywords}`} target="_blank">查看全部</a>
                    </div>}
                  </dd>
                </dl>}
                {authorCount > 0 && <dl>
                  <dt>
                    <span>创作者 <Tag>{authorCount || 0}</Tag></span>
                    {this.renderShowBtn('author')}
                  </dt>
                  <dd>
                    <ul className="search-author-list">
                      {authorList.map((item, i) => (
                        <li key={i}>
                          <a href={`/author/${item.code}`} target="_blank">
                            <Avatar size={40} src={item.avatar} /> 
                            <div className="author-intro">
                              <div className="nickname">{item.nickname}</div>
                              <div className="author-type">
                                <UserIdentityComp currentType={item.type} editionType={item.editionType} />
                              </div>
                            </div>
                          </a>
                        </li>
                      ))}
                    </ul>
                    {showAuthorMore && <div className="view-more">
                      <a href={`/search/author!${keywords}`} target="_blank">查看全部</a>
                    </div>}
                  </dd>
                </dl>}
                {shotsCount > 0 &&
                <dl>
                  <dt>
                    <span>作品 <Tag>{shotsCount || 0}</Tag></span>
                    {this.renderShowBtn('shots')}
                  </dt>
                  <dd>
                    <ul className="search-shots-list">
                      {shotsList.map((item, i) => (
                        <li key={i}>
                          <div className="cover">
                            <a href={`/shots/${item.compositionId}`} target="_blank">
                            <img src={`${item.cover}?imageMogr2/thumbnail/!504x360r/size-limit/50k/gravity/center/crop/504x360`} alt=""/>
                            </a>
                          </div>
                          <div className="title">
                            <a href={`/shots/${item.compositionId}`} target="_blank">{item.title}</a>
                          </div>
                        </li>
                      ))}
                    </ul>
                    {showShotsMore && <div className="view-more">
                      <a href={`/search/shots!${keywords}`} target="_blank">查看全部</a>
                    </div>}
                  </dd>
                </dl>}
                {serviceCount > 0 &&
                <dl>
                  <dt>
                    <span>服务 <Tag>{serviceCount || 0}</Tag></span>
                    {this.renderShowBtn('service')}
                  </dt>
                  <dd>
                    <ul className="search-service-list">
                      {serviceList.map((item, i) => {
                        return (
                          <li key={i}>
                            <div className="cover-wrapper">
                              <div className="cover"><a href={`/service/${item.id}`} target="_blank"><img src={item.cover} alt={item.name}/></a></div>
                              <span className="form-tag">{item.formName}</span>
                            </div>
                            <div className="info">
                              <div className="name">
                              <a href={`/service/${item.id}`} target="_blank">{item.name}</a>
                              </div>
                              <div className="intro"><span>≈ {item.minPrice}元</span></div>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                    {showServiceMore && <div className="view-more">
                      <a href={`/search/service!${keywords}`} target="_blank">查看全部</a>
                    </div>}
                  </dd>
                </dl>}
                {enquiryCount > 0 &&
                <dl>
                  <dt>
                    <span>询价 <Tag>{enquiryCount || 0}</Tag></span>
                    {this.renderShowBtn('enquiry')}
                  </dt>
                  <dd>
                    <ul className="search-enquiry-list">
                      {enquiryList.map((item, i) => {
                        const contactInfo = JSON.parse(item.contactInfo || '{}')
                        return (
                          <li key={i}>
                            <div className="content">
                              <div className="text"><a href={`/enquiry/${item.id}`} target="_blank">{item.content}</a></div>
                              <div className="price">{item.budget}</div></div>
                            <div className="intro"><span className="form-tag">{item.formName}</span><span>{contactInfo.company}</span> · <span>{moment(item.gmtPublished).format('YYYY-MM-DD')}</span></div>
                          </li>
                        )
                      })}
                    </ul>
                    {showEnquiryMore && <div className="view-more">
                      <a href={`/search/enquiry!${keywords}`} target="_blank">查看全部</a>
                    </div>}
                  </dd>
                </dl>}
                {articleCount > 0 &&
                <dl>
                  <dt>
                    <span>文章 <Tag>{articleCount || 0}</Tag></span>
                    {this.renderShowBtn('article')}
                  </dt>
                  <dd>
                    <ul className="search-article-list">
                      {articleList.map((item, i) => (
                        <li key={i}>
                          <div className="title"><a href={`/article/${item.compositionId}`} target="_blank">{item.title}</a></div>
                          <div className="intro"><span><a href={`/author/${item.authorCode}`} target="_blank">{item.authorName}</a></span> · <span>{moment(item.gmtPublish).format('YYYY-MM-DD')}</span></div>
                        </li>
                      ))}
                    </ul>
                    {showArticleMore && <div className="view-more">
                      <a href={`/search/article!${keywords}`} target="_blank">查看全部</a>
                    </div>}
                  </dd>
                </dl>}
                {tagCount > 0 && <dl>
                  <dt>
                    <span>标签 <Tag>{tagCount || 0}</Tag></span>
                    {this.renderShowBtn('tag')}
                  </dt>
                  <dd>
                    <ul className="search-brand-tag-list">
                      {tagList.map((item, i) => (
                        <li key={i}>
                          <a href={`/tag/${item.id}`} target="_blank">
                            <CustomIcon name="tag" /> <span>{item.name}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                    {showTagMore && <div className="view-more">
                      <a href={`/search/tag!${keywords}`} target="_blank">查看全部</a>
                    </div>}
                  </dd>
                </dl>}
            </div>
        </div>
      )
  }
}