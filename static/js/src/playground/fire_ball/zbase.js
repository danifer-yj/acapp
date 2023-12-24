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
