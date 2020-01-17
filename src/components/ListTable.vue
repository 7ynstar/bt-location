<template>
  <el-card class="left-panel">
    <el-tabs
      v-bind="$attrs"
      v-on="$listeners">
      <el-tab-pane label="区域人员" name="first">
        <compose-list
          :current="currentArea"
          :data="regionData"
          :colConfigs="areaConfigs"
        ></compose-list>
      </el-tab-pane>
      <el-tab-pane label="在线人员列表" name="second">
        <compose-list
          :current="currentCount"
          :data="totalData"
          :colConfigs="listConfigs"
        ></compose-list>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script>
export default {
  name: 'ListTable',
  props: {
    currentArea: {
      type: String,
      default: function () {
        return '在线列表'
      }
    },
    currentCount: {
      type: String,
      default: function () {
        return '全部在线人员'
      }
    },
    areaConfigs: {
      type: Array,
      default: function () {
        return [
          { type: 'index', prop: 'index', label: '#', align: 'center' },
          { type: '', prop: 'name', label: '姓名', align: 'center' }
        ]
      }
    },
    listConfigs: {
      type: Array,
      default: function () {
        return [
          { type: 'index', prop: 'index', label: '#', align: 'center' },
          { type: '', prop: 'name', label: '姓名', align: 'center' }
        ]
      }
    },
    regionData: {
      type: Array,
      default: function () {
        return []
      }
    },
    totalData: {
      type: Array,
      default: function () {
        return []
      }
    },
  },
  data () {
    return {}
  }
}
</script>

<style lang="scss" scoped>
$--color-primary: #0DAF9C;

.left-panel {
  position: absolute;
  top: 55px;
  left: 10px;
  width: 500px;

  ::v-deep .el-card__body {
    padding: 20px 12px;

    .el-tabs--border-card > .el-tabs__header .el-tabs__item.is-active {
      color: $--color-primary;
    }
  }
}
</style>
