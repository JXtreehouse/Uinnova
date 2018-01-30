var app;
window.onload = function () {
    app = new t3d.App({
        el: "div3d",
        skyBox:'BlueSky',
        // url: "https://speech.uinnova.com/static/models/uinnova",
        url: "https://uinnova-model.oss-cn-beijing.aliyuncs.com/scenes/uinnova",
        ak:'app_test_key',
        complete: function () {
            console.log("app scene loaded");
            /* 初始化场景 */
            init();
            /* 显示所有楼层 */
            ShowAllFloor();
            /* 引导提示 */
            startIntro(ubuilding, 'folder');
        }
    });
}
var uBuilding = [];
function init() {
    // button收集
    uBuilding.div3d = document.getElementById('div3d');

    uBuilding.div3d.style.width = window.innerWidth;
    uBuilding.div3d.style.height = window.innerHeight;
    if(window.innerWidth >= 600)
        ShowUIPC();
    else
        ShowUIPhone();
    guiFunction();
    uBuilding.show1 = true;
    uBuilding.show2 = true;
    uBuilding.show3 = true;
    uBuilding.canClick=true;
    
}
/* 创建导航面板 */
var guiMd;
var obj = {
    buildings: [{name: "Buildings", floors: [{name: "1F",},{name: "2F",},{name: "3F",},{name: "4F",},{name: "5F",}]}],
    outdoor: {name: 'Outdoors',}
}
var v5_2D,v5_3D;
function guiFunction() {
    guiMd = new dat.gui.GUI({
        type: 'nav-md1'
    });
    guiMd.setPosition(0,null,null,0);
    var f1 = guiMd.addAppTree('全景',obj);
    var v1 = guiMd.addTree('消防水箱');
    var v2 = guiMd.addTree('排烟风机');
    var v3 = guiMd.addTree('消防栓');
    var v4 = guiMd.addTree('警报');
    v5_2D = guiMd.addTree('2D');
    guiMd.treeBind('click', function(o,target) {
        if(o == '消防水箱'){
            uBuilding.show1 = !uBuilding.show1;
            for(var i =0;i<guis.length;i++){
                if(guis[i].name==="消防水箱")
                    guis[i].show(uBuilding.show1);
            }
           
        } else if(o == '排烟风机'){
            uBuilding.show2 = !uBuilding.show2;
            for(var i =0;i<guis.length;i++){
                if(guis[i].name==="排烟风机")
                    guis[i].show(uBuilding.show2);
            }
        } else if(o == '消防栓'){
            uBuilding.show3 = !uBuilding.show3;
            for(var i =0;i<guis.length;i++){
                if(guis[i].name==="消防栓")
                    guis[i].show(uBuilding.show3);
            }
        } else if(o == '警报'){
            // 弹出框
            if(uBuilding.canClick){
                uBuilding.canClick=false;
                setTimeout("alertWindow()", 50);
            }
        } else if(o == '2D'){
            // 删除 2D 标签
            guiMd.removeFolder(v5_2D);
            v5_3D = guiMd.addTree('3D');
            change_3d(false);
        }else if(o == '3D'){
            // 删除 3D 标签
            guiMd.removeFolder(v5_3D);
            v5_2D = guiMd.addTree('2D');
            change_3d(true);
        }else if(o.hasOwnProperty("name")){
            if(o.name.indexOf('F') > -1){
                app.camera.orbit.enableRotate = true;
                // guiMd.highLight(target);
                var num = o.name.substring(0,1);
                ShowThisFloor(num);
            }else{
                floorNum = 0;
                ShowAllFloor();
                app.camera.orbit.enableRotate = true;
                if(v5_3D != null){
                    if(v5_3D.domElement != null){
                        guiMd.removeFolder(v5_3D);
                        v5_2D = guiMd.addTree('2D');
                    }
                }
            }
        }else{
            floorNum = 0;
            ShowAllFloor();
            app.camera.orbit.enableRotate = true;
            if(v5_3D != null){
                if(v5_3D.domElement != null){
                    guiMd.removeFolder(v5_3D);
                    v5_2D = guiMd.addTree('2D');
                }
            }
        }
        if(floorNum > 0)
            guiMd.pathHighLight('全景.Buildings.'+floorNum+'F');
        uBuilding.div3d.insertBefore(guiMd.domElement,uBuilding.div3d.lastChild);
    })
    guiMd.setZIndex(10);
}
function _clamp ( v, minv, maxv ) {
    return ( v < minv ) ? minv : ( ( v > maxv ) ? maxv : v );
}
function change_3d (bool) {
    // 防止旋转时候中断的bug
    app.camera.orbit.enabled = true;
    // 获取场景的大小
    var box = new THREE.Box3().setFromObject(app.debug.scene);
    var offsetFactor = [0,1,0];
    var radius = box.getSize().length();//lenght 返回的是对角线长
    var center = box.getCenter();
    var eyePos = [];
    radius = _clamp(radius,4,1000);
    if (!bool) {
        eyePos = [center.x + radius * offsetFactor[0], center.y + radius * offsetFactor[1], center.z + radius * offsetFactor[2] ];
        eyePos.y = _clamp(eyePos.y, 10, 1000);
        app.camera.orbit.enableRotate = false;//2d 时候关闭旋转
    } else {
        offsetFactor = [0.5,0.5,0.5];
        eyePos = [center.x + radius * offsetFactor[0], center.y + radius * offsetFactor[1], center.z + radius * offsetFactor[2] ];
        app.camera.orbit.enableRotate = true;
    }
    app.camera.flyTo({
        position: eyePos,
        target: [center.x,center.y,center.z],
        time: 800 // 耗时毫秒
    });
}

