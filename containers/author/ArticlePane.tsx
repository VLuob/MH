import { Component } from 'react'

export default class ArticlePane extends Component {

  render() {

    return (
      <div className="author-container">
        <div className="pane-header">
          <span>共创作了 18 篇文章</span>
          <span className="search">
            <Input
              prefix={<Icon type="search" />}
              placeholder="搜索他的文章"
            />
          </span>
        </div>
        <div className="pane-content">
          <ul className="article-list">
            <li className="article-item">
              <div className="info-box">
                <h2>近期，美团、知乎、新浪、网易等一线互联网公司先后爆出裁员，梅小花采访了一线人士，听听他们怎么说</h2>
                <div className="intro">近期，美团、知乎、新浪、网易、滴滴等一线互联网公司先后爆出裁员，大家纷纷惊呼“互联网寒冬”已至。焦虑的情绪在逐渐蔓延到了广告业，难道真…</div>
                <div className="footer-box">梅花网小蚂蚁   ·   刚刚   · 阅读  210万  · 分类  广告设计</div>
              </div>
              <div className="image-box">
                <img src="" alt=""/>
              </div>
            </li>
          </ul>
        </div>
      </div>
    )
  }
 }