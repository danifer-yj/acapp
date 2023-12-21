let AC_GAME_OBJECTS = [];

class AcGameObject{
    constructor(){
        AC_GAME_OBJECTS.push(this);

        this.has_called_start = false;  // 是否执行过start函数
        this.timedelta = 0; // 当前帧距离上一帧的时间间隔 
    }

    // 将本对象的所有进行的动作分成三类：
    // 只在第一帧执行(加载昵称...);每一帧都要执行; 将本对象销毁

    start(){  // 只在第一帧执行
    }

    update(){  // 每一帧都要执行
    }

    on_destroy(){  // 对象被销毁前执行该函数

    }

    destroy(){  // 将对象销毁
        // js中一个对象只要没有变量存储，该对象就被删除掉了
        this.on_destroy();
        for (let i = 0; i < AC_GAME_OBJECTS.length; i ++){
        if(AC_GAME_OBJECTS[i] === this){
                AC_GAME_OBJECTS.splice(i, this);
                break;
            }
        }
    }

}

let last_timestamp;
let AC_GAME_ANIMATION = function(timestamp){
    for (let i = 0; i < AC_GAME_OBJECTS.length; i ++){
        let obj = AC_GAME_OBJECTS[i];
        if(!obj.has_called_start){
            obj.start();
            obj.has_called_start = true;
        }
        else{
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }

    last_timestamp = timestamp;

    requestAnimationFrame(AC_GAME_ANIMATION);
}

// 每一帧循环一边数组中的所有的对象

requestAnimationFrame(AC_GAME_ANIMATION);
