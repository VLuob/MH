export const isMobile = (req) => {
    const deviceAgent = (req.headers["user-agent"] || '').toLowerCase();
    const isMobile = deviceAgent.match(/(iphone|ipod|ipad|android)/);
    return isMobile
}

export const getIp = (req) => {
    let ip = req.headers['x-forwarded-for'] ||
        req.ip ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress || ''

    if(ip.split(',').length > 0) {
        ip = ip.split(',')[0]
    }
    return ip
}


export default {
    isMobile,
    getIp,
}