import { http, config } from '../utils'
import moment from 'moment'

const m1api = config.API_BIGCAT_UCENTER

export default {
    addHttp(url) {
        if (url.indexOf('//') === 0) {
            url = 'http:' + url
        } else if (['http://', 'https://'].every(v => url.indexOf(v) === -1)) {
            url = 'http://' + url
        }
        return url
    },
    /**
	 * 验证邮箱格式是否正确
	 * @param  {String}  s 邮箱地址
	 * @return {Boolean}   
	 */
    isEmail(s) {
        const reg = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/ //邮箱格式
        
        return reg.test(s)
    },
    /**
	 * 判断是否是手机号码
	 * @param  {string}  s 手机号码字符串
	 * @return {Boolean}   true 是，false 否
	 */
    isMobile(s) {
        const reg = /^1[3456789]\d{9}$/
        return reg.test(s)
    },
    /**
	 * 验证是否是域名
	 * @param  {String}   域名 不含http://
	 * @return {Boolean}   
	 */
    isDomain(s) {
        const reg = /^((ht|f)tps?):\/\/([\w-]+(\.[\w-]+)*\/?)+(\?([\w\-\.,@?^=%&:\/~\+#]*)+)?$/

        return reg.test(s)
    },
    /**
	 * 判断是否是手机号码
	 * @param  {string}  s 手机号码字符串
	 * @return {Boolean}   true 是，false 否
	 */
    isMobile(s) {
        const reg = /^1[3456789]\d{9}$/
        return reg.test(s)
    },
    /**
	 * 验证是否是密码格式 （字母和数字组合）
	 * @param  {String}  s 密码字符串
	 */
    isPassword(s) {
        const reg = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,16}$/
        return reg.test(s)
    },
    /**
	 * 获取url search参数对象
	 * @param  {string} search 
	 * @return {object}        URLSearchParams
	 */
	getSearchParams(search) {
        search = search

        if(typeof window !== 'undefined') {
            search = window.location.search
            // return new URLSearchParams(search)
        }

        return {
            get: key => {
                const reg = new RegExp('(^|&)' + key + '=([^&]*)(&|$)', 'i')
                const r = search && (search.substr(1).match(reg) || search.match(reg))

                if(r === null) {
                    return null
                } else {
                    const result = r && r.length > 0 && r[2]

                    return result
                }
            }
        }
	},
    /**
	 * 获取Url参数
	 * @param  {String} key 
	 */
    getUrlParam(key) {
        // return new URLSearchParams(window.location.search).get(key)
        return this.getSearchParams().get(key)
    },
    /**
     * 获取Url参数
     */
    GetRequest(search) {
        const url = search || location.search  //获取url中"?"符后的字串 
        let theRequest = new Object() 
        const urls = url.split("?")[1]

        if(urls != -1) {
            let strs = urls ? urls.split("&") : []

            for (var i = 0; i < strs.length; i++) {
                theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]) 
            }
        }
        return theRequest 
    },
    /**
	 * url重定向
	 * @param  {string} url 
	 */
    redirectTo(url) {
        if(typeof window !== 'undefined') {
            window.location.href = url
        }
    },
    /**
     * 获取字符串实际长度
     */
    getStringLength(str) {
        return str.replace(/[\u0391-\uFFE5]/g,'aa').length
    },
    /**
 	 * 加载js脚本，并加载完成后执行，返回promise
 	 * @param  {String or Array} args url 字符串或者数组
 	 * @return {Promise}
 	 */
    loadScript(args) {
        const loadOneScript = (url) => {
            return new Promise((resolve, reject) => {
                if(typeof document !== 'undefined') {
                    const script = document.createElement('script')
                    script.setAttribute('type', 'text/javascript')
                    script.setAttribute('async', 'async')
                    script.setAttribute('src', url)
                    document.head.appendChild(script)

                    if(script.readyState) {
                        script.onreadystatechange = function () {
                            if(script.readyState === 'loaded' || script.readyState === 'complete') {
                                resolve()
                            }
                        }
                    } else {
                        script.onload = function () {
                            resolve()
                        }
                    }
                }
            })
        }

        const urls = args instanceof Array ? args : [args]
        const calls = urls.map(u => loadOneScript(u))

        return Promise.all(calls)
    },
    /**
     * 查找父级元素
     */
    findNode(node, type, name) {
        let nodes = node

        // while(nodes[type] !== name) {
        //     if (nodes === document) {
        //         return null
        //     }

        //     nodes = nodes[`parentNode`]
        // }

        while(typeof nodes === 'string' && nodes[type] !== name) {
            if(typeof document !== 'undefined') {
                if(nodes === document) {
                    return null
                }
    
                nodes = nodes[`parentNode`]
            }
        }

        return nodes
    },
    getAge(sTime) {
        // //出生时间 毫秒
        // const birthDayTime = new Date(birthday).getTime()
        // //当前时间 毫秒
        // const nowTime = new Date().getTime()
        // //一年毫秒数(365 * 86400000 = 31536000000)
        // const sum = (nowTime - birthDayTime) / 31536000000

        // console.log(sum)
        // return sum
        const startDate = moment(sTime)
        const endDate = moment()
        const diffYear = endDate.diff(startDate, 'year')
        let netAge = ''

        if(diffYear < 1) {
            if(endDate.diff(startDate, 'month') > 0) {
                const diffMonth = endDate.diff(startDate, 'month')
                netAge += `${diffMonth}个月`
            } else {
                const diffDay = endDate.diff(startDate, 'day')
                netAge += `${diffDay + 1}天`
            }
        } else {
            netAge += `${diffYear}年`
        }
 
        return netAge
    },
    timeago(dateTimeStamp) {   //dateTimeStamp是一个时间毫秒，注意时间戳是秒的形式，在这个毫秒的基础上除以1000，就是十位数的时间戳。13位数的都是时间毫秒。
        let result = '未知时间'
        const minute = 1000 * 60 
        const hour = minute * 60 
        const day = hour * 24 
        const halfamonth = day * 15 
        const month = day * 30 
        const now = new Date().getTime() 
        const diffValue = now - dateTimeStamp 
        if(diffValue < 0) { return  }
        const monthC = diffValue / month 
        const weekC = diffValue / (7 * day) 
        const dayC = diffValue / day 
        const hourC = diffValue / hour 
        const minC = diffValue / minute 

        if(dayC > 3) {
            result = moment(dateTimeStamp).format('YYYY-MM-DD') 
        } else if(dayC <= 3) {
            result = '' + parseInt(dayC) + '天前' 
            if(dayC < 1) {
                if(hourC >= 1) {
                    result = '' + parseInt(hourC) + '小时前' 
                } else if(minC >= 1) {
                    result = '' + parseInt(minC) + '分钟前' 
                } else if(minC < 1){
                    result = '' + '刚刚' 
                }
            }
        } 

        return result 
    },
    formatViews: (view) => {
        let label = ''
        if (view >= 10000) {
          label = `${Math.floor(view/10000)}万`
        } else {
          label = view || 0
        }
        return label
    },
    debounce (func, wait) {
      let lastTime = null
      let timeout
      return function () {
        let context = this
        let now = +new Date()
        // 判定不是一次抖动
        if(now - lastTime - wait > 0) {
          setTimeout(() => {
            func.apply(context, arguments)
          }, wait)
        } else {
          if(timeout) {
            clearTimeout(timeout)
            timeout = null
          }
          timeout = setTimeout(() => {
            func.apply(context, arguments)
          }, wait)
        }
        // 注意这里lastTime是上次的触发时间
        lastTime = now
      }
    },
    throttle(delay, fun) {
        let last, deferTimer

        return function (args) {
            let that = this
            let _args = arguments
            let now = +new Date()

            if(last && now < last + delay) {
                clearTimeout(deferTimer)

                deferTimer = setTimeout(() => {
                    last = now
                    fun.apply(that, _args)
                }, delay)
            }/*  else {
                last = now
                fun.apply(that, _args)
            } */
        }
    },
    braftEditorUploadFn: (param) => {
        const serverURL = `${config.API_MEIHUA}/zuul/sys/common/file`
        const xhr = new XMLHttpRequest
        const fd = new FormData()
      
        const successFn = (response) => {
          // 假设服务端直接返回文件上传后的地址
          // 上传成功后调用param.success并传入上传后的文件地址
      
          const result = xhr.responseText ? JSON.parse(xhr.responseText) : {data: {url: ''}}
          param.success({
            url: result.data.url,
            meta: {
              id: 'xxx',
              title: 'xxx',
              alt: 'xxx',
              // loop: true, // 指定音视频是否循环播放
              // autoPlay: true, // 指定音视频是否自动播放
              // controls: true, // 指定音视频是否显示控制栏
              // poster: 'http://xxx/xx.png', // 指定视频播放器的封面
            }
          })
        }
      
        const progressFn = (event) => {
          // 上传进度发生变化时调用param.progress
          param.progress(event.loaded / event.total * 100)
        }
      
        const errorFn = (response) => {
          // 上传发生错误时调用param.error
          param.error({
            msg: 'unable to upload.'
          })
        }
      
        xhr.upload.addEventListener("progress", progressFn, false)
        xhr.addEventListener("load", successFn, false)
        xhr.addEventListener("error", errorFn, false)
        xhr.addEventListener("abort", errorFn, false)
      
        fd.append('file', param.file)
        xhr.open('POST', serverURL, true)
        xhr.send(fd)
      
    },

    downloadFile: (url) => {   
        try{ 
            var elemIF = document.createElement("iframe")    
            elemIF.src = url    
            elemIF.style.display = "none"    
            document.body.appendChild(elemIF)    
        }catch(e){ 
 
        } 
    },

    down: (url, name) => {  
        // 生成一个a元素
        var a = document.createElement('a')
        // 将a的download属性设置为我们想要下载的图片名称
        a.download = name || 'img'
        // 将生成的URL设置为a.href属性
        a.href = url
        a.target = '_blank'
        // 触发a的单击事件
        a.click() 
    },

    bytesToSize: (bytes) => {
        if (bytes === 0) return '0 B' 
        var k = 1000, // or 1024
            sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
            i = Math.floor(Math.log(bytes) / Math.log(k)) 
     
       return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i] 
    },

    /**
     * 获取字符串字母化长度，汉字算两个
     * @param str 
     */
    getStringLen(str){
        let i, len, code
        if(str == null || str == '') {
            return 0 
        }
        len = str.length 
        for(i = 0; i < str.length; i++) {
            code = str.charCodeAt(i) 
            if(code > 255) { 
                len++  
            }
        }
        return len 
    },

    /**
     * 截取字符串前n个字，汉字算两个
     * @param str 
     * @param length 
     */
    getSubstr(str, length = 20) {
        let rel="";
        let len = 0
        if (!str)  return ''

        for (let i = 0;i < str.length; i++) {  
            if(str.charCodeAt(i) > 256){  
                len   +=   2;  
            } else {  
                len++;  
            }
            if(len > length){
                rel = str.substring(0,i)+"…";
                break;
            }else {
                rel = str;
            }
        }
        return rel;
    },

    getQueryString(name) { 
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i")  
        var r = window.location.search.substr(1).match(reg)  
        if (r != null) return unescape(r[2])  
        return null  
    },
    
    replaceImageSrcWithOriginal(html) {
        const reg = /<img([^>]+?)src=[\'"]?([^\'"\s>]+)[\'"]?([^>]*)>/g
        const replaceStr = '<img$1src="data:image/gif;base64,R0lGODdhAQABAPAAAMPDwwAAACwAAAAAAQABAAACAkQBADs=" data-src="$2"$3>'
        const content = html.replace(reg,replaceStr)
        return content
    },
    /**
 	 * 判断浏览器的UserAgent
 	 * @param  {String or Array} args url 字符串或者数组
 	 * @return {Promise}
 	 */
    /*设备是否为Android*/
    userAgent() {
        return {
            isAndroid: function (u) {
                return u.indexOf("Android") > -1 || u.indexOf("Ard") > -1
            },
            /*设备是否为iPhone*/
            isiPhone: function (u) {
                return u.indexOf("iPhone") > -1
            },
            /*设备是否为iPad*/
            isiPad: function (u) {
                return u.indexOf("iPad") > -1
            },
            /*设备是否为iOS终端*/
            isiOS: function (u) {
                return !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)
            },
            /*设备是否为移动端*/
            isMobileEnd: function (u) {
                return !!u.match(/AppleWebkit.*Mobile.*/)
            },
            /*是否为web应用程序*/
            isWebApp: function (u) {
                // return u.indexOf("Safari") > -1
                return /Safari/i.test(u)
            },
            /*是否为微信*/
            isWx: function (u) {
                // return u.indexOf("MicroMessenger") > -1
                return /MicroMessenger/i.test(u)
            },
            /*是否为QQ*/
            isQQ: function (u) {
                return !!u.match(/\sQQ/i)
            },
            /*IE内核*/
            isIE: function (u) {
                // return u.indexOf("Trident") > -1
                return /Trident/i.test(u)
            },
            /*Opera内核*/
            isOpera: function (u) {
                // return u.indexOf("Presto") > -1
                return /Presto/i.test(u)
            },
            /*苹果、谷歌内核*/
            isWebkit: function (u) {
                // return u.indexOf("AppleWebKit") > -1
                return /AppleWebKit/i.test(u)
            },
            /*火狐内核*/
            isFirefox: function (u) {
                // return u.indexOf("Geoko")
                return /Geoko/i.test(u)
            }
        }
    },
    imageFormat(image) {
        if((`${image}?imageInfo`).format === 'git') {
            return image
        } else {
            return `${image}?imageMogr2/format/jpeg/size-limit/80k`
        }
    },

     /** 
     * 获取滚动条距离顶端的距离 
     * @return {}支持IE6 
     */  
    getScrollTop() {  
        var scrollPos;  
        if (window.pageYOffset) {  
            scrollPos = window.pageYOffset; 
        } else if (document.compatMode && document.compatMode != 'BackCompat') { 
            scrollPos = document.documentElement.scrollTop; 
        } else if (document.body) { 
            scrollPos = document.body.scrollTop; 
        }   
        return scrollPos;   
    }, 
    
    /**
     * 格式化地区
     * @param provinceName 
     * @param cityName 
     */
    formatArea(provinceName, cityName) {
        return [provinceName, cityName].filter(s => s && s.trim()).join('/')
    },

    /**
     * 检测客户端浏览器cookie是否可用
     */
    cookieEnable()   {   
        let result = false;   
        if(navigator.cookiesEnabled)  return true;   
        document.cookie = 'testcookie=yes;';   
        let cookieSet = document.cookie;   
        if (cookieSet.indexOf("testcookie=yes") > -1)  result=true;   
        document.cookie = '';
        return result;   
    },

    /**
     * 判断宽高是否符合4k视频大小
     * @param width 
     * @param height 
     */
    is4K(width,height) {
        const isHorizontal = width >= height
        const is4K = (isHorizontal && (width >= 3840 || height >= 2160) || !isHorizontal && (width >= 2160 || height >= 3840))
        return is4K
    },

    /**
     * 视频时长格式化
     * @param duration 
     */
    formatDuration(duration) {
        const hours = Math.floor(duration / (60 * 60))
        const minuteLevel = duration % (60 * 60)
        const minutes = Math.floor(minuteLevel / 60)
        const secondLevel = minuteLevel % 60
        const seconds = Math.floor(secondLevel)
        let durationFormat = ''
        if (hours > 0) {
          durationFormat += hours < 10 ? `0${hours}:` : hours
        } 
        durationFormat += minutes < 10 ? `0${minutes}:` : minutes
        durationFormat += seconds < 10 ? `0${seconds}` : seconds
        return durationFormat
    },
    /**
     * 计算作品文件信息
     * @param record 
     */
    computeFileInfo(record) {
        const isVideoType = (record.fileTypes || []).includes('video')
        const resolution = JSON.parse(record.resolution || '{}')
        const duration = resolution.duration || 0
        const width = resolution.width || 0
        const height = resolution.height || 0
        const isHorizontal = width >= height
        const is4K = this.is4K(width, height)
        const durationFormat = this.formatDuration(duration)
        return {isVideoType, isHorizontal, is4K, width, height, duration, durationFormat}
    },
}