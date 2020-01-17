<template>
  <div
    id="fengmap"
    ref="fengmap"
    v-loading.fullscreen.lock="fullscreenLoading"
    element-loading-text="正在加载中..."
  ></div>
</template>

<script>
/* eslint-disable */
import { isEqual, delay } from 'lodash'

const DEFAULT_COLOR = '#F6FDFE'
const TOGGLE_COLOR = '#6ECFC4'
const STROKE_COLOR = '#E0EAEE'

export default {
  name: 'FengMap',
  mounted () {
    this.$nextTick(this._loadingMap)
  },
  data () {
    this.map = window.map
    let fengmap = this.fengmap = window.fengmap
    this.ctlOpt = new fengmap.controlOptions({
      position: fengmap.controlPositon.RIGHT_TOP,
      showBtnCount: 7,
      allLayer: false,
      offset: {
        x: 20,
        y: 10
      }
    })
    return {
      fullscreenLoading: true
    }
  },
  props: {
    config: {
      type: Object,
      required: true,
      default: function () {
        return {}
      },
      validator: function (config) {
        return Object.keys(config).length > 0
      }
    },
    scrollGroupsControl: {
      type: Boolean | String,
      default: function () {
        return false
      }
    }
  },
  methods: {
    handleModalClick: (function () {
      let lastFIDS
      return async function (FIDS) {
        if (isEqual(lastFIDS, FIDS)) {
          // this._renderRegionColor(lastFIDS, DEFAULT_COLOR)
          // lastFIDS = undefined
          return
        }
        if (lastFIDS !== undefined) {
          this._renderRegionColor(lastFIDS, DEFAULT_COLOR)
        }
        this._renderRegionColor(FIDS, TOGGLE_COLOR)
        lastFIDS = FIDS
      }
    }()),
    // handleOnlineTextMarker (areas) {
    //   const group = map.getFMGroup(map.focusGroupID)
    //   const layer = group.getOrCreateLayer('textMarker')
    //   areas.forEach(area => {
    //     const { center: [ x, y ], data } = area
    //     const count = data.length
    //     const tm = new fengmap.FMTextMarker({
    //       name: count + '',
    //       x,
    //       y,
    //       fillcolor: '68, 158, 255',
    //       fontsize: 42,
    //       strokecolor: '64, 158, 255',
    //       alpha: 0.5,
    //       callback: function () {
    //         tm.alwaysShow()
    //       }
    //     })
    //     layer.addMarker(tm)
    //   })
    // },
    handleClickMap (event) {
      this.$emit('click', event)
    },
    handleMapReset () {
      return this._renderBackgroundColor()
    },
    clearTextMarker () {
      try {
        map.callAllLayersByAlias('textMarker', layer => {
          if (layer) {
            layer.removeAll()
          }
        })
      } catch (e) {
      }
    },
    _loadingMap () {
      let { $el, map, fengmap, config: fengConfig, ctlOpt } = this
      fengConfig.container = $el
      fengConfig.defaultViewMode = fengmap.FMViewMode.MODE_2D
      map = window.map = new fengmap.FMMap(fengConfig)
      map.gestureEnableController.enableMapRotate = false
      map.openMapById(fengConfig.fmapID)
      map.on('loadComplete', () => {
        this.handleMapReset()
        this.$emit('load-complete')
        map.on('mapClickNode', event => this.handleClickMap(event))
        delay(() => this.fullscreenLoading = false, 500)
        if (this.scrollGroupsControl) {
          new fengmap.scrollGroupsControl(map, ctlOpt)
        }
      })
    },
    async _renderRegionColor (ids, color) {
      for (let id of ids) {
        await this._renderModalColor(id, color)
      }
    },
    _renderBackgroundColor (groupId, color = DEFAULT_COLOR, transparency = 1) {
      const fMSearchRequest = new fengmap.FMSearchRequest(fengmap.FMNodeType.MODEL)
      fMSearchRequest.groupID(map.focusGroupID)
      const fMSearchAnalyser = new fengmap.FMSearchAnalyser(map)
      fMSearchAnalyser.query(fMSearchRequest, (request, result) => {
        const models = result
        if (models.length <= 0) return
        for (let model of models) {
          model.setColor(color, transparency)
          model.setStrokeColor(STROKE_COLOR, transparency)
        }
      })
    },
    _renderModalColor (FID, color = TOGGLE_COLOR, transparency = 1) {
      const fMSearchRequest = new fengmap.FMSearchRequest(fengmap.FMNodeType.MODEL)
      fMSearchRequest.FID(FID)
      const fMSearchAnalyser = new fengmap.FMSearchAnalyser(map)
      fMSearchAnalyser.query(fMSearchRequest, (request, result) => {
        const models = result
        if (models.length <= 0) return
        for (let model of models) {
          model.setColor(color, transparency)
          model.setStrokeColor(STROKE_COLOR, transparency)
        }
      })
    }
  },
}
</script>

<style lang="scss" scoped>
$baseFontSize: 24;
@function px2rem($val) {
  @return $val/$baseFontSize + rem;
}

/* 写入scss */
@mixin self-background-color {
  background: #fff;
}

#fengmap {
  @include self-background-color;
}
</style>
