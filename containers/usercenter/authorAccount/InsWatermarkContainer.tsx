import { Component } from 'react'
import { FuncType } from '@base/enums'
import { Radio, Input, Button } from 'antd'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'

import { WatermarkPosition, WatermarkType } from '@base/enums'

const RadioGroup = Radio.Group

const previewImage = '/static/images/watermark/preview_image.jpg'
const previewVideo = '/static/images/watermark/preview_video.jpg'
const style1 = '/static/images/watermark/style1.svg'
const style2 = '/static/images/watermark/style2.svg'
const style3 = '/static/images/watermark/style3.svg'

const watermarkMap = {
    [WatermarkType.IMAGE]: {type: WatermarkType.IMAGE, label: '图片', img: previewImage},
    [WatermarkType.VIDEO]: {type: WatermarkType.VIDEO, label: '视频', img: previewVideo},
}

const imagePositiions = [
    {location: WatermarkPosition.LEFT, label: '底部居左', classKeys: ['bottom', 'left'] },
    {location: WatermarkPosition.CENTER, label: '底部居中', classKeys: ['bottom', 'center'] },
    {location: WatermarkPosition.RIGHT, label: '底部居右', classKeys: ['bottom', 'right'] },
]
const videoPositions = [
    {location: WatermarkPosition.LEFT, label: '顶部居左', classKeys: ['top', 'left'] },
    {location: WatermarkPosition.RIGHT, label: '顶部居右', classKeys: ['top', 'right'] },
]

const imageStyles = [
    {content: 1, label: '样式1', img: 'custom'},
    {content: 2, label: '样式2', img: style2},
    {content: 3, label: '样式3', img: style3},
]
const videoStyles = [
    {content: 1, label: '样式1', img: style3}
]


@inject(stores => {
    const { userCenterStore } = stores.store
    const { watermarkInfo, changeWatermark, fetchSetSetting } = userCenterStore

    return {
        watermarkInfo,
        changeWatermark,
        fetchSetSetting,
    }
})
@observer
export default class InsFunctionContainer extends Component {
    state = {
        createLogoImage: ''
    }

    handlePositionChange = (location, type) => {
        this.changeWaterMark({location, type})
    }
    handleContentChange = (content, type) => {
        this.changeWaterMark({content, type})
    }

    changeWaterMark(option) {
        const { watermarkInfo, changeWatermark } = this.props
        const mark = watermarkInfo.find(item => item.type === option.type) || {}
        const newMark = {
            ...mark,
            ...option,
        }
        changeWatermark(newMark)
    }

    confirmClick = () => {
        const { watermarkInfo, userInfo, fetchSetSetting } = this.props
        const org_id = userInfo.authorId
        // const { id } = query  //机构id

        fetchSetSetting({ data: JSON.stringify(watermarkInfo), type: FuncType.WATERMARK, org_id })
    }

    render() {
        const { watermarkInfo, userInfo } = this.props
        const { createLogoImage } = this.state
        const watermarks = watermarkInfo || []

        // console.log('userInfo', toJS(userInfo))

        return (
            <div className='function-setting-box'>
                {watermarks.map(mark => {
                    const markOption = watermarkMap[mark.type] || {}
                    const markPositions = mark.type === WatermarkType.IMAGE ? imagePositiions : videoPositions
                    const markStyles = mark.type === WatermarkType.IMAGE ? imageStyles : videoStyles
                    
                    const markPositionClassKey = (markPositions.find(item => item.location === mark.location) || {}).classKeys || []
                    const markStyleImg = (markStyles.find(item => item.content === mark.content) || {}).img || style1
                    
                    return (
                        <div key={mark.type} className="watermark-section">
                            <div className='title'>{markOption.label}水印设置</div>
                            <div className='preview-box'>
                                <div className="preview-view">
                                    <div className="watermark-wrapper">
                                        <img className='preview-img' src={markOption.img} alt='预览图'/>
                                        <span className={`watermark-logo ${markPositionClassKey.join(' ')}`}>
                                            {markStyleImg !== 'custom' 
                                                ? <img src={markStyleImg} />
                                                : <div className="mark-logo-box" style={{display: 'inline-block'}}>
                                                    <div className="mark-logo-wrap" style={{float: 'left', width: '50px', height: '50px', textAlign: 'center', lineHeight: '50px'}}>
                                                        <img src={style1} style={{width: '50px'}} />
                                                    </div>
                                                    <div className="mark-logo-info" style={{color: '#fff', 'marginLeft': '60px'}}>
                                                        <div className="nickname" style={{fontSize: '18px', fontWeight: 'bold', lineHeight: 1,}}>{userInfo.nickname}</div>
                                                        <div className="intro" style={{fontSize: '18px', lineHeight: 1, marginTop: '8px'}}>梅花网作品库收录</div>
                                                    </div>
                                                </div>}
                                        </span>
                                    </div>
                                    <div className="watermark-desc">预览图</div>
                                </div>
                                <div className='preview-detail'>
                                    <h6 className='subtitle'>水印位置</h6>
                                    <RadioGroup 
                                        onChange={e => this.handlePositionChange(e.target.value, mark.type)} 
                                        value={mark.location}
                                        style={{marginBottom: '50px'}}
                                    >
                                        {markPositions.map(item => {
                                            const disabled =  mark.type === 1 && mark.content === 1 && [2,3].includes(item.location)
                                            return (
                                                <Radio key={item.location} value={item.location} disabled={disabled}>{item.label}</Radio>
                                            )
                                        })}
                                    </RadioGroup>
                                    <h6 className='subtitle'>水印内容</h6>
                                    <RadioGroup 
                                        onChange={e => this.handleContentChange(e.target.value, mark.type)} 
                                        value={mark.content}
                                    >
                                        {markStyles.map(item => {
                                            const disabled =  mark.type === 1 && item.content === 1 && [2,3].includes(mark.location)
                                            return (
                                                <Radio key={item.content} value={item.content} disabled={disabled}>{item.label}</Radio>
                                            )
                                        })}
                                    </RadioGroup>
                                </div>
                            </div>
                        </div>
                    )
                })}
                <div className="btn-wrap">
                    <img src={createLogoImage} alt=""/>
                    <Button type='primary' style={{ marginTop: '50px' }} className='themes' onClick={this.confirmClick} style={{ borderRadius: '3px', border: 'none', outline: 'none' }}>确认</Button>
                </div>
            </div>
        )
    }
}