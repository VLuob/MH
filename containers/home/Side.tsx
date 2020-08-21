import { Fragment, Component } from 'react'
import { Avatar, message } from 'antd'
import { utils } from '@utils'
import { toJS } from 'mobx'
import basic from '@base/system/basic'
import jsCookie from 'js-cookie'
import { inject, observer } from 'mobx-react'
import LazyLoad from '@static/js/LazyLoad'
import { FocusType } from '@base/enums'

import TopicBox from '@components/home/TopicBox'
import SubscribeComp from '@components/common/SubscribeComp'
import AuthorItemSmall from '@components/author/AuthorItemSmall'
import ArticleItemSmall from '@components/article/ArticleItemSmall'
import SideAdBox from '@components/common/SideAdBox'
import SideProductBox from '@containers/common/SideProductBox'


const emptyImage = '/static/images/common/full-empty.png'
const isNewIcon = 'https://resource.meihua.info/Fj16xRfNdgJoaY2Mit8Ha1sm3vS1'
// const isNewIcon = '/static/images/icon/jiaobiao_new.svg'

const token = basic.token
const tagList = [{
  link: 'http://mexpo.meihua.info',
  img: '../../static/images/home/home_logo1.svg',
  name: '传播业大展',
  // isNew: true,
}, {
  link: 'http://mawards.meihua.info',
  img: '../../static/images/home/home_logo2.svg',
  name: '梅花创新奖',
  isNew: true,
}, {
  link: 'http://vip.meihua.info',
  img: '../../static/images/home/home_logo3.svg',
  name: 'VIP人脉'
}, {
  link: 'http://cis.meihua.info',
  img: '../../static/images/home/home_logo4.svg',
  name: '全媒体舆情监测'
},
// {
//     link: 'http://www.bigcat.com/?ref=meihua',
//     img: '../../static/images/home/home_logo5.svg',
//     name: '大猫自动化营销'
// }, 
{
  link: 'http://adm.meihua.info',
  img: '../../static/images/home/home_logo6.svg',
  name: '广告监测'
}]

@inject(stores => {
  const { adStore, homeStore, globalStore } = stores.store
  const { recommendData, fetchActionFollow, featureList, latestCompositionList } = homeStore
  const { actionAdClick, homeAds } = adStore
  const { fetchGetSubscription, serverClientCode } = globalStore

  return {
    homeStore,
    recommendData,
    homeAds,
    latestCompositionList,
    actionAdClick,
    fetchActionFollow,
    featureList,
    fetchGetSubscription,
    serverClientCode,
  }
})
@observer
export default class Side extends Component {
  componentDidMount() {
    this.initEvents()
  }

  componentWillUnmount() {
    this.removeEvents()
  }

  initEvents() {
    document.addEventListener('scroll', this.handleScrollEvent, false)
  }

  removeEvents() {
    document.removeEventListener('scroll', this.handleScrollEvent, false)
  }


  handleScrollEvent = (e) => {
    const sideRef = document.querySelector('.home-side')
    const subscribeRef = document.querySelector('.home-subscribe-detail')
    const commonSubFooter = document.querySelector('.common-sub-footer')

    if (sideRef && subscribeRef && commonSubFooter) {
      const sideRect = sideRef.getBoundingClientRect()
      const subscribeRect = subscribeRef.getBoundingClientRect()
      const bottomRect = commonSubFooter.getBoundingClientRect()

      if (sideRect.bottom < 0) {
        subscribeRef.classList.add('fixed')
      } else {
        subscribeRef.classList.remove('fixed')
      }
      if (subscribeRect.bottom >= bottomRect.top) {
        subscribeRef.style.top = `${bottomRect.top - subscribeRect.height}px`
      } else {
        subscribeRef.style.top = ''
      }
    }

  }

  handleFollow = (item, action) => {
    const { fetchActionFollow, serverClientCode } = this.props

    if (token) {
      fetchActionFollow({ token, client_code: serverClientCode, id: item.id, type: FocusType.AUTHOR, action })
    } else {
      message.destroy()
      message.warning(`请登录后查看`)

      setTimeout(() => {
        window.location.href = `/signin?c=${encodeURIComponent(window.location.pathname)}`
      }, 2000)
    }
  }

