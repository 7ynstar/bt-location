<template>
  <el-card class="right-panel">
    <div class="searchBar">
      <el-autocomplete
        v-bind="$attrs"
        v-on="$listeners"
      ></el-autocomplete>
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
  </el-card>
</template>

<script>
export default {
  name: 'ComplexTable',
  props: {
    currentArea: {
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
  },
  data () {
    return {}
  },
  methods: {}
}
</script>

<style lang="scss" scoped>
$--color-primary: #0DAF9C;
$--complex-height: 540px;

.right-panel {
  position: absolute;
  /*top: 20px;*/
  /*right: 20px;*/
  /*width: 95%;*/
  width: 492px;

  ::v-deep .el-card__body {
    padding: 12px;
  }

  .searchBar {
    padding-bottom: 10px;

    ::v-deep .el-autocomplete {
      width: 100%;

      .el-input__inner:focus {
        border-color: $--color-primary;
      }
    }
  }

  .scrollbar {
    height: $--complex-height;
    overflow: hidden;

    .list {
      max-height: $--complex-height;
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
    }
  }
}
</style>
