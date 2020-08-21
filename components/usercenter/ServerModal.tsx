import { Component } from 'react'
import { config } from '@utils'
import { inject, observer } from 'mobx-react'
import { Icon, Modal, Input, Upload, message } from 'antd'
import { toJS } from 'mobx'

const Dragger = Upload.Dragger 
const iconUploadImage = '/static/images/icon/icon_image.svg'
const uploadFileApi = `${config.API_MEIHUA}/zuul/sys/common/file`

function getBase64(img, callback) {
    const reader = new FileReader()
    reader.addEventListener('load', () => callback(reader.result))
    reader.readAsDataURL(img)
}

function beforeUpload(file) {
    const isJPG = file.type === 'image/jpeg'
    const isPNG = file.type === 'image/png'
    const isGIF = file.type === 'image/gif'

    if(!isJPG && !isPNG && !isGIF) {
        message.destroy()
        message.error('只能上传PNG,JPG,GIF格式')

        return
    }

    const isLt10M = file.size / 1024 / 1024 < 10

    if(!isLt10M) {
        message.destroy()
        message.error('PNG,JPG,GIF不得超过10MB!')
    }

    return isLt10M
}

@inject(stores => {
    const { userCenterStore } = stores.store
    const { serverContentInfo, updateServerContentInfo } = userCenterStore

    return {
        serverContentInfo, 
        updateServerContentInfo
    }
})
@observer
export default class ServerModal extends Component {
    state = {
        loading: false
    }

    constructor(props) {
        super(props)

        this.state = {
            value: '',
            imgSrc: '',
            visible: props.show
        }
    }

    handleOk = () => {
        const { value, imgSrc } = this.state
        const { handleServer } = this.props 

        handleServer && handleServer()
    }

    handleValue = e => {
        const { serverContentInfo, updateServerContentInfo } = this.props
        const data = {
            ...toJS(serverContentInfo),
            title: e.target.value
        }

        updateServerContentInfo(data)
    }

    handleChange = info => {
        const { serverContentInfo, updateServerContentInfo } = this.props
        if(info.file.status === 'uploading') {
            this.setState({ loading: true })

            return
        }

        if(info.file.status === 'done') {
            const data = {
                ...toJS(serverContentInfo),
                image: info.file.response.data.url 
            }

            updateServerContentInfo(data)

            getBase64(info.file.originFileObj, imageUrl => {
                this.setState({ 
                    imageUrl,
                    loading: false,
                })
            })
        }
    }

    render() {
        const { value, loading, imageUrl } = this.state
        const { 
            show, 
            title, 
            closeClick,
            serverContentInfo,
        } = this.props
        const uploadButton = (
            <div className='upload-button'>
                {/* <Icon type={this.state.loading ? 'loading' : 'plus'} /> */}
                {/* <div className='ant-upload-text'>上传图片</div> */}
                {loading ? 
                    <Icon type={`loading`} className='upload-loading' /> :
                    <div className='upload-bg-box'>
                        <img src={iconUploadImage} className='upload-img' />
                        <div className='text-description'>
                            <span className='add-img-text'>添加图片</span>
                            <span className='desc-text'>PNG,JPG,GIF不得超过10MB</span>
                        </div>
                        <span className='attention-text'>可拖拽或点击上传</span>
                    </div>}
            </div>
        )

        return (
            <Modal
                title={title}
                visible={show}
                onOk={this.handleOk}
                onCancel={closeClick}
                className={`server-modal-box`}
            >
                <div className='modal-attention'>推荐尺寸360x160(px)</div>
                <Upload
                    name='avatar'
                    listType='picture-card'
                    className='avatar-uploader'
                    showUploadList={false}
                    action={uploadFileApi}
                    beforeUpload={beforeUpload}
                    onChange={this.handleChange}
                >
                    {serverContentInfo.image ? <img className='server-img' src={serverContentInfo.image} /> : uploadButton}
                </Upload>
                <div className='modal-title'>服务客户名称</div>
                <Input value={serverContentInfo.title} onChange={this.handleValue} />
            </Modal>
        )
    }
}