const accountList = [{
    name: 'register',
    pattern: '/signup',
    page: '/account/Register'
}, {
    name: 'login',
    pattern: '/signin',
    page: '/account/Login'
}, {
    name: 'active',
    pattern: '/active',
    page: '/account/Active'
}, {
    name: 'password',
    pattern: '/password',
    page: '/account/forgotpwd'
}, {
    name: 'forgotpwd-email-or-phone',
    pattern: '/password/:type(email_reset|phone_reset)',
    page: '/account/forgotpwd/FindPwd'
}, 
// {
//     name: 'forgotpwd-email-nextstep',
//     pattern: '/forgotpwd/findpwd/nextstep/:type/:value',
//     page: '/account/forgotpwd/NextStep'
// }, 
{
    // name: 'forgotpwd-email-setpwd',
    // pattern: '/forgotpwd/findpwd/setpwd/:type',
    // page: '/account/forgotpwd/SetPwd'
    name: 'forgotpwd-email-or-phone-setpwd',
    // pattern: '/forgotpwd/findpwd/setpwd/:type',
    pattern: '/password/open_reset',
    page: '/account/forgotpwd/SetPwd'
}, {
    name: 'oauth',
    pattern: '/oauth/:type',
    page: '/account/OAuth',
},

// {
//     name: 'user-center',
//     pattern: '/usercenter/:type/:id/:menu/:tab*',
//     page: '/account/UserCenter'
// }, 
{
    name: 'personal-default',
    pattern: '/personal',
    page: '/account/UserCenter'
}, 
// 收藏夹收藏内容
{
    name: 'personal-collections-content',
    pattern: '/personal/collections/:collectionId/:tab(shots|article)*',
    page: '/account/UserCenter'
}, {
    name: 'personal',
    pattern: '/personal/:menu/:tab*',
    page: '/account/UserCenter'
}, {
    name: 'teams-default',
    pattern: '/teams/:id',
    page: '/account/AuthorCenter'
},{
    name: 'teams',
    pattern: '/teams/:id/:menu/:tab*',
    page: '/account/AuthorCenter'
}, {
    name: 'create',
    pattern: '/creator',
    page: '/creator'
}, {
    name: 'creator',
    pattern: '/creator/:type/:modify*',
    page: '/creator/creator'
}, {
    name: 'creatorReview',
    pattern: '/review/:type*/:id',
    page: '/creator/review'
}, {
    name: 'creatorClaim',
    pattern: '/claim',
    page: '/creator/claim'
}, {
    name: 'creatorClaimProtocol',
    pattern: '/claim/protocol',
    page: '/creator/protocol'
}]

module.exports = accountList