function alertWindow() {
    uBuilding.canClick=true;
    alertMsg("检测到异常，是否查看", 1, "Warning");
}

var timer = null;
var img;

// 警报后
function Warning() {
    app.camera.orbit.enableRotate = true;
    if(v5_3D != null){
        if(v5_3D.domElement != null){
            guiMd.removeFolder(v5_3D);
            v5_2D = guiMd.addTree('2D');
        }
    }
    var objName = new Array();
    objName[0] = "消防栓";
    objName[1] = "消防水箱";
    objName[2] = "排烟风机";
    
    var objs = app.query('[物体类型='+objName[rnd(0, objName.length - 1)]+']')
    var obj = objs[0];
    // console.log(obj);
    img = document.getElementById('imageTest');
    img.style.zIndex=1;
    var tt = app.create({
        type: 'Box',
        width: 0.1,
        height: 0.1,
        depth: 0.1,
        position:obj.position,
    });
    var box = new THREE.Box3().setFromObject(tt.node);
    tt.addUI(img, [0.5, box.getSize().y-2.5, 0 ],[0.2,1]);
    var result = app.camera.worldToScreen(tt.position);
    var i = 0;
    clearInterval(timer);
    timer = setInterval(function () {
        img.style.display = i++ % 2 ? "none" : "block";
        i > 1000 && clearInterval(timer);
        if (i > 1000) {
            img.style.display = "none";
        }
    }, 500);
}

function rnd(n, m) {
    var random = Math.floor(Math.random() * (m - n + 1) + n);
    return random;
}
var ubPOS;
// 显示全景
function ShowAllFloor() {
    // 显示建筑最外层
    app.buildings[0].node.children[1].visible = true;
    
    /* 控制 app.buildings[0].node.children[0]的 children 显隐更靠谱 */
    var node = app.buildings[0].node.children[0].children;
    
    for (var i = 0; i < node.length; i++) {
        node[i].visible = true;
    }
    ubPOS=app.buildings[0].position;
    app.camera.flyTo({
        position: [ubPOS[0]+3, ubPOS[1]+43.21, ubPOS[2]+80],
        target: [ubPOS[0],ubPOS[1],ubPOS[2]],
        time: 1200
    });
}

var floorNum = 0;
// 仅显示/聚焦某层
function ShowThisFloor(number) {
    floorNum = number;
    if(v5_3D != null){
        if(v5_3D.domElement != null){
            guiMd.removeFolder(v5_3D);
            v5_2D = guiMd.addTree('2D');
        }
    }
    guiMd.pathHighLight('全景.Buildings.'+floorNum+'F');
    // 隐藏建筑最外层
    app.buildings[0].node.children[1].visible = false;
    
    /* 控制 app.buildings[0].node.children[0]的 children 显隐更靠谱 */
    var node = app.buildings[0].node.children[0].children;
    
    for (var i = 0; i < node.length; i++) {
        node[i].visible = false;
    }
    if (number === 1) {
        node[0].visible = true;
        node[1].visible = true;
        app.buildings[0].floors[0].roofNode.visible = false;
        app.buildings[0].floors[1].roofNode.visible = false;
        app.buildings[0].floors[1].node.children[1].visible=false;
    } else {
        if(number == 3)
            app.buildings[0].floors[3].node.children[2].visible=false;
        else if(number == 5)
            app.buildings[0].floors[5].node.children[2].visible=false;
        node[number].visible = true;
        app.buildings[0].floors[number].roofNode.visible = false;
    }
    flytoTarget(number);
}

