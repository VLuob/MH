import { Component } from 'react'
import { toJS } from 'mobx'
import dynamic from 'next/dynamic'
import { inject, observer } from 'mobx-react'
import { Row, Col, Layout, Radio } from 'antd'
import BannerAnim, { Element } from 'rc-banner-anim'
import { SiteModules, CompositionTypes } from '@base/enums'
import TweenOne from 'rc-tween-one'
import SwiperContainer from '@containers/common/SwiperContainer'
import LazyLoad from '@static/js/LazyLoad'

import emptyImage from '@static/images/common/full-empty.png'

import 'rc-banner-anim/assets/index.css'
import adStore from '@stores/global/adStore';

const BgElement = Element.BgElement
const bannerKeys = ['f_a_s_l_1', 'f_a_s_l_2', 'f_a_s_l_3']

const siteModules = {
  [SiteModules.SHOTS]: '作品',
  [SiteModules.ARTICLE]: '文章',
  [SiteModules.AUTHOR]: '创作者',
};

const defaultAppSetting = '{"appSetting":{"appOpenScreenImages":null},"showSetting":{"title":true,"recommendation":false}}'

@inject(stores => {
  const { adStore } = stores.store

  return {
    adStore,
    articleHomeAds: adStore.articleHomeAds,
  }
})
@observer
export default class AdBanner extends Component {
  
  render() {
    const { articleHomeAds, resultNewArticles } = this.props

    // console.log(resultNewArticles)

    // const adList = articleHomeAds['f_a_s_l_1'] || []
    const ad2List = articleHomeAds['f_a_s_l_t_1'] || []
    const ad3List = articleHomeAds['f_a_s_l_t_2'] || []
    // const ad2List = []
    // const ad3List = []
    let ad2 = ad2List[0] || {}
    let ad3 = ad3List[0] || {}
    const ad2Setting = JSON.parse(ad2.setting || defaultAppSetting)
    const ad2ShowSetting = ad2Setting.showSetting || {}
    const ad3Setting = JSON.parse(ad3.setting || defaultAppSetting)
    const ad3ShowSetting = ad3Setting.showSetting || {}
    const adBanners = []

    bannerKeys.forEach(key => {
      const ads = articleHomeAds[key] || []
      if (ads[0]) {
        adBanners.push(ads[0])
      }
    })

    if (adBanners.length === 0) {
      const newArticles = resultNewArticles.slice(0,3)
      newArticles.forEach(item => {
        adBanners.push({
          id: item.compositionId,
          title: item.title,
          image: item.cover,
          link: `/article/${item.compositionId}`,
          module: item.type === CompositionTypes.ARTICLE ? SiteModules.ARTICLE : SiteModules.SHOTS,
        })
      })
    }
    if (!ad2List[0]) {
      const item = resultNewArticles[3] || {}
        ad2 = {
          id: item.compositionId,
          title: item.title,
          image: item.cover,
          link: `/article/${item.compositionId}`,
          module: item.type === CompositionTypes.ARTICLE ? SiteModules.ARTICLE : SiteModules.SHOTS,
      }
    }

    if (!ad3List[0]) {
      const item = resultNewArticles[4] || {}
      ad3 = {
        id: item.compositionId,
        title: item.title,
        image: item.cover,
        link: `/article/${item.compositionId}`,
        module: item.type === CompositionTypes.ARTICLE ? SiteModules.ARTICLE : SiteModules.SHOTS,
      }
    }

    
    return (
      <div className="article-banner">
        <Row>
            <Col xs={24} sm={24} md={16}>
            {/* <BannerAnim
                className="article-banner-anim"
                arrow={false}
                autoPlay
            >
              {adList.map(item => (
                <Element key={item.id}>
                    <BgElement
                        key={`bg${item.id}`}
                        className="banner-bg"
                        style={{backgroundImage: `url(${item.image})`}}
                    />
                    <div className="banner-title-group">
                        <TweenOne
                            className="banner-title"
                            key={`t1${item.id}`}
                        >
                            {item.title}
                        </TweenOne>
                        <TweenOne
                            className="banner-summary"
                            key={`t2${item.id}`}
                        >
                            {item.classificationName}
                        </TweenOne>
                    </div>
                </Element>
              ))}
            </BannerAnim> */}
            <div className="article-banner-view">
              {adBanners.length > 0 && <SwiperContainer>
                  {adBanners.map(item => {
                    const setting = JSON.parse(item.setting || defaultAppSetting)
                    const showSetting = setting.showSetting || {}
                    
                      return (
                          <div className='swiper-box' key={item.id}>
                              <a href={item.link || 'javascript:;'} onClick={e => adStore.actionAdClick({id: item.id})} target='_blank' title={item.title}>
                                  <img src={item.image} alt={item.title} alt={item.title} />
                                  {/* <LazyLoad offsetVertical={300} loaderImage
                                    className="image-lazy-load"
                                      originalSrc={item.image}
                                      imageProps={{
                                          src: emptyImage,
                                          ref: 'image'
                                      }} /> */}
                                  <TweenOne>
                                      {showSetting.title && 
                                      <div className='swiper-banner'>
                                          {<span className='title'>{item.title}</span>}
                                          {/* { <span className='module'>{siteModules[item.module]}</span>} */}
                                      </div>}
                                  </TweenOne>
                              </a>
                              {showSetting.recommendation && <span className="ad-spread">推广</span>}
                          </div>
                      )
                  })}
              </SwiperContainer>}

            </div>
            </Col>
            <Col xs={24} sm={24} md={8}>
                <div className="banner-ad-image">
                    <div className="image-item">
                      {ad2.link ? <a href={ad2.link} target="_blank" onClick={e => adStore.actionAdClick({id: ad2.id})} title={ad2.title}><img src={ad2.image} alt={ad2.title} /></a> : <img src={ad2.image} alt={ad2.title} onClick={e => adStore.actionAdClick({id: ad2.id})} />}
                      {ad2ShowSetting.title && <div className="title">{ad2.title}</div>}
                      {ad2ShowSetting.recommendation && <span className="ad-spread">推广</span>}
                    </div>
                    <div className="image-item">
                      {ad3.link ? <a href={ad3.link} target="_blank" onClick={e => adStore.actionAdClick({id: ad3.id})} title={ad3.title}><img src={ad3.image} alt={ad3.title}/></a> : <img src={ad3.image} alt={ad3.title} onClick={e => adStore.actionAdClick({id: ad3.id})} />}
                      {ad3ShowSetting.title && <div className="title">{ad3.title}</div>}
                      {ad3ShowSetting.recommendation && <span className="ad-spread">推广</span>}
                    </div>
                </div>
            </Col>
        </Row>
    </div>
    );
  }
}  