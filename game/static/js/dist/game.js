class AcGameMenu{
    constructor(root)
    {
        this.root = root;
        this.$menu = $(`
<div class="ac-game-menu">
    <div class="ac-game-menu-field">
        <div class="ac-game-menu-field-item ac-game-field-item-single-mode">
            单人模式
        </div>
        <br>
        <div class="ac-game-menu-field-item ac-game-field-item-multi-mode">
            多人模式
        </div>
        <br>
        <div class="ac-game-menu-field-item ac-game-field-item-settings">
            设置
        </div>
    </div>
</div>
`);

        this.root.$ac_game.append(this.$menu);
        this.$single_mode = this.$menu.find('.ac-game-field-item-single-mode');
        this.$multi_mode = this.$menu.find('.ac-game-field-item-multi-mode');
        this.$settings = this.$menu.find('.ac-game-field-item-settings');

        this.start();
    }

    start()
    {
        this.add_listening_events();
    }

    add_listening_events()
    {
        let outer = this;
        this.$single_mode.click(function(){
            outer.hide();
            outer.root.playground.show();
        });

        this.$multi_mode.click(function(){
            console.log("multi");
        });

        this.$settings.click(function(){
            console.log("settings");
        });
    }

    show(){
        this.$menu.show();
    }

    hide(){
        this.$menu.hide();
    }

}
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
class FireBall extends AcGameObject{
    constructor(playground, player, x, y, radius, vx, vy, color, speed, move_length)
    {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.player = player;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        console.log("fireball args", x, y);
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;  // 火球的射程, 火球的移动距离
        console.log("init fireball this.move_length",this.move_length);
        this.eps = 0.1;
    }

    start()
    {
    }

    update()
    {
        if(this.move_length < this.eps)
        {
            this.destroy();
            return false;
        }

        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        console.log("fireball update moved", moved);
        console.log("fireball update pos", this.x, this.y);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;

        this.render();
    }

    render(){
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }


}
class GameMap extends AcGameObject{
    constructor(playground){
        super();
        this.playground = playground;
        this.$canvas = $('<canvas></canvas>');
        this.ctx = this.$canvas[0].getContext('2d');
        this.ctx.canvas.width  = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.playground.$playground.append(this.$canvas);
    }

    start(){
    }

    update(){
       this.render();
    }

    render(){
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }


}
class Player extends AcGameObject{
    constructor(playground, x, y, radius, color, speed, is_me){
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.vx = 0;  // x方向上的速度
        this.vy = 0;  // y方向上的速度
        this.move_length = 0;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.is_me = is_me;
        this.eps = 0.1;  // 浮点数运算的精度, < 0.1就算0

        this.cur_skill = null;
    }

    start(){
        console.log("player start");
        if(this.is_me)
        {
            console.log("is_me");
            this.add_listening_events();
        }
    }

    add_listening_events(){
        let outer = this;
        console.log("listening");
        this.playground.game_map.$canvas.on("contextmenu", function(){
            console.log("canvasOn");
            return false;
        });

        this.playground.game_map.$canvas.mousedown(function(e){
            if(e.which === 3)
            {
                outer.move_to(e.clientX, e.clientY);
            } else if(e.which === 1){
                if(outer.cur_skill === "fireball")
                {
                    console.log("skill == fireball");
                    outer.shoot_fireball(e.clientX, e.clientY);
                }
                outer.cur_skill = "";
            }
        });

        $(window).keydown(function(e){
            if(e.which === 81) // q
            {
                console.log("q");
                outer.cur_skill = "fireball";
                return false;
            }
        });
    }

    shoot_fireball(tx, ty){
        let x = this.x, y = this.y;
        console.log("shoot fireball", x, y);
        let radius = this.playground.height * 0.01;
        let angle = Math.atan2(ty -  this.y, tx - this.x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let color = "orange";
        let move_length = this.playground.height * 1.5;
        let speed = this.playground.height * 0.5;
        new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length);
    }

    get_dist(x, y, tx, ty){
        let dx = tx - x;
        let dy = ty - y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        return dist;
    }

    move_to(tx, ty){
        this.move_length = this.get_dist(this.x, this.y, tx, ty);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);
    }

    update(){
        if(this.move_length < this.eps)
        {
            this.move_length = 0;
            this.vx = this.vy = 0;
        }
        else{
            let d = this.speed  * this.timedelta / 1000;
            let moved = Math.min(this.move_length, this.speed  * this.timedelta / 1000);
            this.x += this.vx * moved;
            this.y += this.vy * moved;
            this.move_length -= moved;
        }

//        this.x += this.vx;
//        this.y += this.vy;
        this.render();
    }

    render(){
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

}

class AcGamePlayground{
    constructor(root){
        this.root = root;
        this.$playground = $(`<div class="ac-game-playground"></div>`);

        // this.hide();
        this.root.$ac_game.append(this.$playground);
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);
        this.players = [];
        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "white", this.height * 0.15, true));

        this.start();
    }

    start(){
    }

    show(){
        this.$playground.show();
    }

    hide(){
        this.$playground.hide();
    }
}

export class AcGame {
    constructor(id)
    {
        this.id = id;
        this.$ac_game = $('#' + id);
        // this.menu = new AcGameMenu(this);
        this.playground = new AcGamePlayground(this);

        this.start();
    }

    start(){
    }
}
