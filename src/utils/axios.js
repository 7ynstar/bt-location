import axios from 'axios'

axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8'
axios.defaults.baseURL = 'http://192.168.65.108:7010/iobp'  // api默认路由地址
axios.defaults.withCredentials = true

export default {
  // 获取
  setAxiosGetPromise: (url, params = {}) => {
    return axios.get(url + '?Timestamp=' + Date.now(), {
      params: params
    }).then(response => {
      return response.data
    }).catch(err => {
      throw err
    })
  },
  // 新增
  setAxiosPostPromise: (url, data) => {
    return axios.post(url + '?Timestamp=' + Date.now(), data).then(response => {
      return response
    }).catch(err => {
      throw err
    })
  },
  // 更新全部
  setAxiosPutPromise: (url, data, params = {}) => {
    return axios.put(url, data, {
      params: params
    }).then(response => {
      return response
    }).catch(err => {
      throw err
    })
  },
  // 删除
  setAxiosDeletePromise: (url, params = {}) => {
    return axios.delete(url + '?Timestamp=' + Date.now(), {
      params: params
    }).then(response => {
      return response
    }).catch(err => {
      throw err
    })
  }
}