// 摄像机飞向目标点
function flytoTarget(number) {
    app.camera.flyTo({
        position: [ubPOS[0]-3, ubPOS[1]+20.28 + ( number - 1 ) * 2.5,  ubPOS[2]+56],
        target: [ubPOS[0], ubPOS[1] + ( number - 1 ) * 6, ubPOS[2]+15.76],
        time: 1200
    });
}
var guis = new Array();
// 生成样式
function CreateStyle( panelType ) {
    var gui;
    switch(panelType){
        case "消防栓":
            var xfs = {
                hydraulicPressure: '0.14MPa'
            };
            gui = new dat.gui.GUI({
                type: 'signboard0',
                name: '消防栓',
                isClose: true,//close属性配置是否有关闭按钮，默认没有，是为true，否为false
                opacity: 0.8,
            });
            uBuilding.div3d.insertBefore(gui.domElement,uBuilding.div3d.lastChild);
            gui.setZIndex(10);
            gui.show(true);
            gui.remember(xfs);
            gui.add(xfs, 'hydraulicPressure').name('水压');
            gui.setOpacity(0.9);
            gui.__closeButton.onclick = function () {
                uBuilding.show3 = false;
            }
            guis.push(gui);
            break;
        case "消防水箱":
            var xfsx = {
                waterlevel: '2.5米'
            };
            gui = new dat.gui.GUI({
                type: 'signboard0',
                name: '消防水箱',
                isClose: true,//close属性配置是否有关闭按钮，默认没有，是为true，否为false
                opacity: 0.8,
            });
            uBuilding.div3d.insertBefore(gui.domElement,uBuilding.div3d.lastChild);
            gui.setZIndex(10);
            gui.show(true);
            gui.remember(xfsx);
            gui.add(xfsx, 'waterlevel').name('水位');
            gui.setOpacity(0.9);
            gui.__closeButton.onclick = function () {
                uBuilding.show1 = false;
            }
            guis.push(gui);
            break;
        case "排烟风机":
            var pfyj = {
                radio: 'on'
            };
            gui = new dat.gui.GUI({
                type: 'signboard0',
                name: '排烟风机',
                isClose: true,//close属性配置是否有关闭按钮，默认没有，是为true，否为false
                opacity: 0.8,
            });
            uBuilding.div3d.insertBefore(gui.domElement,uBuilding.div3d.lastChild);
            gui.setZIndex(10);
            gui.show(true);
            gui.remember(pfyj);
            gui.addRadio(pfyj, 'radio', ['on', 'off']);
            gui.setOpacity(0.9);
            gui.__closeButton.onclick = function () {
                uBuilding.show2 = false;
            }
            guis.push(gui);
    }
    return gui;
}

// 界面
function CreateUI(propValue, offsetX, offsetY,display) {
    // var sel1 = app.query({propKey: "物体类型", propValue: propValue});
    var sel1 = app.query('[物体类型='+propValue+']');
    sel1.objects.forEach(function (v) {
        var box = new THREE.Box3().setFromObject(v.node);
        v.addUI(CreateStyle(propValue).domElement, [0, box.getSize().y, 0 ],[0.2,1]);
        var result = app.camera.worldToScreen(v.position);
    });
}
/*获取元素的纵坐标*/
function getTop(e){
    var offset=e.offsetTop;
    if(e.offsetParent!=null){
        offset+=getTop(e.offsetParent);
    }
    return offset;
}
/*获取元素的横坐标*/
function getLeft(e){
    var offset=e.offsetLeft;
    if(e.offsetParent!=null){
        offset+=getLeft(e.offsetParent);
    }
    return offset;
}

// 控制界面
function ShowUIPC() {
    CreateUI( "消防栓",  -65, -100);
    CreateUI( "消防水箱", -65, -50);
    CreateUI( "排烟风机",  -65, -50);
}
// 控制界面
function ShowUIPhone() {
    CreateUI( "消防栓",  -230, -400);
    CreateUI( "消防水箱",  -230, -300);
    CreateUI( "排烟风机",  -230, -300);
}
