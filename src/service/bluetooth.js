import axios from 'src/utils/axios'

// 获取地图区域数据
const getMapArea = (query) => axios.setAxiosGetPromise('/region/', query)

// 人员匹配接口
const getPeople = (query) => axios.setAxiosGetPromise('/people/', query)

// 获取区域内人员
const onlinePeople = (query) => axios.setAxiosPostPromise('/onlinePeople/', query)

// 获取在线记录
const onlineHistory = (query) => axios.setAxiosPostPromise('/onlineHistory/', query)

export default {
  getMapArea,
  getPeople,
  onlinePeople,
  onlineHistory
}
