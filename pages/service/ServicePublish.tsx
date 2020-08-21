import { Component } from 'react'
import HeadComponent from '@components/common/HeadComponent'
import EnquiryPublish from '@containers/enquiry/EnquiryPublish'


export default class ServiceDetail extends Component {
    static async getInitialProps(ctx) {
        const { req, res, query, asPath, mobxStore } = ctx
        const { globalStore } = mobxStore
        const { isMobileScreen, setMobileNavigationData } = globalStore

        if (req && req.headers) {
         
          
        }

         return {
            query,
        }
    }

    render() {
        const { query, ...rest } = this.props
        

        return (
            <>
                <HeadComponent
                    title="发布服务"
                    description="服务商推广,营销服务商销售线索,业务推广就来梅花网,致力于成为中国最大的营销作品库,并为行业上下游提供一个合作共赢的互动交流平台。"
                />
                <EnquiryPublish query={query} />
            </>
        )
    }
}