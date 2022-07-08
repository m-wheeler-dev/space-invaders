const scoreEl = document.getElementById('scoreEl');
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

class Player {
    constructor() {
        this.velocity = {
            x: 0,
            y: 0
        }

        this.rotation = 0
        this.opacity = 1

        const image = new Image();
        image.src = './images/playership.png'
        image.onload = () => {
            const scale = 0.15;
            this.image = image
            this.width = image.width * scale
            this.height = image.width * scale
            this.position = {
                x: canvas.width / 2 - this.width / 2,
                y: canvas.height - this.height - 20
            }
        }
    }

    draw() {       
        c.save()
        c.globalAlpha = this.opacity
        c.translate(
            player.position.x + player.width / 2, 
            player.position.y + player.height / 2
            )
        c.rotate(this.rotation)

        c.translate(
            -player.position.x - player.width / 2, 
            -player.position.y - player.height / 2
            )

        c.drawImage(
            this.image, 
            this.position.x, 
            this.position.y, 
            this.width, 
            this.height
        )
        c.restore()
    }

    update() {
        if (this.image) {
            this.draw()
            this.position.x += this.velocity.x
        }
    }
}

class Missile {
    constructor({position, velocity}) {
        this.position = position
        this.velocity = velocity

        this.radius = 4
    }

    draw() {
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = 'yellow'
        c.fill()
        c.closePath()
    }

    update() {
    this.draw()
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y
    }
}

class Debris {
    constructor({ position, velocity, radius, color, fades }) {
        this.position = position
        this.velocity = velocity
        this.radius = radius
        this.color = color
        this.opacity = 1
        this.fades = fades
    }

    draw() {
        c.save()
        c.globalAlpha = this.opacity
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = this.color
        c.fill()
        c.closePath()
        c.restore()
    }

    update() {
    this.draw()
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y
    if (this.fades) this.opacity -= 0.01
    }
}

class InvaderMissile {
    constructor({position, velocity}) {
        this.position = position
        this.velocity = velocity
        this.width = 5
        this.height = 8
    }

    draw() {
        c.fillStyle = 'red'
        c.fillRect(this.position.x, this.position.y, this.width, this.height)
    }

    update() {
    this.draw()
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y
    }
}

class Invader {
    constructor({position}) {
        this.velocity = {
            x: 0,
            y: 0
        }

        const image = new Image();
        image.src = './images/alien.png'
        image.onload = () => {
            const scale = 0.025;
            this.image = image
            this.width = image.width * scale
            this.height = image.width * scale
            this.position = {
                x: position.x,
                y: position.y
            }
        }
    }

    draw() {
        c.drawImage(
            this.image, 
            this.position.x, 
            this.position.y, 
            this.width, 
            this.height
        )
    }

    update({ velocity }) {
        if (this.image) {
            this.draw()
            this.position.x += velocity.x
            this.position.y += velocity.y
        }
    }

    shoot(invaderMissiles) {
        invaderMissiles.push(
            new InvaderMissile({
                position: {
                    x: this.position.x + this.width / 2,
                    y: this.position.y + this.height
                }, 
                velocity: {
                    x: 0,
                    y: 5
                }
            })
        )
    }
}

class Grid {
    constructor() {
        this.position = {
            x: 0,
            y: 0
        }

        this.velocity = {
            x: 3,
            y: 0
        }

        this.invaders =[]

        const columns = Math.floor(Math.random() * 10 + 5)
        const rows = Math.floor(Math.random() * 5 + 2)

        this.width = columns * 30

        for (let x = 0; x < columns; x++) {
            for (let y = 0; y < rows; y++) {
                this.invaders.push(
                    new Invader({
                        position: {
                            x: x * 30,
                            y: y * 30
                        }
                    })
                )
            }
        }
    }
    update() {
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        this.velocity.y = 0

        if (this.position.x + this.width >= canvas.width || this.position.x <= 0) {
            this.velocity.x = -this.velocity.x
            this.velocity.y = 30
        }
    }
}

const player = new Player();
const missiles = [];
const grids = [];
const invaderMissiles = [];
const debris = [];

const keys = {
    a: {
        pressed: false
    },
    d: {
        pressed: false
    },
    space: {
        pressed: false
    }
};

let frames = 0;
let game = {
    over: false,
    active: true
};
let score = 0;

// make background stars
for (let i = 0; i < 100; i++) {
    debris.push(
        new Debris({
            position: {
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height
            },
            velocity: {
                x: 0,
                y: 2
            },
            radius: Math.random() * 3,
            color: 'skyblue'
        })
    )
}

