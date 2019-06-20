const formatArea = (code) => {
  const area = {
    'DB': '迪拜',
    'HK': '香港',
    'JP': '日本',
    'TH': '泰国'
  }
  return area[code]
}

const formatCurrency = (number) => {
  if (isNaN(number)) return
  number = Number((number / 100).toFixed(2))
  return number
}

export default {
  formatArea,
  formatCurrency
}
