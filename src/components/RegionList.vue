<template>
  <div class="region-list">
    <span
      class="region"
      v-for="region in regions"
      :key="region._id"
      :class="{ 'region-selected': isSelected(region) }"
      @click="select(region)">
      {{ region.name }}
      {{ region.persons.length }} 人
    </span>
  </div>
</template>

<script>
export default {
  name: 'RegionList',
  props: {
    personsData: {
      type: Array,
      default: function () {
        return []
      }
    },
    areasData: {
      type: Array,
      default: function () {
        return []
      }
    },
    selected: {
      type: String,
      default: ''
    }
  },
  computed: {
    regions () {
      const areas = this.areasData
      const persons = this.personsData
      areas.forEach(area => {
        area.persons = []
        persons.forEach(person => {
          if (person.regionId === area._id) {
            area.persons.push(person)
          }
        })
      })
      return areas
    }
  },
  data () {
    return {
      isSelect: false
    }
  },
  methods: {
    select (region) {
      this.$emit('select', region)
    },
    isSelected (region) {
      return region._id === this.selected
    },
    cancelSelect () {
      this.isSelect = false
    }
  }
}
</script>

<style lang="scss" scoped>
$--color-primary: #0DAF9C;

.region-list {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  display: inline;

  span {
    display: inline-block;
    line-height: 1;
    white-space: nowrap;
    color: #606266;
    -webkit-appearance: none;
    text-align: center;
    box-sizing: border-box;
    outline: none;
    margin: 0;
    transition: .1s;
    font-weight: 500;
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    padding: 12px 20px;
    font-size: 16px;
    border-radius: 3px;
    opacity: .6;
    background-color: transparent;

    &:not(:first-child) {
      margin-left: 4em;
    }
  }

  .region-selected {
    color: #fff;
    background-color: $--color-primary;
    border-color: $--color-primary;
    border-radius: 5px;
    font-weight: 500;
  }
}
</style>
