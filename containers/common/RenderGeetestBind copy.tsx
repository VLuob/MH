import React, { useState, useEffect } from 'react'
import { accountApi } from '@api'


let _captchaObj
const RenderGeetestBind = (props) => {
  const { render, onSuccess } = props

  useEffect(() => {
    _init()
  }, [])

  const _init = () => {
    if (window.initGeetest) {
      return handleInit()
    }
  
    const ds = document.createElement('script') 
    ds.type = 'text/javascript' 
    ds.async = true 
    ds.charset = 'utf-8' 
    if (ds.readyState) {
      ds.onreadystatechange = function() {
        if (ds.readyState === 'loaded' || ds.readyState === 'complete') {
          ds.onreadystatechange = null 
          handleInit()
        }
      } 
    } else {
      ds.onload = function() {
        ds.onload = null 
        handleInit()
      } 
    }
    ds.src = `${document.location.protocol}//static.geetest.com/static/tools/gt.js?_t=${(new Date()).getTime()}` 
    // ds.src = `${document.location.protocol}//www.m1world.com/register/gt.js?_t=${(new Date()).getTime()}` 
    const s = document.getElementsByTagName('script')[0] 
    s.parentNode.insertBefore(ds, s) 
  }

  const handleInit = async () => {
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
    }, handlerGeetestCallback);
  }

  const handlerGeetestCallback = (captchaObj) => {
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
    _captchaObj = captchaObj
  }

  const handleClick = () => {
    _captchaObj.verify()
  }

  return render({ bindGt: handleClick })
}

export default RenderGeetestBind