const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')
const gravity = 0.7
const background = new Sprite({
  image: { width: 1024, height: 576 },
  position: { x:0, y: 0 },
  imageSrc: './assets/background.png'
})

canvas.width = 1024
canvas.height = 576

context.fillRect(0, 0, canvas.width, canvas.height)

//------------------------------------------------------------------------------------- PLAYER -------------------------------------------------------------------------------------//

const player = new Fighter({
  position: {
    x: 200, y: 0,
  },
  velocity: {
    x: 0, y: 0,
  },
  offset: {
    x: 0,
    y: 0,
  },
  imageSrc: './assets/gravis/Idle.png',
  framesMax: 4,
  scale: 1,
  offset: { x: 130, y: 110 },
  sprites: {
    idle: { imageSrc: './assets/gravis/Idle.png', framesMax: 4 },
    run: { imageSrc: './assets/gravis/Run.png', framesMax: 9, image: new Image() },
    jump: { imageSrc: './assets/gravis/Jump.png', framesMax: 4 },
    fall: { imageSrc: './assets/gravis/Fall.png', framesMax: 4 },
    attack1: { imageSrc: './assets/gravis/Attack1.png', framesMax: 4 },
    takeHit: { imageSrc: './assets/gravis/TakeHit.png', framesMax: 4 },
    death: { imageSrc: './assets/gravis/Death.png', framesMax: 4 }
  },
  attackBox: {
    offset: { x: -25, y: -20 },
    width: 160,
    height: 70,
  }
})

player.draw();

//-------------------------------------------------------------------------------------- ENEMY -------------------------------------------------------------------------------------//

const enemy = new Fighter({
  position: {
    x: 600, y: 0,
  },
  velocity: {
    x: 0, y: 0,
  },
  offset: {
    x: -50,
    y: 0,
  },
  imageSrc: './assets/beast/Idle.png',
  framesMax: 14,
  scale: 1,
  offset: { x: 150, y: 120 },
  sprites: {
    idle: { imageSrc: './assets/beast/Idle.png', framesMax: 14 },
    run: { imageSrc: './assets/beast/Run.png', framesMax: 8, image: new Image() },
    jump: { imageSrc: './assets/beast/Jump.png', framesMax: 11 },
    fall: { imageSrc: './assets/beast/Fall.png', framesMax: 9 },
    attack1: { imageSrc: './assets/beast/Attack1.png', framesMax: 6 },
    takeHit: { imageSrc: './assets/beast/TakeHit.png', framesMax: 5 },
    death: { imageSrc: './assets/beast/Death.png', framesMax: 10 }
  },
  attackBox: {
    offset: { x: -75, y: -3 },
    width: 100,
    height: 50,
  }
})

enemy.draw()

//------------------------------------------------------------------------------------ ANIMATION -----------------------------------------------------------------------------------//

const keys = {
  a: { pressed: false },
  d: { pressed: false },
  w: { pressed: false },
  ArrowRight: { pressed: false },
  ArrowLeft: { pressed: false },
  ArrowUp: { pressed: false }
}

decreaseTimer()

function animate() {
  window.requestAnimationFrame(animate)
  context.fillStyle = 'black'
  context.fillRect(0, 0, canvas.width, canvas.height)
  background.update()
  context.fillStyle = 'rgba(0, 0, 0, 0.2)'
  context.fillRect(0, 0, canvas.width, canvas.height)
  player.update()
  enemy.update()

  player.velocity.x = 0
  enemy.velocity.x = 0

  // PLAYER MOVEMENT
  
  if (keys.a.pressed && player.lastKey === 'a') {
    player.velocity.x = -5
    player.switchSprite('run')
  } else if (keys.d.pressed && player.lastKey === 'd') {
    player.velocity.x = 5
    player.switchSprite('run')
  } else {
    player.switchSprite('idle')
  }

  if (player.velocity.y < 0) {
    player.switchSprite('jump')
  } else if (player.velocity.y > 0) {
    player.switchSprite('fall')
  }

  // ENEMY MOVEMENT
  if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft') {
    enemy.velocity.x = -5
    enemy.switchSprite('run')
  } else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') {
    enemy.velocity.x = 5
    enemy.switchSprite('run')
  } else {
    enemy.switchSprite('idle')
  }

  if (enemy.velocity.y < 0) {
    enemy.switchSprite('jump')
  } else if (enemy.velocity.y > 0) {
    enemy.switchSprite('fall')
  }

  // DETECT COLLITION
  if (rectangularCollition({ rectangle1: player, rectangle2: enemy }) &&
      player.isAttacking && player.framesCurrent === 2
    ) {
      enemy.takeHit()
      player.isAttacking = false
      gsap.to('#enemyHealth', { width: enemy.health + '%' })
  } if (player.isAttacking && player.framesCurrent === 2) {
    player.isAttacking = false
  } if (rectangularCollition({ rectangle1: enemy, rectangle2: player }) &&
      enemy.isAttacking && enemy.framesCurrent === 2
    ) {
      player.takeHit()
      enemy.isAttacking = false
      gsap.to('#playerHealth', { width: player.health + '%' })
  } if (enemy.isAttacking && enemy.framesCurrent === 2) {
    enemy.isAttacking = false
  } if (enemy.health <= 0 || player.health <= 0) {
      determinateWinner({ player, enemy, timerId })
  }
}

animate()

//------------------------------------------------------------------------------------ MOVEMENT ------------------------------------------------------------------------------------//

window.addEventListener('keydown', (event) => {
  if (!player.death) {
    switch (event.key) {
      case 'd': keys.d.pressed = true
        player.lastKey = 'd'
        break;
      case 'a': keys.a.pressed = true
        player.lastKey = 'a'
        break;
      case 'w': player.velocity.y = -20
        player.lastKey = 'w'
        break;
      case ' ': player.attack()
        break;
    }
  }
  if (!enemy.death) {
    switch (event.key) {
      case 'ArrowRight': keys.ArrowRight.pressed = true
        enemy.lastKey = 'ArrowRight'
        break;
      case 'ArrowLeft': keys.ArrowLeft.pressed = true
        enemy.lastKey = 'ArrowLeft'
        break;
      case 'ArrowUp': enemy.velocity.y = -20
        enemy.lastKey = 'ArrowUp'
        break;
      case '+': enemy.attack()
        break;
    }
  }
})

window.addEventListener('keyup', (event) => {
  switch (event.key) {                // <-- PLAYER
    case 'd': keys.d.pressed = false
    break;
    case 'a': keys.a.pressed = false
    break;
    case 'w': keys.w.pressed = false
    break;
  }
  switch (event.key) {                // <-- ENEMY
    case 'ArrowRight': keys.ArrowRight.pressed = false
    break;
    case 'ArrowLeft': keys.ArrowLeft.pressed = false
    break;
    case 'ArrowUp': keys.ArrowUp.pressed = false
    break;
  }
})