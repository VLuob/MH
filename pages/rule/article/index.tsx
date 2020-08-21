import { Component } from 'react'

import HeadComponent from '@components/common/HeadComponent'
import RuleContainer from '@containers/rule/article'



export default class RuleArticle extends Component {
    static async getInitialProps(ctx) {
        const { req, query, asPath } = ctx

        return {
            asPath,
            query,
        }
    }

    render() {
        const { asPath, userInfo } = this.props

        return (
            <>
              <HeadComponent title={`梅花网文章收录规范-梅花网`} />
              {/* <CommonHeader asPath={asPath} userInfo={userInfo} /> */}
              <RuleContainer />
            </>
        )
    }
}