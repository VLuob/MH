import { Row, Col } from 'antd'
import LazyLoad from '@static/js/LazyLoad'
import { toJS } from 'mobx'

import { CompositionTypes } from '@base/enums'

const emptyImage = '/static/images/common/full-empty.png'

// const IntroImgBoxComp = ({ item }) => {
//     const arr = item.compositionList.length === 1 ? [...item.compositionList, {}] : 
//         item.compositionList.length === 0 ? [{}, {}] : item.compositionList

//     return (
//         <div className='intro-img-box'>
//             <Row type='flex' align='bottom' justify='center' gutter={16}>
//                 <Col span={12}>
//                     <div className='intro-show-img'>
//                         {arr[0] && arr[0].cover ? 
//                             <a href={`/${arr[0].type === CompositionTypes.ARTICLE ? 'article' : 'shots'}/${arr[0].id}`} target='_blank'>
//                                 {/* <img className='box-img' src={`${arr[0].cover}?imageView2/1/w/151/h/110` || emptyImage} /> */}
//                                 <LazyLoad
//                                     className='image-lazy-load'
//                                     offsetVertical={300}
//                                     loaderImage
//                                     originalSrc={`${arr[0].cover}?imageMogr2/thumbnail/!302x220r/size-limit/50k/gravity/center/crop/302x220` || emptyImage}
//                                     imageProps={{
//                                         src: emptyImage,
//                                         ref: 'image',
//                                         alt: arr[0].title,
//                                     }}
//                                 />
//                             </a> :
//                             <img className='box-img' src={emptyImage} />
//                         }
//                     </div>
//                 </Col>
//                 <Col span={12}>
//                     <div className='intro-show-img'>
//                         {arr[1] &&
//                             arr[1].cover ? 
//                                 <a href={`/${arr[1].type === CompositionTypes.ARTICLE ? 'article' : 'shots'}/${arr[1].id}`} target='_blank' className='intro-show-img'>
//                                     <LazyLoad
//                                         className='image-lazy-load'
//                                         offsetVertical={300}
//                                         loaderImage
//                                         originalSrc={`${arr[1].cover}?imageMogr2/thumbnail/!302x220r/size-limit/50k/gravity/center/crop/302x220` || emptyImage}
//                                         imageProps={{
//                                             src: emptyImage,
//                                             ref: 'image',
//                                             alt: arr[1].title,
//                                         }}
//                                     />
//                                     {/* <img className='box-img' src={`${arr[1].cover}?imageView2/1/w/151/h/110` || emptyImage} /> */}
//                                 </a> :
//                                 <img className='box-img' src={emptyImage} />
//                             }
//                             {/* <div className='box-img empty-box-img'>
//                                 <img src={emptyCompSvg} />
//                             </div> */}
//                     </div>
//                 </Col>
//             </Row>
//         </div>
//     )
// }
const IntroImgBoxComp = ({ item }) => {
    const compositionList = item.compositionList || []
    const compositionLength = compositionList.length
    const arr = []
    for (let i = 0; i < 3; i++) {
        const compositionItem = i < compositionLength ? compositionList[i] : {}
        arr.push(compositionItem)
    }

    return (
        <div className='intro-img-box'>
            {arr.map((item, index) => {
                return (
                    <div className='intro-show-img' key={index}>
                        {item.cover ? 
                            <a href={`/${item.type === CompositionTypes.ARTICLE ? 'article' : 'shots'}/${item.id}`} target='_blank'>
                                <LazyLoad
                                    className='image-lazy-load'
                                    offsetVertical={300}
                                    loaderImage
                                    originalSrc={`${item.cover}?imageMogr2/thumbnail/!302x220r/size-limit/50k/gravity/center/crop/302x220` || emptyImage}
                                    imageProps={{
                                        src: emptyImage,
                                        ref: 'image',
                                        alt: item.title,
                                    }}
                                />
                            </a> :
                            <img className='box-img' src={emptyImage} />
                        }
                    </div>
                )
            })}
        </div>
    )
}

export default IntroImgBoxComp