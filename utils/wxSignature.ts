import qs from 'qs'
import * as config from './config'

export class WxSignature {
  constructor() {
    this.debug = false;		// 是否开启调试模式（支持微信默认调试）
    this.url = '';			// 要分享的页面url地址
    this.title = '';		// 标题
    this.describe = '';		// 描述
    this.cover = '';		// 封面图像
    this.api = '';			// 请求API地址
  }

  init(option) {
    if(option){
			this.debug = option.debug || false;
			this.url = option.url || location.href;
			this.title = option.title || document.title;
			this.describe = option.describe || document.querySelectorAll('meta[name=description]')[0].content;
			this.cover = option.cover || '';
			this.api = option.api || config.API_MEIHUA;
		}else{
			this.url = location.href;
			this.title = document.title;
			this.describe = document.querySelectorAll('meta[name=description]')[0].content;
			this.cover = '';
			this.api = config.API_MEIHUA;
		}

		// 缩略图压缩200*200
		if(this.cover){
			this.cover = this.cover + '?imageMogr2/thumbnail/!200x200r/gravity/center/crop/200x200' 
		}
		
		var startIndex = 0;
		var endIndex = this.url.indexOf('#');
		if(endIndex > 0){
			this.url = this.url.substring(startIndex,endIndex);
		}
		this.httpWxConfigInfo(this.url);
  }


	httpWxConfigInfo = (url) => {
		var self = this;
		var httpUrl = self.api + '/composition/wx/signature';
		var param = {
			url: url
    };
    
    fetch(`${httpUrl}?${qs.stringify(param)}`)
    .then(response => response.json())
    .then(res => {
      // console.log(res)
      if(res.success){
				self.includeWxSDKHandle(res.data);
			}else{
				// console.log(res.data);
			}
    })

		// $.ajax({
		// 	url: httpUrl,
		// 	type: 'GET',
		// 	dataType: 'json',
		// 	data: param
		// })
		// .done(function(ret) {
		// 	if(ret.success){
		// 		self.includeWxSDKHandle(ret.data);
		// 	}else{
		// 		console.log(ret.data);
		// 	}
		// })
		// .fail(function() {
		// 	console.log("error");
		// })
		// .always(function() {
		// 	console.log("complete");
		// });
	}

	includeWxSDKHandle = (data) => {
		var self = this;
		self.includeJWeixin();
		if(typeof wx === 'undefined'){
			self.wxScript.onload= function(){
				self.wxSDKHandle(data);
			}
		}else{
			self.wxSDKHandle(data);
		}
	}

	wxSDKHandle = (data) => {
		var self = this;

		wx.config({
		    debug: self.debug, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
		    appId: data.appid, // 必填，公众号的唯一标识
		    timestamp: data.timestamp, // 必填，生成签名的时间戳
		    nonceStr: data.noncestr, // 必填，生成签名的随机串
		    signature: data.signature,// 必填，签名，见附录1
		    jsApiList: [
		    	'onMenuShareTimeline',	//分享到朋友圈
		    	'onMenuShareAppMessage'	//分享给好友
		    ] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
		});

		wx.ready(function(){
		    // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
		    
		    wx.checkJsApi({
		        jsApiList: [
		        	'onMenuShareTimeline',
		        	'onMenuShareAppMessage'
		        ], // 需要检测的JS接口列表，所有JS接口列表见附录2,
		        success: function(res) {
		            // 以键值对的形式返回，可用的api值true，不可用为false
		            // 如：{"checkResult":{"chooseImage":true},"errMsg":"checkJsApi:ok"}
		        }
		    });

		    self.shareHandle();
		});

		wx.error(function(res){
		    // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
		});
		
	}

	shareHandle = () => {
		var self = this;
		wx.onMenuShareTimeline({
		    title: self.title, // 分享标题
		    link: self.url, // 分享链接
		    imgUrl: self.cover, // 分享图标
		    success: function () { 
		        // 用户确认分享后执行的回调函数
		    },
		    cancel: function () { 
		        // 用户取消分享后执行的回调函数
		    }
		});

		wx.onMenuShareAppMessage({
		    title: self.title, // 分享标题
		    desc: self.describe, // 分享描述
		    link: self.url, // 分享链接
		    imgUrl: self.cover, // 分享图标
		    type: '', // 分享类型,music、video或link，不填默认为link
		    dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
		    success: function () { 
		        // 用户确认分享后执行的回调函数
		    },
		    cancel: function () { 
		        // 用户取消分享后执行的回调函数
		    }
		});
	}

	includeJWeixin = () => {
		var hasWxScript = false;
		var scripts = document.querySelectorAll('script')
		for(var i = 0; i < scripts.length; i++){
			if(scripts[i].src.indexOf('jweixin-1.2.0.js') > -1) {
				this.wxScript = scripts[i];
				hasWxScript = true;
				break;
			}
		}
		if(!hasWxScript){
			var wxScript = document.createElement('script');
			wxScript.type = 'text/javascript';
			wxScript.src = 'https://res.wx.qq.com/open/js/jweixin-1.2.0.js';
			document.head.appendChild(wxScript);
			this.wxScript = wxScript;
		}
	}
}

export default new WxSignature()