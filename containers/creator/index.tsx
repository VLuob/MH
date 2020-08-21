import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import TitleHeader from '@containers/creator/TitleHeader'
import SelectCreatorType from '@containers/creator/SelectBox'
import MbNavigatorBar from '@containers/common/MbNavigatorBar'

@inject(stores => {
    const { globalStore } = stores.store
    const { isMobileScreen } = globalStore
    return {
        isMobileScreen
    }
})
@observer
export default class CreatorSelect extends Component {
    render() {
        const { isMobileScreen } = this.props
        
        return (
            <>
                {isMobileScreen && <MbNavigatorBar
                    showTitle
                    title="创建创作者"
                />}
                {!isMobileScreen && <TitleHeader name='创建创作者'/>}
                <SelectCreatorType />
            </>
        )
    }
}