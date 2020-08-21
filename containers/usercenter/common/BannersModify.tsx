import { Component } from 'react'
import dynamic from 'next/dynamic'
import { toJS } from 'mobx'
import { observer, inject } from 'mobx-react'
import classnames from 'classnames'
import { Button, Modal, Icon, Upload, message, Tabs } from 'antd'
import { config, helper } from '@utils'
import CoverCrop from '@components/common/CoverCrop';

const iconUploadImage = '/static/images/icon/icon_image.svg'

const Dragger = Upload.Dragger
const TabPane = Tabs.TabPane

function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
}

function getImageWidthHeight(file) {
  return new Promise((resolve, reject) => {
    try {
      //读取图片数据
      const reader = new FileReader();
      reader.onload = function (e) {
        const data = e.target.result;
        //加载图片获取图片真实宽度和高度
        const image = new Image();
        image.onload = function() {
          const width = image.width;
          const height = image.height;
          resolve({width, height});
        };
        image.src= data;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      reject(error)
    }
  })
}

function beforeUpload(file) {
  const isJPG = file.type === 'image/jpeg'
  const isPNG = file.type === 'image/png'
  const isGIF = file.type === 'image/gif'

  if(!isJPG && !isPNG && !isGIF) {
      message.destroy()
      message.error('只能上传PNG,JPG,GIF格式')
      return false
  }

  const isLt10M = file.size / 1024 / 1024 < 10

  if(!isLt10M) {
      message.destroy()
      message.error('PNG,JPG,GIF不得超过10MB!')
  }
  return isLt10M
}

// function beforeUpload(file) {
//     // const isJPG = file.type === 'image/jpeg';
//     const isPic = ['image/jpeg','image/jpg','image/png','image/gif'].some(v => v === file.type.toLowerCase())
//     if (!isPic) {
//       message.error('仅支持上传 PNG,JPG,GIF 格式文件!');
//     }
//     const isLt2M = file.size / 1024 / 1024 < 10;
//     if (!isLt2M) {
//       message.error('图片不得超过10MB!');
//     }
//     return isPic && isLt2M;
//   }

@inject(stores => {
    const { userCenterStore, globalStore } = stores.store
    const { authorBanners, curClientUserInfo } = userCenterStore
    const { qiniuToken } = globalStore
    return {
        globalStore,
        qiniuToken,
        userCenterStore,
        authorBanners,
        curClientUserInfo,
    }
})
@observer
export default class BannersModify extends Component {
  state = {
    visible: false,
    tabKey: 'default',
    currentImage: '',
    bannerUploading: false,
    bannerCropperVisible: false,
    bannerUrl: '',
    tmpBannerUrl: '',
  }

  componentDidMount() {
      this.initQiniuToken()
  }

  initQiniuToken() {
    const { globalStore, qiniuToken } = this.props
    if (!qiniuToken) {
      globalStore.fetchQiniuToken()
    }
  }

  requestBanners() {
      const { userCenterStore, authorBanners } = this.props
      if (authorBanners.length === 0) {
          userCenterStore.fetchAuthorBanners()
      }
  }

  handleTabChange = (key) => {
    this.setState({tabKey: key})
  }

  handleSelectImage = (url) => {
      this.setState({currentImage: url})
  }

  handleVisible = (flag) => {
      this.setState({ visible: !!flag })
  }

  bannerChange = () => {
      this.requestBanners()
      this.handleVisible(true)
  }

  handleOk = () => {
    const { userCenterStore, curClientUserInfo } = this.props
    const { currentImage, bannerUrl, tabKey } = this.state
    const isDefault = tabKey === 'default'
    const modifyBannerUrl = isDefault ? currentImage : bannerUrl
    if (!modifyBannerUrl) {
        message.warn(`请${isDefault ? '选择' : '上传'}图片`)
        return
    }
    userCenterStore.modifyAuthorBanner({
      type: curClientUserInfo.type,
      banner: modifyBannerUrl, 
      org_id: curClientUserInfo.authorId,
    }, (res) => {
        if (res.success) {
            message.success('修改成功')
            this.handleVisible(false)
        } else {
            message.error(res.data.msg)
        }
    })
  }

  handleBannerBeforeUpload = (file) => {
    return new Promise((resolve, reject) => {
      if (!beforeUpload(file)) {
        reject()
        return false
      }

      getImageWidthHeight(file).then(imgResult => {
        if (imgResult.width < 1920 || imgResult.height < 360) {
          message.warn('图片尺寸请不要低于1920*360')
          reject()
        } else {
          resolve()
        }
      }).catch(err => {
        reject(err)
      })
    })
  }

  handleBannerChange = (info) => {
        const status = info.file.status
        
        if(status !== 'uploading') {
            // console.log(info.file, info.fileList)
        }

        if(status === 'done') {
            // getBase64(info.file.originFileObj, imageUrl => this.setState({
            //     imageUrl,
            //     loading: false,
            // }))

            const bannerUrl = info.file.response.data.url;
            this.setState({bannerUrl, loading: false});

            // message.success(`${info.file.name} 上传成功`)
        } else if (status === 'error') {
            message.destroy()
            message.error(`${info.file.name} 上传失败`)
        }
    }

  handleBannerCustomRequest = (option) => {
    const file = option.file
    getBase64(file, tmpBannerUrl => {
        this.handleBannerCropVisible(true, tmpBannerUrl);
    })
    
  }

  handleBannerCropConfirm = (base64) => {
    const { globalStore } = this.props;
    const token = globalStore.qiniuToken;
    this.setState({bannerUploading: true});
    helper.qiniuPutb64({base64, token}).then((res) => {
      const bannerUrl = `${config.RESOURCE_QINIU_DOMAIN}/${res.hash}`
      this.setState({bannerUrl, bannerCropperVisible: false, bannerUploading: false})
    }).catch((e) => {
      this.setState({bannerUploading: false});
      message.error('上传失败：', e)
    })
  }

  handleBannerCropVisible = (flag, url) => {
    this.setState({ bannerCropperVisible: !!flag, tmpBannerUrl: url || ''})
  }

  render() {
    const { authorBanners } = this.props
    const { 
        visible, 
        tabKey,
        currentImage,
        bannerCropperVisible,
        bannerUrl,
        tmpBannerUrl,
        bannerUploading,
    } = this.state

    return (
      <>
        <Button type='primary' className='banner-change' onClick={this.bannerChange}>更换背景</Button>
        <Modal
            visible={visible}
            className="banners-modify-modal"
            onCancel={e => this.handleVisible(false)}
            width={768}
            okText='确认'
            cancelText='取消'
            closeIcon={<Icon type="close" />}
            footer={
                <div style={{ textAlign: 'center' }}>
                    <Button onClick={e => this.handleVisible(false)}>取消</Button>
                    <Button onClick={this.handleOk} type='primary' className='themes' style={{ borderRadius: '3px', border: 'none', outline: 'none' }}>确定</Button>
                </div>
            }
        >
            <div className="banners-modify-container">
            <Tabs defaultActiveKey={tabKey} onChange={this.handleTabChange}>
                <TabPane tab="自定义背景" key="custom">
                    <Dragger 
                        name={'file'}
                        multiple={false}
                        onChange={this.handleBannerChange}
                        beforeUpload={this.handleBannerBeforeUpload}
                        customRequest={this.handleBannerCustomRequest}
                    >
                        
                        {bannerUrl ? <div className="banner-custom-image-view">
                            <img src={bannerUrl} alt=""/>
                        </div>
                        : <div className="banner-custom-upload">
                            <div className="upload-info">
                                <div className="upload-icon-img"><img src={iconUploadImage} alt=""/></div>
                                <div className="upload-data-warp">
                                    <div className="upload-title">添加图片</div>
                                    <div className="upload-intro">PNG,JPG,GIF不得超过10MB</div>
                                </div>
                            </div>
                            <div className="upload-desc">可拖拽或点击上传，推荐尺寸1920*360</div>
                        </div>}
                    </Dragger>
                </TabPane>
                <TabPane tab="默认背景" key="default">
                    <ul className="author-banner-list">
                        {authorBanners.map((val, index) => (
                            <li 
                                key={index} 
                                className={classnames({active: val === currentImage})}
                                onClick={e => this.handleSelectImage(val)}
                            >
                                <img src={`${val}?imageMogr2/thumbnail/!220x124r/gravity/center/crop/220x124`} />
                            </li>
                        ))}
                    </ul>
                </TabPane>
            </Tabs>
            </div>
        </Modal>
        {bannerCropperVisible &&
          <CoverCrop
            loading={bannerUploading}
            visible={bannerCropperVisible}
            url={tmpBannerUrl}
            modalWidth={600}
            viewHeight={220}
            maxWidth={1920}
            width={1920}
            height={360}
            onCancel={e => this.handleBannerCropVisible()}
            onConfirm={this.handleBannerCropConfirm}
        />}
      </>
    )
  }
}