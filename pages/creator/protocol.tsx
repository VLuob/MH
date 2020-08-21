import { Component } from 'react'

import HeadComponent from '@components/common/HeadComponent'
import CreatorLayout from '@containers/creator/CreatorLayout'
import ProtocolContent from '@containers/creator/ProtocolContent'

export default class ProtocolContainer extends Component {
    render() {
        return (
            <>
                <HeadComponent 
                    title={`梅花网机构创作者认领协议-梅花网-营销作品宝库`}
                />
                <CreatorLayout>
                    <ProtocolContent />
                </CreatorLayout>
            </>
        )
    }
}