import { theme } from 'antd'
import type { ThemeConfig } from 'antd'

const { defaultAlgorithm } = theme

const themeConfig: ThemeConfig = {
  algorithm: defaultAlgorithm,
  token: {
    fontSize: 16,
    colorPrimary: '#5baa54',

    colorError: '#DF4E42',
    colorErrorHover: '#e86e62',
    colorErrorActive: '#c13f35',
  },
  components: {
    Button: {
      colorPrimary: '#68bc34',
      colorPrimaryHover: '#5baa54',
    },
    Layout: {
      siderBg: '#212529',
    },
    Menu: {
      darkItemBg: '#212529',
    },
  },
}

export default themeConfig
