import Document, { Head, Main, NextScript } from 'next/document'

export default class extends Document {
    render() {
        return (
            <html >
                <Head>
                    <link rel='icon' href='/static/images/icon/meihua.ico' />
                    {/* <link rel='stylesheet' href='//at.alicdn.com/t/font_1233346_slkit4q3zr.css' /> */}
                    {/* <link rel='stylesheet' href='/static/style/meihua_iconfont.css' /> */}
                </Head>
                <body>
                    <Main />
                    {/* here we will mount our modal portal */}
                    <div id='popupModal' />
                    <div id='commonModal' /> 
                    <NextScript />
                </body>
            </html>
        )
    }
}