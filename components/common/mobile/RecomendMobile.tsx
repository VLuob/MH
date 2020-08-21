import { Row, Col, Icon, Button } from 'antd'

import emptyImage from '@static/images/common/full-empty.png'
import BriefWidget from '@components/widget/common/BriefWidget'
import { toJS } from 'mobx'

const Recommend = ({ item, children, onRecomand }) => {
    const arr = item.compositionList && item.compositionList.length === 2 ? 
        item.compositionList : item.compositionList.length === 1 ? 
        [...item.compositionList, {}] : [{}, {}]

    return (
        <div className='recommend-box'>
            <div className='inner-box'>
                <BriefWidget
                    size={40}
                    name={`${item.name}`}
                    meta={(item.provinceName && item.cityName) ? `${item.provinceName}/${item.cityName}` : ''}
                    children={children} />
                {!item.followed && <Button type='primary' className='attention not-attention' onClick={onRecomand}><Icon type='plus'/>关注</Button>}
                {!!item.followed && <Button className='attention' onClick={onRecomand}>已关注</Button>}
            </div>
            <div className='img-box'>
                <Row gutter={12}>
                    <Col span={12}>
                        {arr[0] &&
                            arr[0].cover ?
                            <a href={`/shots/${arr[0].id}`} target='_blank'>
                                <img className='box-img' src={`${arr[0].cover}?imageView2/1/w/101/h/80` || emptyImage} />
                            </a> :
                            <img className='box-img' src={arr[0].cover || emptyImage} />
                        }
                    </Col>
                    <Col span={12}>
                        {arr[1] &&
                            arr[1].cover ?
                            <a href={`/shots/${arr[1].id}`} target='_blank'>
                                <img className='box-img' src={`${arr[1].cover}?imageView2/1/w/101/h/80` || emptyImage} />
                            </a> :
                            <img className='box-img' src={arr[1].cover || emptyImage} />
                        }
                    </Col>
                </Row>
            </div>
        </div>
    )
}

export default Recommend