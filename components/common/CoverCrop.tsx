import React, { Component } from 'react';
import 'cropperjs/dist/cropper.css';
import Cropper from 'react-cropper';
import lrz from 'lrz';
import {Modal, Button, Icon} from 'antd';

/* global FileReader */

export default class CoverCrop extends Component {
  constructor(props) {
    super(props);
    this.state = {
      src: props.url,
      cropResult: null,
      isLrzing: false, // 图片裁剪压缩中
    };
    this.cropImage = this.cropImage.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  onChange(e) {
    e.preventDefault();
    let files;
    if (e.dataTransfer) {
      files = e.dataTransfer.files;
    } else if (e.target) {
      files = e.target.files;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.setState({ src: reader.result });
    };
    reader.readAsDataURL(files[0]);
  }

  cropImage() {
    if (typeof this.cropper.getCroppedCanvas() === 'undefined') {
      return;
    }
    this.setState({
      cropResult: this.cropper.getCroppedCanvas().toDataURL(),
    });
  }


  handleConfirm = () => {
    this.setState({isLrzing: true})
    const croppedCanvas = this.cropper.getCroppedCanvas()
    if (typeof croppedCanvas === 'undefined') {
      this.setState({isLrzing: false})
      return;
    }
    const { onConfirm, maxWidth, quality } = this.props;
    const cropResult = croppedCanvas.toDataURL();
    lrz(cropResult, {width: maxWidth || 504, quality: quality || 1}).then(lrzResult => {
      if (onConfirm) {
        onConfirm(lrzResult.base64)
      }
    }).catch(err => {

    }).always(() => {
      this.setState({isLrzing: false})
    })
    // if (onConfirm) {
    //   onConfirm(cropResult)
    // }
  }

  handleZoomIn = () => {
    this.cropper.zoom(0.1)
  }
  
  handleZoomOut = () => {
    this.cropper.zoom(-0.1)

  }

  handleRotate = () => {
    this.cropper.rotate(90)
  }
  

  render() {
    const { visible, loading, onCancel, width, height, title, modalWidth, viewHeight } = this.props;
    const { isLrzing } = this.state
    const w = width || 504
    const h = height || 360
    return (
      <Modal
        width={modalWidth || 376}
        loading={loading}
        visible={visible}
        maskClosable={false}
        onCancel={onCancel}
        footer={null}
      >
        <div className="cover-cropper">
          <div className="header">{title || '裁剪封面'}</div>
          <div className="cropper-view" style={{ width: '100%' }}>
            <Cropper
              style={{ height: viewHeight || 200, width: '100%' }}
              aspectRatio={w / h}
              preview=".img-preview"
              guides={true}
              cropBoxResizable={false}
              autoCropArea={1}
              viewMode={2}
              src={this.state.src}
              ref={cropper => {
                this.cropper = cropper;
              }}
            />
          </div>
          {/* <div>
            <div className="box" style={{ width: '50%', float: 'right' }}>
              <h1>Preview</h1>
              <div className="img-preview" style={{ width: '100%', float: 'left', height: 300 }} />
            </div>
            <div className="box" style={{ width: '50%', float: 'right' }}>
              <h1>
                <span>Crop</span>
                <button onClick={this.cropImage} style={{ float: 'right' }}>
                  Crop Image
                </button>
              </h1>
              <img style={{ width: '100%' }} src={this.state.cropResult} alt="cropped image" />
            </div>
          </div> */}
          {/* <br style={{ clear: 'both' }} /> */}
          <div className="cropper-actions">
            <div className="actions">
              <Icon type="zoom-in" onClick={this.handleZoomIn} />
              <Icon type="zoom-out" onClick={this.handleZoomOut} />
              <Icon type="redo" onClick={this.handleRotate} />
            </div>
            <span className="file-select">
              <input type="file" onChange={this.onChange} />
              <span className="text">重新上传</span>
            </span>
            {isLrzing && <span className="file-lrzing-text">图片裁剪压缩中...</span>}
          </div>
          
          <div className="footer">
            <Button onClick={onCancel} >取消</Button>
            <Button type="primary" className="themes" onClick={this.handleConfirm} loading={loading || isLrzing} >确认</Button>
          </div>
        </div>
      </Modal>
    );
  }
}
