import { createIconsConfig } from 'vuestic-ui'
import aliases from './aliases'

export default createIconsConfig({
  aliases,
  fonts: [
    {
      name: 'fa4-{code}',
      resolve: (segments) => ({ class: `fa4 fa fa-${segments.code}` }),
    },
    {
      name: 'ion-{font}-{code}',
      resolve: (segments) => ({
        class: `icon ion-${segments.font}-${segments.code}`,
      }),
    },
    {
      name: 'vuestic-iconset-{code}',
      resolve: (segments) => ({
        class: `vuestic-iconset vuestic-iconset-${segments.code}`,
      }),
    },
    {
      name: 'flag-icon-{code} {size}',
      resolve: (segments) => ({
        class: `fi fi-${segments.code} fi-size-${segments.size}`,
        tag: 'span',
      }),
    },
    {
      name: /(brandico|entypo|fa|fontelico|glyphicon|iconicstroke|maki|openwebicons)-(.*)/,
      resolveFromRegex: (font: string, code: string) => ({ class: `${font} ${font}-${code}` }),
    },
    {
      name: 'material-icons-{code}',
      resolve: (segments) => ({ to: segments.code }),
    },
    {
      name: 'mso-{content}',
      class: 'material-symbols-outlined',
      resolve: (segments) => ({ content: segments.content }),
    },
  ],
})
