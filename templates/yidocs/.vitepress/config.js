import { docsAuto } from '@yicode/yidocs-auto';

let { sideBar, navBar } = docsAuto();

export default defineConfig({
    base: '/',
    title: 'yidocs',
    description: '何以解忧，唯有代码。',
    lastUpdated: true,
    markdown: {
        theme: 'material-theme-palenight',
        lineNumbers: true
    },
    outDir: './dist',
    srcDir: './markdown',
    ignoreDeadLinks: true,
    titleTemplate: false,
    head: [
        //
        [
            'link',
            {
                rel: 'shortcut icon',
                href: '/favicon.ico'
            }
        ]
    ],

    themeConfig: {
        logo: '/logo.png',
        lastUpdatedText: '更新时间',
        siteTitle: 'yidocs',
        outline: 'deep',
        outlineTitle: '大纲',
        socialLinks: [
            //
            {
                icon: {
                    svg: `<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg t="1685703518937" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2363" xmlns:xlink="http://www.w3.org/1999/xlink" width="200" height="200"><path d="M512 1024C229.222 1024 0 794.778 0 512S229.222 0 512 0s512 229.222 512 512-229.222 512-512 512z m259.149-568.883h-290.74a25.293 25.293 0 0 0-25.292 25.293l-0.026 63.206c0 13.952 11.315 25.293 25.267 25.293h177.024c13.978 0 25.293 11.315 25.293 25.267v12.646a75.853 75.853 0 0 1-75.853 75.853h-240.23a25.293 25.293 0 0 1-25.267-25.293V417.203a75.853 75.853 0 0 1 75.827-75.853h353.946a25.293 25.293 0 0 0 25.267-25.292l0.077-63.207a25.293 25.293 0 0 0-25.268-25.293H417.152a189.62 189.62 0 0 0-189.62 189.645V771.15c0 13.977 11.316 25.293 25.294 25.293h372.94a170.65 170.65 0 0 0 170.65-170.65V480.384a25.293 25.293 0 0 0-25.293-25.267z" fill="#C71D23" p-id="2364"></path></svg>`
                },
                link: 'https://gitee.com/yicode-team/yicode'
            },
            { icon: 'github', link: 'https://github.com/chenbimo' }
        ],
        footer: {
            message: 'yidocs template',
            copyright: 'Copyright © 2019-present yidocs'
        },
        docFooter: {
            prev: '上一页',
            next: '下一页'
        },
        nav: [...navBar],
        sidebar: sideBar
    }
});
