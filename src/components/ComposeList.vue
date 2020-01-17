<template>
  <div class="compose-list-wrapper">
    <div class="online-title">
      <p>{{ current }}</p>
    </div>
    <div class="scrollbar">
      <el-scrollbar wrap-class="list" wrap-style="" view-style="" view-class="" :native="false">
        <el-table
          v-bind="$attrs"
          v-on="$listeners">
          <el-table-column
            v-for="{ type, prop, label, align } in colConfigs"
            :type="type"
            :key="prop"
            :prop="prop"
            :label="label"
            :align="align">
          </el-table-column>
        </el-table>
      </el-scrollbar>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ComposeList',
  props: {
    current: {
      type: String,
      default: function () {
        return '在线列表'
      }
    },
    colConfigs: {
      type: Array,
      default: function () {
        return [
          { type: 'index', prop: 'index', label: '#', align: 'center' },
          { type: '', prop: 'name', label: '姓名', align: 'center' }
        ]
      }
    }
  }
}
</script>

<style lang="scss" scoped>
$--color-primary: #0DAF9C;

.compose-list-wrapper {

  .online-title {
    color: $--color-primary;

    p {
      margin-top: 0;
      font-size: 16px;
      text-align: left;
    }
  }

  .scrollbar {
    height: 450px;
    overflow: hidden;

    .list {
      max-height: 450px;
    }

    ::v-deep .el-scrollbar {
      height: 100%;

      .el-scrollbar__wrap {
        overflow: scroll;
        width: 110%;
        height: 120%;
        overflow-x: hidden;

        .el-table {
          width: 96%;
        }
      }

      .el-table__body-wrapper::-webkit-scrollbar {
        width: 7px;
        height: 5px;
      }

      .el-table__body-wrapper::-webkit-scrollbar-track {
      }

      .el-table__body-wrapper::-webkit-scrollbar-thumb {
        background-color: rgba(144, 147, 153, .5);
        border-radius: 1px;
      }

      /*.el-table--border:after,
      .el-table--group:after,
      .el-table:before {
        background-color: $--color-primary;
      }

      .el-table--border,
      .el-table--group {
        border-color: $--color-primary;
      }

      .el-table td,
      .el-table th.is-leaf {
        border-bottom: 1px solid $--color-primary;
      }

      .el-table--border th,
      .el-table--border th.gutter:last-of-type {
        border-bottom: 1px solid $--color-primary;
      }

      .el-table--border td,
      .el-table--border th {
        border-right: 1px solid $--color-primary;
      }*/
    }
  }
}
</style>
