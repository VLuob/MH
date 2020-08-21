import React, { Component, useEffect } from 'react'
import { accountApi } from '@api'


class RenderGeetestBind extends Component {

  _captchaObj = null

  componentDidMount() {
    this._init()
  }

  _init = () => {
    if (window.initGeetest) {
      return this.handleInit()
    }
  
    const ds = document.createElement('script') 
    ds.type = 'text/javascript' 
    ds.async = true 
    ds.charset = 'utf-8' 
    if (ds.readyState) {
      ds.onreadystatechange = () => {
        if (ds.readyState === 'loaded' || ds.readyState === 'complete') {
          ds.onreadystatechange = null 
          this.handleInit()
        }
      } 
    } else {
      ds.onload = () => {
        ds.onload = null 
        this.handleInit()
      } 
    }
    ds.src = `${document.location.protocol}//static.geetest.com/static/tools/gt.js?_t=${(new Date()).getTime()}` 
    // ds.src = `${document.location.protocol}//www.m1world.com/register/gt.js?_t=${(new Date()).getTime()}` 
    const s = document.getElementsByTagName('script')[0] 
    s.parentNode.insertBefore(ds, s) 
  }

  handleInit = async () => {
    const data = await accountApi.getGTVerifyCode()
    // console.log('res', typeof initGeetest)
    // 调用 initGeetest 进行初始化
    // 参数1：配置参数
    // 参数2：回调，回调的第一个参数验证码对象，之后可以使用它调用相应的接口
    window.initGeetest({
      // 以下 4 个配置参数为必须，不能缺少
      gt: data.gt,
      challenge: data.challenge,
      offline: !data.success, // 表示用户后台检测极验服务器是否宕机
      new_captcha: data.new_captcha, // 用于宕机时表示是新验证码的宕机

      product: "bind", // 产品形式，包括：float，popup
      width: "300px",
      https: true

      // 更多配置参数说明请参见：http://docs.geetest.com/install/client/web-front/
    }, this.handlerGeetestCallback);
  }

  handlerGeetestCallback = (captchaObj) => {
    const { onSuccess } = this.props
    captchaObj.onReady(function () {
      // $("#wait").hide();
    }).onSuccess(function () {
      var result = captchaObj.getValidate();
      if (!result) {
        return alert('请完成验证');
      }
      if (onSuccess) {
        onSuccess(result)
      }
    });
    // captchaObj.verify();
    this._captchaObj = captchaObj
  }

  handleClick = () => {
    this._captchaObj.verify()
  }

  render () {
    const { render } = this.props
  
    return render({ bindGt: this.handleClick })
  }
} 

export default RenderGeetestBind