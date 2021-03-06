import { Component } from 'react'

import HeadComponent from '@components/common/HeadComponent'
import AgreementContainer from '@containers/agreement/shots'



export default class Article extends Component {
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
              <HeadComponent title={`梅花网作品库发布协议-梅花网`} />
              {/* <CommonHeader asPath={asPath} userInfo={userInfo} /> */}
              <AgreementContainer />
            </>
        )
    }
}