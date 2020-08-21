import { Fragment } from 'react'
import { Row, Col, Menu, message } from 'antd'
import IntroComp from './IntroComp'
import { FocusType, AuthorType } from '@base/enums'
import IntroImgBoxComp from './IntroImgBoxComp'
import jsCookie from 'js-cookie'
import { toJS } from 'mobx'
import { config } from '@utils'

const AuthorList = ({ data, onRoute, fetchFollow, onEnquiry, isMobileScreen }) => {
    const onClicks = (item) => {
        const { id, type } = item
        const client_code = jsCookie.get(config.COOKIE_MEIHUA_CLIENT_CODE)

        fetchFollow && fetchFollow({ id, client_code, type: FocusType.AUTHOR, action: Number(!item.followed) })
    }

    const menu = (item, followed) => {
        const hideEnquiry = [AuthorType.BRANDER, AuthorType.EDITOR].includes(item.type)
        return (
            hideEnquiry ?<Menu onClick={e => onClicks(item)} theme='light'>
                {!followed && <Menu.Item key='0'>关注</Menu.Item>}
                {followed && <Menu.Item key='0'>已关注</Menu.Item>}
            </Menu>
            : <Menu onClick={e => onEnquiry(item)} theme='light'>
                <Menu.Item key='0'>询价</Menu.Item>
            </Menu>
        )
    }

    const list = (data && data.list) || []

    return (
        <div className="author-list">
            {list.map((item, index) => {
                // const hasComposition = item.compositionList.length > 0
                const isCompositionSmall = item.compositionList.length < 3
                const hideIntroImgs = isMobileScreen && isCompositionSmall
                return (
                    <div key={index} className='author-list-col'>
                        <div key={index} className='author-list-box'>
                            <IntroComp 
                                item={item}
                                isDropdown={true}
                                onClicks={onClicks} 
                                isMobileScreen={isMobileScreen}
                                menu={menu(item, item.followed)}
                                fetchFollow={fetchFollow} 
                                onEnquiry={onEnquiry}
                            />
                            {!hideIntroImgs && <IntroImgBoxComp item={item} />}
                        </div>
                    </div>
                )
            })}
        </div>
        // <Row type='flex' gutter={30}>
        //     {list.map((item, index) => {
        //         return (
        //             <Fragment key={item.id || item.compositionId}>
        //                 {<Col key={index} className='author-list-col'>
        //                     <div className='author-list-box'>
        //                         <IntroComp 
        //                             item={item}
        //                             isDropdown={true}
        //                             onClicks={onClicks} 
        //                             isMobileScreen={isMobileScreen}
        //                             menu={menu(item, item.followed)}
        //                             isInstitution={item.type === AuthorType.INSTITUTION}
        //                             fetchFollow={fetchFollow} 
        //                         />
        //                         <IntroImgBoxComp item={item} />
        //                     </div>
        //                 </Col>}
        //             </Fragment>
        //         )
        //     })}
        // </Row>
    )
}

export default AuthorList