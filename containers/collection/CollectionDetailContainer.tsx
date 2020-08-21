import { Component } from 'react'
import classnames from 'classnames'
import EmptyComponent from '@components/common/EmptyComponent'
import HeaderContainer from './HeaderContainer'
import CollectionCompositions from './CollectionCompositions'

import './detail.less'

interface Props {
    
}
interface State {
    
}

export default class CollectionDetailContainer extends Component<Props, State> {
    render() {
        const { query } = this.props
        
        return (
            <div className="collection-detail">
                <HeaderContainer />
                <div className='collection-detail-container'>
                    <CollectionCompositions query={query} />
                </div>
            </div>
        )
    }
}