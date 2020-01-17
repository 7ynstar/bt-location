<template>
  <div id="app">
    <feng-map
      class="fengmap"
      :config="fengConfig"
      @click="handleClick"
      @load-complete="loadComplete"
      ref="fengmap">
    </feng-map>
    <el-button class="show-online" size="small" @click="showOnline = !showOnline">在线人员列表</el-button>
    <el-collapse-transition>
      <list-table
        v-show="showOnline"
        :regionData="persons"
        :currentArea="currentArea"
        :area-configs="areaConfigs"
        :list-configs="listConfigs"
        height="450"
        :stripe="true"
        type="border-card"
        :stretch="true"
        v-model="activeName"
        @tab-click="handleTabClick"
        :currentCount="currentCount"
        :totalData="totalPeoples"
        border>
      </list-table>
    </el-collapse-transition>
    <region-list
      ref="region"
      :personsData="totalPeoples"
      :areasData="areas"
      :selected="selected"
      @select="handleSelectRegion">
    </region-list>
    <right-panel @close="handleClear">
      <complex-table
        :data="records"
        :currentArea="currentArea"
        :col-configs="colConfigsRecord"
        height="503"
        :stripe="true"
        border
        v-model="personName"
        :fetch-suggestions="querySearchAsync"
        @select="handleSelect"
        @clear="handleClear"
        placeholder="输入姓名查询记录"
        clearable>
      </complex-table>
    </right-panel>
  </div>
</template>

<script>
/* eslint-disable no-console */
import * as clickHandler from 'src/handler/click-handler'
import bluetoothService from 'src/service/bluetooth'
import fengConfig from 'src/config/feng-config'
import { areaConfigs, colConfigsRecord, listConfigs } from 'src/config/table-config'
import dayjs from 'dayjs'

export default {
  name: 'app',
  data () {
    this.fengConfig = fengConfig
    this.areaConfigs = areaConfigs
    this.listConfigs = listConfigs
    this.colConfigsRecord = colConfigsRecord
    return {
      showOnline: false,
      areas: [],  // 地图区域数据
      persons: [],
      clickArea: '',
      count: 0,
      personName: '',
      records: [],
      activeName: 'first',
      totalPeopleCount: 0,
      totalPeoples: [],
      selected: ''
    }
  },
  computed: {
    currentArea () {
      return `${ this.clickArea } 在线列表   ${ this.count }  个人`
    },
    currentCount () {
      return `共在线 ${ this.totalPeopleCount } 个人`
    }
  },
  watch: {
    showOnline (val) {
      if (!val) {
        this.activeName = 'first'
      }
    }
  },
  methods: {
    async loadComplete () { // 地图加载完成后加载区域和人员数据
      await this.getArea()
      await this.handlePerson()
    },
    handleSelectRegion (region) { // 上方区域点击事件，等同于地图区域点击
      this.handleRegionClick(region)
    },
    async handleTabClick (tab) {  // tab切换重新请求数据，保证数据的一致性
      await this.handlePerson()
    },
    handleClick (event) { // 地图组件的点击事件
      const FM_LABEL_CODE = 12
      const { target, nodeType } = event
      if (!target) {  // 如果点击地图有效区外面，页面状态重置
        this.showOnline = false
        this.$refs.fengmap.handleMapReset()
        this.selected = ''
        this.$refs.region.cancelSelect()
        return
      }
      if (nodeType === FM_LABEL_CODE) return  // 屏蔽点击到fengmap-label的事件，存在事件捕获（已弃用）
      const { x, y } = target
      const point = [ x, y ]
      const clickResult = clickHandler.isInArea(point, this.areas)  // 判断落点区域
      if (!clickResult.isDrop) return
      this.handleRegionClick(clickResult)
    },
    async handleRegionClick (args) {
      const { name, FIDS, _id } = args
      this.selected = _id
      await this.$refs.fengmap.handleModalClick(FIDS)
      await this.handlePerson()
      this.clickArea = name
      this.activeName = 'first'
      this.showOnline = true
    },
    async querySearchAsync (queryString, cb) {
      if (queryString === undefined || queryString === '') return
      return bluetoothService.getPeople({
        params: {
          name: queryString,
          deleted: false
        },
        page: {
          pageIndex: 1,
          pageSize: 10,
          sort: {
            updateTime: -1
          }
        },
      }).then(res => {
        const { results, totalCount } = res
        results.forEach(data => data.value = data.name)
        cb(results)
      })
    },
    handleSelect (item) {
      const startTime = dayjs().format('YYYY-MM-DD 00:00:00')
      const endTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
      return bluetoothService.onlineHistory({
        peopleId: item._id,
        startTime,
        endTime,
        // pageIndex: 1,
        // pageSize: 10,
        sort: {
          createTime: -1
        }
      }).then(res => {
        const { data: { results, totalCount, pageCount } } = res
        this.records = results
      })
    },
    handleClear () {
      this.personName = ''
      this.records = []
    },
    getArea () {
      return bluetoothService.getMapArea()
        .then(res => {
          const { results } = res
          this.areas = results
        })
        .catch(e => {
          throw new Error('地图区域数据加载出现了错误：' + e)
        })
    },
    async handlePerson () {
      const { results } = await this.getPerson()
      this.totalPeoples = results
      this.totalPeopleCount = results.length
      const allPerson = this.totalPeoples
      const [ regionPersons ] = this.partition(allPerson).filter(v => v.regionId === this.selected)
      if (regionPersons && regionPersons.data) {
        this.persons = regionPersons.data
        this.count = regionPersons.data.length
      } else {
        this.persons = []
        this.count = 0
      }
    },
    async getPerson (bluetoothSite) {
      const startTime = dayjs().subtract(1, 'minute').format('YYYY-MM-DD HH:mm:ss')
      const endTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
      const result = await bluetoothService.onlinePeople({
        bluetoothSite: bluetoothSite ? bluetoothSite : void (0),
        startTime,
        endTime,
        pageIndex: 1,
        pageSize: 10,
      })
      return result.data
    },
    partition (arr) {
      let map = {}
      return arr.reduce((pre, acc) => {
        if (!map[acc.regionId]) {
          pre.push({
            regionId: acc.regionId,
            name: acc.locate,
            data: [ acc ]
          })
          map[acc.regionId] = acc
        } else {
          pre.forEach(w => {
            if (w.regionId === acc.regionId) {
              w.data.push(acc)
            }
          })
        }
        return pre
      }, [])
    },
  }
}
</script>

<style lang="scss">
$--color-primary: #0DAF9C;

* {
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
  box-sizing: border-box;
  margin: 0;
  padding: 0;

  &::before,
  &::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
}

html, body {
  position: relative;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

#app {
  width: 100%;
  height: 100%;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;

  .fengmap {
    width: 100%;
    height: 100%;
  }

  .el-button:focus, .el-button:hover {
    color: $--color-primary;
    border-color: $--color-primary;
    background-color: #F1FBFF;
  }

  .show-online {
    position: absolute;
    top: 10px;
    left: 10px;
  }
}
</style>
