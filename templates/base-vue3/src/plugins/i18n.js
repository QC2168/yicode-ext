import { createI18n } from 'vue-i18n';
import { vueI18nMessages } from '@yicode/yite-cli';
import { app } from '@/app.js';

const i18n = createI18n({
    locale: 'zh',
    messages: vueI18nMessages
});

export { i18n };