function createDebris({object, color, fades}) {
    for (let i = 0; i < 15; i++) {
        debris.push(
            new Debris({
                position: {
                    x: object.position.x + object.width / 2,
                    y: object.position.y + object.height / 2
                },
                velocity: {
                    x: (Math.random() - 0.5) * 3,
                    y: (Math.random() - 0.5) * 3
                },
                radius: Math.random() * 3,
                color: color,
                fades: fades
            })
        )
    }
}

function animate() {
    if (!game.active) return
    requestAnimationFrame(animate)
    c.fillStyle = 'rgb(10, 10, 10)'
    c.fillRect(0, 0, canvas.width, canvas.height)
    player.update()
    debris.forEach((debris, i) => {

        if (debris.position.y - debris.radius >= canvas.height) {
            debris.position.x = Math.random() * canvas.width
            debris.position.y = -debris.radius
        }

        if (debris.opacity <= 0) {
            setTimeout(() => {
                debris.splice(i, 1)
            }, 0)   
        } else {
            debris.update()
        }     
    })

    invaderMissiles.forEach((invaderMissile, index) => {
        if (
            invaderMissile.position.y + invaderMissile.height >= 
            canvas.height
        ) {
            setTimeout(() => {
                invaderMissiles.splice(index,1)
            }, 0)
        } else invaderMissile.update()

        // missile hits player
        if (
            invaderMissile.position.y + invaderMissile.height >= 
            player.position.y && 
            invaderMissile.position.x + invaderMissile.width >= 
            player.position.x && 
            invaderMissile.position.x <= 
            player.position.x + player.width
        ) {
            setTimeout(() => {
                invaderMissiles.splice(index,1)
                player.opacity = 0
                game.over = true
            }, 0)

            setTimeout(() => {
                invaderMissiles.splice(index,1)
                game.active = false
            }, 2000)

            createDebris({
                object: player,
                color: 'red',
                fades: true
            })
        }
    })

    missiles.forEach((missile, index) => {
        if (missile.position.y + missile.radius <= 0) {
            setTimeout(() => {
                missiles.splice(index, 1)
            }, 0)         
        } else {
            missile.update()
        }       
    })

    grids.forEach((grid, gridIndex) => {
        grid.update()

        // invader missiles
        if (frames % 100 === 0 && grid.invaders.length > 0) {
            grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(
                invaderMissiles
            )
        }

        grid.invaders.forEach((invader, i) => {
            invader.update({velocity: grid.velocity})

            // missile hits enemy
            missiles.forEach((missile, j) => {
                if (
                    missile.position.y <= 
                        invader.position.y + invader.height &&
                    missile.position.x + missile.radius >=
                        invader.position.x &&
                    missile.position.x - missile.radius <= 
                        invader.position.x + invader.width &&
                    missile.position.y >= invader.position.y
                ) {
                    setTimeout(() => {
                        const invaderFound = grid.invaders.find(
                            (invader2) =>  invader2 === invader
                            )
                        const missileFound = missiles.find(
                            (missile2) => missile2 === missile
                            )

                        // destroy invader
                        if (invaderFound && missileFound) {
                            score += 100
                            scoreEl.innerHTML = score

                            createDebris({
                                object: invader,
                                color: 'orange',
                                fades: true
                            })

                            grid.invaders.splice(i, 1)
                            missiles.splice(j, 1)

                            if (grid.invaders.length > 0) {
                                const firstInvader = grid.invaders[0]
                                const lastInvader = grid.invaders[grid.invaders.length -1]

                                grid.width = 
                                    lastInvader.position.x - 
                                    firstInvader.position.x + 
                                    lastInvader.width
                                grid.position.x = firstInvader.position.x
                            } else {
                                grids.splice(gridIndex, 1)
                            }
                        }
                    }, 0);
                }
            })
        })
    })

    if (keys.a.pressed && player.position.x >= 0) {
        player.velocity.x = -7
        player.rotation = -0.15
    } else if (
        keys.d.pressed && 
        player.position.x + player.width <= canvas.width
    ) {
        player.velocity.x = 7
        player.rotation = 0.15
    } else {
        player.velocity.x = 0
        player.rotation = 0
    }

    if (frames % 1000 === 0) {
        grids.push(new Grid())
    }

    frames++
}

animate();

addEventListener('keydown', ({ key }) => {
    if (game.over) return
    switch (key) {
        case 'a':
            
            keys.a.pressed = true
            break
        case 'd':
            
            keys.d.pressed = true
            break
        case ' ':
            missiles.push(
                new Missile({
                    position: {
                        x: player.position.x + player.width / 2,
                        y: player.position.y
                    },
                    velocity: {
                        x: 0,
                        y: -10
                    }
                })
            )
            break
    }
})

addEventListener('keyup', ({ key }) => {
    switch (key) {
        case 'a':
            
            keys.a.pressed = false
            break
        case 'd':
            
            keys.d.pressed = false
            break
        case ' ':

            break
    }
})