  render() {
    const { recommendData, actionAdClick, featureList, latestCompositionList, homeAds } = this.props
    const latestArr = latestCompositionList || []
    const latestTimeago = utils.timeago(latestArr[0] && latestArr[0][`gmtPublish`])

    const topAdList = homeAds['f_h_l_r_1'] || []
    const bottomAdList = homeAds['f_h_l_r_2'] || []

    return (
      <div className='home-side'>
        <SideAdBox adList={topAdList} className="home-ad-box" />
        <SideProductBox className="home-tag-box" />
        <div className='home-article-detail'>
          <div className='home-meta clearfix'>
            <div className='home-title'>推荐文章</div>
            <a className='home-more' href='/article' target='_blank'>查看更多</a>
          </div>
          <a href={latestArr[0] ? `/article/${latestArr[0]['compositionId']}` : ''} target='_blank'>
            <LazyLoad offsetVertical={300} loaderImage
              originalSrc={latestArr[0] && latestArr[0][`cover`]}
              className='home-img-box'
              imageProps={{
                src: emptyImage,
                ref: 'image',
                alt: latestArr[0] ? latestArr[0]['title'] : '',
              }} />
          </a>
          <div>
            {/* <img src={latestArr[0] && latestArr[0][`cover`]} /> */}
          </div>
          <p className='home-headline'>
            <a href={latestArr[0] ? `/article/${latestArr[0]['compositionId']}` : ''} target='_blank'>
              {latestArr[0] && latestArr[0][`title`]}
            </a>
          </p>
          <span className='home-brief'>
            <a href={`/author/${latestArr[0] && latestArr[0]['authorCode']}`}>{latestArr[0] && latestArr[0][`authorName`]}</a>
            {latestArr[0] && latestArr[0][`authorName`] && latestArr[0][`gmtPublish`] && <span className='dot'> · </span>}
            {latestArr[0] && latestTimeago}
          </span>
          <ul className='sider-author-list'>
            {latestArr && Array.isArray(latestArr) && latestArr.map((item, index) => {
              const timeago = utils.timeago(item.gmtPublish)

              if (index !== 0) {
                return (
                  <ArticleItemSmall
                    key={item.compositionId}
                    id={item.compositionId || item.id}
                    img={item.cover}
                    code={item.authorCode}
                    title={item.title}
                    author={item.authorName}
                    timeago={timeago} />
                )
              }
            })}
          </ul>
        </div>
        <div className='home-rec-author-detail'>
          <div className='home-meta clearfix'>
            <div className='home-title'>推荐创作者</div>
            <a className='home-more' href='/author' target='_blank'>查看更多</a>
          </div>
          <ul className='sider-author-list'>
            {recommendData && recommendData.map(item => {
              return (
                <Fragment key={item.id || item.compositionId}>
                  <AuthorItemSmall
                    item={item}
                    key={item.id}
                    type={item.type}
                    avatar={item.avatar}
                    title={item.nickname}
                    authorCode={item.code}
                    article={item.signature}
                    followed={item.followed}
                    signature={item.signature}
                    onFollow={action => this.handleFollow(item, action)}
                  />
                </Fragment>
              )
            })}
          </ul>
        </div>
        {featureList.length > 0 && <div className='home-rec-subject'>
          <div className='home-meta clearfix'>
            <div className='home-title'>推荐专题</div>
            <a className='home-more' href='/topics' target='_blank'>查看更多</a>
          </div>
          <TopicBox
            size={40}
            link={`/topics`}
            list={featureList || []}
            className='side-topic-list'
          />
        </div>}
        <div className='home-subscribe-detail'>
          <SubscribeComp
            className='side-position'
            wxName={'梅花网微信公众号'}
            smName={'手机浏览梅花网'}
          />
        </div>
        <SideAdBox adList={bottomAdList} className="home-ad-box" />
      </div>
    )
  }
}