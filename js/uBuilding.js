var app;
window.onload = function () {
    app = new t3d.App({
        el: "div3d",
        skyBox:'BlueSky',
        url: "https://speech.uinnova.com/static/models/dBuilding",
        complete: function () {
            console.log("app scene loaded");
            
            ShowAllFloor();
            /* 显示所有楼层 */
            ClickButtons();
            /* 注册按钮点击事件 */
        }
    });
}
function ClickButtons() {
    
    var div3d = document.getElementById('div3d');
    div3d.style.width = window.innerWidth;
    div3d.style.height = window.innerHeight;
    
    if(window.innerWidth >= 600)
        ShowUIPC();
    else
        ShowUIPhone();
    
    clickFloorButton('1FBtn');
    clickFloorButton('2FBtn');
    clickFloorButton('3FBtn');
    clickFloorButton('4FBtn');
    clickFloorButton('5FBtn');
    clickAllFloorButton();
    clickWarningButton();
    
}
function clickPanelButton(){
    document.getElementById('消防栓Btn').addEventListener("click",function () {
        for(var i =0;i<guis.length;i++){
            if(guis[i].name==="消防栓")
                guis[i].domElement.style.display = guis[i].domElement.style.display === 'none' ? 'block' : 'none';
        }
    });
    document.getElementById('消防水箱Btn').addEventListener("click",function () {
        for(var i =0;i<guis.length;i++){
            if(guis[i].name==="消防水箱")
                guis[i].domElement.style.display = guis[i].domElement.style.display === 'none' ? 'block' : 'none';
        }
    });
    document.getElementById('排烟风机Btn').addEventListener("click",function () {
        for(var i =0;i<guis.length;i++){
            if(guis[i].name==="排烟风机")
                guis[i].domElement.style.display = guis[i].domElement.style.display === 'none' ? 'block' : 'none';
        }
    });
}

// 点击显隐楼层的按钮
function clickFloorButton(btnID) {
    
    var btn = document.getElementById(btnID);
    
    btn.onclick = function () {
        var str = btnID;
        str = str.replace(/FBtn/, '');
        ShowThisFloor(Number(str));
        app.camera.orbit.enableRotate = true;
    }
}

// 点击显示全部楼层的按钮
function clickAllFloorButton() {
    
    var btn = document.getElementById('AllFBtn');
    
    btn.onclick = function () {
        ShowAllFloor();
        app.camera.orbit.enableRotate = true;
    }
}

// 点击警报按钮
function clickWarningButton() {
    
    // 弹出框
    var btn = document.getElementById('WarningBtn');
    btn.onclick = function () {
        setTimeout("alertWindow()", 3000);
        app.camera.orbit.enableRotate = true;
    }
    
}

function alertWindow() {
    alertMsg("检测到异常，是否查看", 1, "Warning");
}

var timer = null;
var img;

// 警报后
function Warning() {
    
    var objName = new Array();
    objName[0] = "消防栓";
    objName[1] = "消防水箱";
    objName[2] = "排烟风机";
    
    // var objs = app.query({propKey: "物体类型", propValue: objName[rnd(0, objName.length - 1)]});
    var objs = app.query('[物体类型='+objName[rnd(0, objName.length - 1)]+']')
    var obj = objs[0];
    img = document.getElementById('imageTest');
    //img.style.display = 'block';
    var ui = app.create({
        type: 'UI',
        el: img,
        offset: [-30, -30],
        parent: obj
    });
    console.log(ui);
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
        position: [ubPOS[0], ubPOS[1]+27.64, ubPOS[2]-50],
        target: [ubPOS[0],ubPOS[1],ubPOS[2]],
        time: 1200
    });
}

// 仅显示/聚焦某层
function ShowThisFloor(number) {
    
    // 隐藏建筑最外层
    app.buildings[0].node.children[1].visible = false;
    
    // 隐藏消防栓等
    // var temp = app.query({propKey: "物体类型"});
    var temp = app.query('[物体类型]');
    temp.objects.forEach(function (obj) {
        obj.visible = false;
    });
    
    
    /* 控制 app.buildings[0].node.children[0]的 children 显隐更靠谱 */
    var node = app.buildings[0].node.children[0].children;
    
    for (var i = 0; i < node.length; i++) {
        node[i].visible = false;
    }
    if (number === 1) {
        node[0].visible = true;
        node[1].visible = true;
        app.buildings[0].floors[0].roofNodes[0].visible = false;
        app.buildings[0].floors[1].roofNodes[0].visible = false;
    } else {
        node[number].visible = true;
        app.buildings[0].floors[number].roofNodes[0].visible = false;
    }
    flytoTarget(number);
}

// 摄像机飞向目标点
function flytoTarget(number) {
    app.camera.flyTo({
        position: [ubPOS[0], ubPOS[1]+12.28 + ( number - 1 ) * 2.5,  ubPOS[2]-27.82],
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
            gui.remember(xfs);
            gui.add(xfs, 'hydraulicPressure').name('水压');
            gui.setOpacity(0.9);
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
            gui.remember(xfsx);
            gui.add(xfsx, 'waterlevel').name('水位');
            gui.setOpacity(0.9);
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
            gui.remember(pfyj);
            gui.addRadio(pfyj, 'radio', ['on', 'off']);
            gui.setOpacity(0.9);
            guis.push(gui);
    }
    return gui;
}

// 界面
function CreateUI(propValue, offsetX, offsetY) {
    // var sel1 = app.query({propKey: "物体类型", propValue: propValue});
    var sel1 = app.query('[物体类型='+propValue+']');
    sel1.objects.forEach(function (v) {
        app.create({
            type: 'UI',
            el: CreateStyle(propValue).domElement,
            offset: [offsetX, offsetY],
            parent: v
        });
    });
}

// 控制界面
function ShowUIPC() {
    CreateUI( "消防栓",  -65, -100);
    CreateUI( "消防水箱", -65, -50);
    CreateUI( "排烟风机",  -65, -50);
    clickPanelButton();
}
// 控制界面
function ShowUIPhone() {
    CreateUI( "消防栓",  -230, -400);
    CreateUI( "消防水箱",  -230, -300);
    CreateUI( "排烟风机",  -230, -300);
}