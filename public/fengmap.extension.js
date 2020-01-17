

/**
 * [fengmap.frameSelect 框选]
 * @param {fengmap.FMMap}   map  【必填参数】 fengmap 地图对象
 * @param {json}   frameStyle   【必填参数】 框样式
 * @param {function}   modelFilter  【必填参数】 模型可选过滤器
 * @param {function} cb   【必填参数】 选中回调方法
 */

fengmap.FrameSelectMode = {

    REACTANGLE:0,
    POLYGON:1

}

fengmap.FrameSelect = function(map,frameStyle,modelFilter,frameSelectCB,modelClickCB){

    var self = this;

    if(!map && !(map instanceof fengmap.FMMap)) return;

    this._frameSelectCB = frameSelectCB;//单次多选后的回调
    this._modelClickCB = modelClickCB;//单击选中模型的回调
    this._map = map;//地图对象
    this._mapPicker = map.mapPicker;
    this._viewMode = map.viewMode;
    this._container = this._map.mapView.container_;//渲染dom
    this._modelFilter = modelFilter;//框选模型过滤
    this._minClickTimeInterval = 200;//点击事件的最小时间间隔 用于避免地图拖拽的冲突
    this._minDoubleClickTimeInterval = 500;//双击事件的最小时间间隔

    this._frameStyle = Object.assign({
        //设置颜色
        color: '#9F35FF',
        //设置透明度
        alpha: .3,
        //设置边框线的宽度
        lineWidth: 1,
        //设置高度
        height: 6
    },frameStyle);

    this._isFrameSelect = false;//是否开启框选
    this._frameSelectMode = fengmap.FrameSelectMode.REACTANGLE;//默认矩形选择模式

    //中间参数
    this._frameMapCoordsCount = 0;//点击次数
    this._frameCornerCoords = [];//框选框的角点坐标 第一个为地图坐标 第二个为像素坐标
    this._frameMapCoords = [];//框选框的地图坐标
    this._framePolygonMarker = null;//框选标注
    this._framePolygonLayer = null;//框选图层
    this._mouseDownTime = null;//鼠标按下的时间 用于避免地图拖拽的冲突
    this._mouseUpTime = null;//鼠标抬起的时间 用于判断双击
    this._selectModels = [];//框选选中的模型列表

    /**
     * openFrameSelect 开启框选
     * @return {void} 无
     */
    this.openFrameSelect = function(){

        this._map.viewMode = fengmap.FMViewMode.MODE_2D;
        this._map.options.modelSelectedEffect = false;
        this._isFrameSelect = true;
    }

    /**
     * closeFrameSelect 关闭框选
     * @return {void} 无
     */
    this.closeFrameSelect = function(){
        this._isFrameSelect = false;

        this._map.viewMode = this._viewMode;
        this._map.options.modelSelectedEffect = true;

        this._removeFrame();
        this._resetParas();
        this._frameMapCoordsCount = 0;
    }

    /**
     * openFrameSelect 设置框选模式
     * mode fengmap.FrameSelectMode.REACTANGLE | fengmap.FrameSelectMode.POLYGON 
     * @return {void} 无
     */
    this.setSelectMode = function(mode){

        this._frameSelectMode = mode;

        this._removeFrame();
        this._resetParas();
        this._frameMapCoordsCount = 0;
    }

    this._resetParas = function(){

        this._frameCornerCoords = [];//框选框的角点坐标 第一个为地图坐标 第二个为像素坐标
        this._frameMapCoords = [];//框选框的地图坐标
        this._framePolygonMarker = null;//框选标注
        this._framePolygonLayer = null;//框选图层
        this._mouseDownTime = null;//鼠标按下的时间 用于避免地图拖拽的冲突
        this._selectModels = [];//框选选中的模型列表
    }

    //获取鼠标位置的屏幕坐标
    this._getScreenCoord = function(event){
                        //获取地图视图的边框
        var box = (event.target || event.srcElement).getBoundingClientRect();

        //屏幕坐标
        var screenCoord = {
            x: event.clientX - box.left, //把当前的clientX减去当前容器相对左边的距离得到实际的x坐标
            y: event.clientY - box.top,//把当前的clientY减去当前容器相对顶边的距离得到实际的x坐标
        };

        return screenCoord;
    }

    //获取鼠标位置的地图坐标
    this._getMapCoord = function(event){

        var screenCoord  = this._getScreenCoord(event);

        return this._map.coordScreenToMap(screenCoord.x, screenCoord.y);
    }

    //计算框地图坐标
    this._updateFrameMapCoords = function(event){

        if (self._frameSelectMode == fengmap.FrameSelectMode.REACTANGLE) {

            if (self._frameMapCoordsCount == 0) {

                var mapCoord = self._getMapCoord(event);
                self._frameCornerCoords[0] = mapCoord;

            }else if (self._frameMapCoordsCount == 1){

                var screenCoord = self._getScreenCoord(event);
                self._frameCornerCoords[1] = screenCoord;

                var tmpCoord = self._frameCornerCoords[0];
                self._frameCornerCoords[0] = self._map.coordMapToScreen(self._frameCornerCoords[0]);

                var coordXs = self._frameCornerCoords[0].x<self._frameCornerCoords[1].x?[self._frameCornerCoords[0].x,self._frameCornerCoords[1].x]:[self._frameCornerCoords[1].x,self._frameCornerCoords[0].x];
                var coordYs = self._frameCornerCoords[0].y<self._frameCornerCoords[1].y?[self._frameCornerCoords[0].y,self._frameCornerCoords[1].y]:[self._frameCornerCoords[1].y,self._frameCornerCoords[0].y];

                self._frameMapCoords[0] = self._map.coordScreenToMap(coordXs[0], coordYs[0]);
                self._frameMapCoords[1] = self._map.coordScreenToMap(coordXs[1], coordYs[0]);
                self._frameMapCoords[2] = self._map.coordScreenToMap(coordXs[1], coordYs[1]);
                self._frameMapCoords[3] = self._map.coordScreenToMap(coordXs[0], coordYs[1]);

                self._frameCornerCoords[0] = tmpCoord;
            }

        }else{

            var mapCoord = self._getMapCoord(event);
            self._frameMapCoords[self._frameMapCoordsCount] = mapCoord;
        }

    }

    //移除框
    this._removeFrame = function(){

        if (this._framePolygonLayer && this._framePolygonMarker) {
            this._framePolygonMarker.dispose();
            this._framePolygonLayer.removeAll(this._framePolygonMarker);
            this._framePolygonLayer = null;
        }
    }

    //绘制框
    this._updateFrame = function(){

        if (this._isFrameSelect == false) {
            return;
        }

        this._removeFrame();

        if (this._frameMapCoords.length < 3) {
            return;
        }

        this._framePolygonMarker = new fengmap.FMPolygonMarker({
            color: this._frameStyle.color,
            //设置透明度
            alpha: this._frameStyle.alpha,
            //设置边框线的宽度
            lineWidth: this._frameStyle.lineWidth,
            //设置高度
            height: this._frameStyle.height,
            //设置多边形坐标点
            points: this._frameMapCoords,
            //地图对象
            map:this._map
        });

        var group = this._map.getFMGroup(this._map.focusGroupID);
        this._framePolygonLayer = group.getOrCreateLayer('polygonMarker');
        this._framePolygonLayer.addMarker(this._framePolygonMarker);
    }

    //提取框选模型并设置选中状态
    this._selecteModels = function(){

        if (this._isFrameSelect == false) {
            return;
        }

        if (this._frameMapCoords.length < 3) {
            return;
        }

        var conditions = {
          //查询范围坐标点集合
          polygon: this._frameMapCoords,
          // 要查询的类型
          nodeType: fengmap.FMNodeType.MODEL
        }

        this._map.search(this._map.focusGroupID, conditions, function(data) {

            self._selectModels = [];
            if (data != null && data.length > 0) {

                for (var i = 0; i < data.length; i++) {

                    if (self._modelFilter && self._modelFilter(data[i]) == true) {
                        continue;
                    }

                    if (self._selectModels.indexOf(data[i]) == -1) {
                        self._selectModels.push(data[i]);
                    }
                }
            }

            if (self._frameSelectCB) {
                self._frameSelectCB(self._selectModels);
            }
        });

    }

    this._container.onmousedown = function(event) {

        if (self._isFrameSelect == false) {
            return;
        }

        self._mouseDownTime = (new Date()).getTime();
    }

    this._container.onmouseup = function(event) {

        if (self._isFrameSelect == false) {
            return;
        }

        var upTime = (new Date()).getTime();
        //按下地图拖拽      
        if (upTime - self._mouseDownTime > self._minClickTimeInterval) {
            return;
        }

        if(self._mapPicker && self._frameMapCoordsCount==0){

            self._mapPicker.getPick_(event);
            if (self._mapPicker.isPickedModel && event.button != 2){

                var modelIntersects = self._mapPicker.modelIntersects_;
                var model = self._mapPicker.modelIntersects_[0].object.fm_;

                if (self._modelClickCB && self._modelClickCB(model)) {
                    return;
                }
            }
        }

        //双击 多边形单次选择结束
        if (self._mouseUpTime!=null && (upTime - self._mouseUpTime < self._minDoubleClickTimeInterval)) {
            self._frameMapCoordsCount = 0;
            self._removeFrame();
            self._selecteModels();
            self._resetParas();

        }else{//单击 框选单次结束

            self._mouseUpTime = upTime;

            if (self._frameSelectMode == fengmap.FrameSelectMode.REACTANGLE && self._frameMapCoordsCount == 1) {

                self._removeFrame();
                self._selecteModels();
                self._resetParas();
                self._frameMapCoordsCount = 0;
                return;

            }else{

                self._updateFrameMapCoords(event);
            }

            self._frameMapCoordsCount++;
        }

    }

    this._container.onmousemove = function(event) {

        if (self._isFrameSelect == false) {
            return;
        }

        if (self._frameSelectMode==fengmap.FrameSelectMode.REACTANGLE && self._frameMapCoordsCount 
            ==0) {

            return;
        }

        self._updateFrameMapCoords(event);
        self._updateFrame();
    }
}