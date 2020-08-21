import * as qiniu from 'qiniu-js'

export default {
  qiniuUpload: ({file, key, token, putExtra, config, next, error, complete}) => {
    const currKey = key || null
    const currPutExtra = {
      fname: file.name,
      params: {},
      mimeType: null,
      ...putExtra,
    }
    const currConfig = {
      useCdnDomain: true,
      region: qiniu.region.z0,
      ...config,
    }
    const qnObservble = qiniu.upload(file, currKey, token, currPutExtra, currConfig);
    qnObservble.subscribe({
      next: next ? next : (res) => { console.log('process', res) },
      error: error ? error : (err) => { console.log('error', err) },
      complete: complete ? complete : (res) => { console.log('complete', res) },
    });
  },

  /**
   * 七牛上传base64格式图片
   */
  qiniuPutb64: ({base64, domain, token}) => {
    const subIndex = base64.indexOf('base64,') + 7;
    const subBase64 = subIndex >= 7 ? base64.substring(subIndex) : base64;
    var pic = subBase64;
    // var url = domain || "http://upload.qiniup.com/putb64/20264"; //非华东空间需要根据注意事项 1 修改上传域名
    var url = domain || "https://upload.qiniup.com/putb64/-1"; //非华东空间需要根据注意事项 1 修改上传域名
    return new Promise((resolve, reject) => {
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange=function(){
        if (xhr.readyState !== 4){
          return;
        } 
        if (xhr.status === 200) {
          const json = JSON.parse(xhr.responseText)
          resolve(json);
        } else {
          // console.log(xhr.statusText)
          reject(new Error(xhr.statusText));
        }
      }
      xhr.onerror = function() {
        reject(new Error(xhr.statusText));
      }
      xhr.open("POST", url, true);
      xhr.setRequestHeader("Content-Type", "application/octet-stream");
      xhr.setRequestHeader("Authorization", `UpToken ${token}`);
      xhr.send(pic);
    })
  },

}