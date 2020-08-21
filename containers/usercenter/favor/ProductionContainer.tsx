import { Component } from 'react'
import jsCookie from 'js-cookie'
import { Row, Col, Icon, Menu } from 'antd'
import { inject, observer } from 'mobx-react'
import { CompositionType } from '@base/enums'
import LoadMore from '@components/common/LoadMore'
import { toJS } from 'mobx'
import { config } from '@utils'

import CommonIntro from '@components/common/CommonIntro'
import DetailHeader from '@components/author/DetailHeader'
import PartLoading from '@components/features/PartLoading'
import EmptyComponent from '@components/common/EmptyComponent'

let num = 3
@inject(stores => {
    const { userCenterStore } = stores.store 
    const { 
        fetchGetSettingFavor, 
        compositionFavorData, 
        compositionFavorParam, 
        fetchFavorActionFavor, 
    } = userCenterStore

    return {
        compositionFavorData,
        compositionFavorParam,
        fetchGetSettingFavor,
        fetchFavorActionFavor,
    }
})
@observer
export default class ProductionContainer extends Component {
    async componentDidMount() {
        // const { query, compositionFavorParam } = this.props
        // const { menu, tab, type } = query
    }

    reqSettingFavorList = () => {
        const { compositionFavorParam, fetchGetSettingFavor } = this.props

        fetchGetSettingFavor({ type: CompositionType.COMPOSITION, ...compositionFavorParam, page: compositionFavorParam.page })
    }

    handleRemoveShotsFavor = (e, item) => {
        const { fetchFavorActionFavor } = this.props

        switch(Number(e.key)) {
            case 0:
                const client_code = jsCookie.get(config.COOKIE_MEIHUA_CLIENT_CODE)

                fetchFavorActionFavor({ action: 0, id: item.id, client_code })

                break
        }
    }

    removeMenu = item => {
        return (
            <Menu onClick={e => this.handleRemoveShotsFavor(e, item)}>
                <Menu.Item key='0'>取消喜欢</Menu.Item>
            </Menu>
        )
    }

    handleSearch = key => {
        const { fetchGetSettingFavor, compositionFavorParam } = this.props

        fetchGetSettingFavor({ type: CompositionType.COMPOSITION, ...compositionFavorParam, page: 1, key })
    }

    render() {
        const { value, onFavorChange, compositionFavorData, fetchFavorActionFavor } = this.props
        const { state, isLastPage } = compositionFavorData

        return (
            <div className='prod-container'>
                <DetailHeader 
                    value={value}
                    placeholder={`搜索`}
                    onChange={onFavorChange}
                    searchFn={this.handleSearch}
                    type={CompositionType.COMPOSITION}
                    meta={`共喜欢了${compositionFavorData.count || 0}组作品`}
                />
                {!!state ? <div className='prod-box'>
                    {compositionFavorData.list && compositionFavorData.list.length > 0 ? <Row type='flex' align='middle' justify='start' gutter={28}>
                        {compositionFavorData.list.map((item, index) => {
                            return (
                                <Col key={index}>
                                    <CommonIntro 
                                        brand
                                        times
                                        item={item} 
                                        authorDetail={true} 
                                        onFavor={fetchFavorActionFavor}
                                        removeMenu={e => this.removeMenu(item)}
                                        onRemoveShotsFavor={this.handleRemoveShotsFavor}
                                    />
                                </Col>
                            )
                        })}
                    </Row> : <EmptyComponent text='暂未喜欢任何作品' />}
                    {!isLastPage && <LoadMore name={`加载更多`} num={num}
                        reqList={this.reqSettingFavorList} />}
                </div> : <PartLoading />}
            </div>
        )
    }
}