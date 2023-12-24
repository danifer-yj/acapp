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
        }else{
            let tx = Math.random() * this.playground.width;
            let ty = Math.random() * this.playground.height;
            console.log("amlemi", tx, ty);
            this.move_to(tx, ty);
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
            if(!this.is_me)
            {
                let tx = Math.random() * this.playground.width;
                let ty = Math.random() * this.playground.height;
                this.move_to(tx, ty);
            }
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

