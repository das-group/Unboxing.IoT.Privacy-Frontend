import { reactive } from 'vue'
import de from './de'

const languages = { de }

export const localization = reactive({
  locale: 'de',
  messages: languages,

  t(key) {
    if (!key) return ''

    const resolvePath = (obj, path) => path.split('.').reduce((o, part) => o?.[part], obj)
    let d = resolvePath(this.messages[this.locale], key)

    if (!d) {
      const match = key.match(/(\w+)\(([^)]+)\)/)
      if (match) {
        const outerKey = match[1]
        const innerKey = match[2]
        return this.t(outerKey) + ' ' + this.t(innerKey)
      }
    }

    return d ?? key
  },

  setLocale(newLocale) {
    this.locale = newLocale
  },

  langCodeToLanguageName(langCode) {
    const dn = new Intl.DisplayNames([this.locale], { type: 'language' })
    return dn.of(langCode)
  },
})
