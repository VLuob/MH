import { Component } from 'react'
import { toJS } from 'mobx'

export default class ArticleBriefComp extends Component {
    render() {
        const item = this.props.item || {}

        return (
            <div className='article-brief-box'>
                <a href='/'>
                    <div className='inner-box'>
                        <div className='article-intro'>
                            <div className='img-box'>
                                <img src={item.cover} alt='封面'/>
                            </div>
                            <div className='left-content'>
                                <div className='title'>{item.title || '空标题'}</div>
                                <div className='summary'>{item.summary || '空简介'}</div>
                                <div className='meta'>{item.authorName}   ·   {item.gmtPublished}   · 阅读  {item.views}万 · 分类  {item.classificationName}</div>
                            </div>
                        </div>
                    </div>
                </a>
            </div>
        )
    }
}