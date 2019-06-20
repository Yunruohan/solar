import Axios from 'axios'

export default class Http {
  static get (url, params) {
    return new Promise((resolve, reject) => {
      return Axios.get(url, {
        params: params
      }).then(res => resolve(res)).catch(err => reject(err))
    })
  }
  static post (url, params) {
    return new Promise((resolve, reject) => {
      return Axios.post(url, params).then(res => resolve(res)).catch(err => reject(err))
    })
  }
  static put (url, params) {
    return new Promise((resolve, reject) => {
      return Axios.put(url, params).then(res => resolve(res)).catch(err => reject(err))
    })
  }
}
