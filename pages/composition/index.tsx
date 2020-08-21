import { Component } from 'react'
import { Router } from '@routes'
import { parseCookies, setCookie, destroyCookie } from 'nookies'
import dynamic from 'next/dynamic'
import { Tabs, Spin } from 'antd'
import Head from 'next/head'

import { config } from '@utils'

import HeadComponent from '@components/common/HeadComponent'

const dynamicParams = {
  ssr: false,
  loading: () => <div className="loading-placeholder"><Spin size="large" /></div>,
}
const ArticleContainer = dynamic(() => import('@containers/composition/ArticleContainer'), dynamicParams)
const ShotsContainer = dynamic(() => import('@containers/composition/ShotsContainer'), dynamicParams)
const ServiceContainer = dynamic(() => import('@containers/service/ServicePublish'), dynamicParams)

const TabPane = Tabs.TabPane

const TabKeys = {
  ARTICLE: 'article',
  SHOTS: 'shots',
  SERVICE: 'service',
}

export default class Composition extends Component {
    static async getInitialProps(ctx) {
      const { req, res, query, asPath, mobxStore } = ctx
        const { compositionStore, globalStore } = mobxStore

        let datas = {}
        
        if (req && req.headers ) {
            const host = req.headers.host
            const cookies = parseCookies(ctx)
            const client = cookies[config.COOKIE_MEIHUA_CLIENT_CODE]
            const token = cookies[config.COOKIE_MEIHUA_TOKEN]

            // 未登录用户跳转到首页
            if (!token) {
                res.writeHead(307,{ Location: '/'})
                res.end()
            }
            const resultAuthors = await compositionStore.fetchAuthors({host, token})
            // token错误跳转到首页
            if (resultAuthors.data && resultAuthors.data.code === 'E100000' && resultAuthors.data.msg === 'ERROR TOKEN') {
                res.writeHead(307,{ Location: '/'})
                res.end()
                // 登录用户没有创作者跳转到创建创作者页面
            } 
            else if (resultAuthors.data && Array.isArray(resultAuthors.data) && resultAuthors.data.length === 0) {
                res.writeHead(307,{ Location: '/creator'})
                res.end()
            }

            const resultQiniuToken = await globalStore.fetchQiniuToken({host})
            datas = {resultQiniuToken}

            
            if (query.id) {
                const compositionId = query.id
                const params = { host, compositionId, token, client, op: 1 }
                // const resultCompositionDetail = await compositionStore.fetchComposition(params)
                const resultCompositionDetail = {}
    
                // console.log(resultCompositionDetail)
                datas = {...datas, resultCompositionDetail}
            }

            datas.resultAuthors = resultAuthors
        }
        
        return { 
          asPath, 
          query, 
          globalStore,
          ...datas,
        }
    }

    handleTabs = (key) => {
        // window.location.href = `/${key}/new`
      Router.pushRoute(`/${key}/new`)
    }

    render() {
        const { asPath, query, resultCompositionDetail, resultQiniuToken, resultAuthors } = this.props
        let type = TabKeys.SHOTS
        if (asPath.indexOf(`/${TabKeys.ARTICLE}`) >= 0) {
            type = TabKeys.ARTICLE
        } else if (asPath.indexOf(`/${TabKeys.SERVICE}`) >= 0) {
            type = TabKeys.SERVICE
        } else {
            type = TabKeys.SHOTS
        }
        const isArticle = type === TabKeys.ARTICLE
        const isService = type === TabKeys.SERVICE
        const isShots = type === TabKeys.SHOTS
        const isEdit = !!query.id
        const title = resultCompositionDetail &&
            resultCompositionDetail.latestCompositions && 
            resultCompositionDetail.latestCompositions.length > 0 &&
            resultCompositionDetail.latestCompositions[0][`title`]
        let name
        let tabTitle 

        // console.log(toJS(resultCompositionDetail))
        if(isEdit) {
            name = `编辑${title || ''}-梅花网`
            switch (type) {
                case TabKeys.ARTICLE:
                    tabTitle = `编辑文章`
                    break
                case TabKeys.SERVICE:
                    tabTitle = `编辑服务`
                    break
                case TabKeys.SHOTS:
                default:
                    tabTitle = `编辑作品`
                    break
            }
        } else {
            switch (type) {
                case TabKeys.ARTICLE:
                    name = `发布文章-梅花网`
                    break
                case TabKeys.SERVICE:
                    name = `发布服务-梅花网`
                    break
                case TabKeys.SHOTS:
                default:
                    name = `发布作品-梅花网`
                    break
            }
        }

        return (
            <>
                <HeadComponent title={`${name}`} />
                <Head>
                    <link rel="stylesheet" href="/static/images/plugins/JEditor/css/JEditor.min.css"/>
                    <script src="/static/images/plugins/JEditor/js/lib/jquery-1.10.2.min.js"></script>
                    <script src="/static/images/plugins/JEditor/js/JEditor.js"></script>
                </Head>
                {/* <CommonHeader asPath={asPath} userInfo={userInfo}/> */}
                <div className='composition-container'>
                    {isEdit
                    ? <div className="composition-edit-header">
                        <span className="title">{tabTitle}</span>
                    </div>
                    : <Tabs defaultActiveKey={type} type='line' size='large'
                        onChange={this.handleTabs} animated={false}>
                        <TabPane tab='发布作品' key={TabKeys.SHOTS}></TabPane>
                        <TabPane tab='发布文章' key={TabKeys.ARTICLE}></TabPane>
                        <TabPane tab='发布服务' key={TabKeys.SERVICE}></TabPane>
                    </Tabs>}
                    {isShots && <ShotsContainer query={query} resultCompositionDetail={resultCompositionDetail} resultQiniuToken={resultQiniuToken} resultAuthors={resultAuthors} />}
                    {isArticle && <ArticleContainer query={query} resultCompositionDetail={resultCompositionDetail} resultQiniuToken={resultQiniuToken} resultAuthors={resultAuthors} />}
                    {isService && <ServiceContainer query={query} />}
                </div>
            </>
        )
    }
}