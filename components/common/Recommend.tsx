import { Row, Col, Icon, Button } from 'antd'
import LazyLoad from '@static/js/LazyLoad'
import ReactTooltip from 'react-tooltip'
import { toJS } from 'mobx'

import emptyImage from '@static/images/common/full-empty.png'
import ActiveBriefWidget from '@components/widget/common/ActiveBriefWidget'

const Recommend = ({ item, onRecomand }) => {
    const arr = item.compositionList.length === 3 ? item.compositionList :
        item.compositionList.length === 2 ? [...item.compositionList, {}] : item.compositionList.length === 1 ? 
        [...item.compositionList, {}, {}] : [{}, {}, {}]

    return (
        <div className='recommend-box'>
            <div className='inner-box'>
                <ActiveBriefWidget 
                    area 
                    size={40} 
                    item={item} 
                    link={`/author/${item.code}`}
                    name={item.nickname} 
                    avatarSrc={item.avatar}
                />
                {!item.followed && <Button type='primary' shape='round' className='attention' onClick={onRecomand}><Icon type='plus' />关注</Button>}
                {!!item.followed && <Button type='default' shape='round' className='attention completed' onClick={onRecomand}>已关注</Button>}
            </div>
            <div className='img-box'>
                <Row gutter={24}>
                    <Col span={8}>
                        {arr[0] && 
                            arr[0].cover ? 
                            <a href={`/shots/${arr[0].id}`} target='_blank'>
                                <LazyLoad
                                    className='image-lazy-load'
                                    offsetVertical={300}
                                    loaderImage
                                    originalSrc={`${arr[0].cover}?imageView2/1/w/101/h/80` || emptyImage}
                                    imageProps={{
                                        src: emptyImage,
                                        ref: 'image',
                                    }}
                                />
                            </a> :
                            <img className='box-img' src={arr[0].cover || emptyImage} />
                        }
                    </Col>
                    <Col span={8}>
                        {arr[1] &&
                            arr[1].cover ?
                            <a href={`/shots/${arr[1].id}`} target='_blank'>
                                <LazyLoad
                                    className='image-lazy-load'
                                    offsetVertical={300}
                                    loaderImage
                                    originalSrc={`${arr[1].cover}?imageView2/1/w/101/h/80` || emptyImage}
                                    imageProps={{
                                        src: emptyImage,
                                        ref: 'image',
                                    }}
                                />
                            </a> :
                            <img className='box-img' src={arr[1].cover || emptyImage} />
                        }
                    </Col>
                    <Col span={8}>
                        {arr[2] &&
                            arr[2].cover ? 
                            <a href={`/shots/${arr[2].id}`} target='_blank'>
                                <LazyLoad
                                    className='image-lazy-load'
                                    offsetVertical={300}
                                    loaderImage
                                    originalSrc={`${arr[2].cover}?imageView2/1/w/101/h/80` || emptyImage}
                                    imageProps={{
                                        src: emptyImage,
                                        ref: 'image',
                                    }}
                                />
                            </a> :
                            <img className='box-img' src={arr[2].cover || emptyImage} />
                        }
                    </Col>
                </Row>
            </div>
            <div className='detail-box'>
                {/* <span className='brief'>作品 <strong className='sum'>{item.compositionCount}</strong> | 文章 <strong className='sum'>{item.articleCount}</strong> | 粉丝 <strong className='sum'>{item.fans}</strong></span> */}
                <span className='brief'>
                    <a href={`/author/${item.code}/shots`} data-for={`box-user-data`} data-tip={`作品: ${item.compositionCount || 0}`}>作品 <strong>{item.compositionCount || 0}</strong></a> | <a href={`/author/${item.code}/article`} data-for={`box-user-data`} data-tip={`文章: ${item.articleCount || 0}`}>文章 <strong>{item.articleCount || 0}</strong></a> | <a href={`/author/${item.code}/followers`} data-for={`box-user-data`} data-tip={`粉丝: ${item.fans || 0}`}>粉丝 <strong>{item.fans || 0}</strong></a>
                </span>
                <ReactTooltip id={`box-user-data`} effect='solid' place='top' />
            </div>
        </div>
    )
}

export default Recommend