import { Component } from 'react'
import {stringify} from 'qs'
import HeadComponent from '@components/common/HeadComponent'
import PricingContainer from '@containers/pricing'

import { EditionType } from '@base/enums'


export default class Pricing extends Component {
    static async getInitialProps(ctx) {
        const { req, res, query, asPath, mobxStore } = ctx

        let datas = {}

        if (req && req.headers) {
            // const host = req.headers.host
            const edition = Number(query.v)
            if (edition && ![EditionType.STANDARD, EditionType.ADVANCED].includes(edition)) {
                res.writeHead(307, {Location: `/pricing?${stringify({...query, v: EditionType.STANDARD})}`})
                res.end()
            }
        }

         return {
            query,
            ...datas,
        }
    }

    render() {
        const { query, ...rest } = this.props
        

        return (
            <>
                <HeadComponent
                    title="服务商推广 - 营销服务商销售线索 - 营销作品宝库 - 梅花网"
                    description="服务商推广,营销服务商销售线索,业务推广就来梅花网,致力于成为中国最大的营销作品库,并为行业上下游提供一个合作共赢的互动交流平台。"
                />
                <PricingContainer query={query} />
            </>
        )
    }
}