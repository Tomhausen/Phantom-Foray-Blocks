namespace SpriteKind {
    export const melee = SpriteKind.create()
}
function remove_upgrade_from_list (item_text: string) {
    for (let value of menu_upgrades) {
        if (miniMenu.getMenuItemProperty(value, MenuItemProperty.Text) == item_text) {
            menu_upgrades.removeAt(menu_upgrades.indexOf(value))
        }
    }
}
statusbars.onStatusReached(StatusBarKind.Magic, statusbars.StatusComparison.EQ, statusbars.ComparisonType.Percentage, 100, function (status) {
    xp_bar.value = 0
    open_level_up_menu()
})
function select_upgrade (selection: string) {
    if (selection == "attack damage") {
        attack_damage += 10
    }
    if (selection == "hp") {
        health_bar.max += 10
        health_bar.value += 10
    }
    if (selection == "cooldown") {
        cooldown = cooldown * 0.95
        cooldown = Math.constrain(cooldown, 500, 5000)
    }
    if (selection == "ranged attack") {
        remove_upgrade_from_list("ranged attack")
        ranged_attack_loop()
    }
    sprites.allOfKind(SpriteKind.MiniMenu)[0].destroy()
}
sprites.onOverlap(SpriteKind.Enemy, SpriteKind.melee, function (enemy, proj) {
    enemy_take_damage(enemy, proj)
})
function setup_status_bars () {
    health_bar = statusbars.create(60, 4, StatusBarKind.Health)
    health_bar.left = 0
    health_bar.top = 0
    xp_bar = statusbars.create(160, 4, StatusBarKind.Magic)
    xp_bar.bottom = 120
    xp_bar.value = 0
}
sprites.onOverlap(SpriteKind.Enemy, SpriteKind.Projectile, function (sprite, otherSprite) {
    enemy_take_damage(sprite, otherSprite)
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function (player2, enemy) {
    health_bar.value += -10
    pause(500)
})
statusbars.onZero(StatusBarKind.Health, function (status) {
    game.over(false)
})
function base_attack_loop () {
    if (last_vx > 0) {
        animation.runImageAnimation(
        melee_attack,
        assets.animation`fireball right`,
        100,
        false
        )
    } else {
        animation.runImageAnimation(
        melee_attack,
        assets.animation`fireball left`,
        100,
        false
        )
    }
    timer.after(cooldown, function () {
        base_attack_loop()
    })
}
function enemy_take_damage (enemy: Sprite, proj: Sprite) {
    damage = Math.idiv(randint(attack_damage * 0.75, attack_damage * 1.25), 1)
    sprites.changeDataNumberBy(enemy, "hp", damage * -1)
    if (sprites.readDataNumber(enemy, "hp") < 1) {
        enemy.destroy()
        info.changeScoreBy(100)
        xp_bar.value += 10
    }
}
function setup_variables () {
    last_vx = 100
    attack_damage = 10
    cooldown = 2000
    enemy_health = 5
    enemy_damage = 10
    enemies_spawn = 2
    menu_upgrades = [
    miniMenu.createMenuItem("hp"),
    miniMenu.createMenuItem("attack damage"),
    miniMenu.createMenuItem("cooldown"),
    miniMenu.createMenuItem("ranged attack")
    ]
}
function open_level_up_menu () {
    upgrades = []
    while (upgrades.length < 3) {
        upgrade = menu_upgrades._pickRandom()
        if (upgrades.indexOf(upgrade) >= 0) {
            continue;
        }
        upgrades.push(upgrade)
    }
    upgrade_menu = miniMenu.createMenuFromArrayAndPauseGame(upgrades)
    upgrade_menu.setFlag(SpriteFlag.RelativeToCamera, true)
    upgrade_menu.onButtonPressed(controller.A, function (selection, selectionIndex) {
        select_upgrade(selection)
    })
}
function ranged_attack_loop () {
    proj = sprites.create(assets.image`proj`, SpriteKind.Projectile)
    proj.setPosition(witch.x, witch.y)
    proj.lifespan = 5000
    target = spriteutils.sortListOfSpritesByDistanceFrom(witch, sprites.allOfKind(SpriteKind.Enemy))[0]
    angle = spriteutils.angleFrom(witch, target)
    spriteutils.setVelocityAtAngle(proj, angle, 200)
    timer.after(cooldown, function () {
        ranged_attack_loop()
    })
}
function setup_sprites () {
    witch = sprites.create(assets.image`witch`, SpriteKind.Player)
    controller.moveSprite(witch)
    scene.cameraFollowSprite(witch)
    melee_attack = sprites.create(image.create(16, 16), SpriteKind.melee)
    melee_attack.scale = 2
}
let enemy: Sprite = null
let angle = 0
let target: Sprite = null
let witch: Sprite = null
let proj: Sprite = null
let upgrade_menu: miniMenu.MenuSprite = null
let upgrade: miniMenu.MenuItem = null
let upgrades: miniMenu.MenuItem[] = []
let enemies_spawn = 0
let enemy_damage = 0
let enemy_health = 0
let damage = 0
let melee_attack: Sprite = null
let last_vx = 0
let health_bar: StatusBarSprite = null
let attack_damage = 0
let xp_bar: StatusBarSprite = null
let menu_upgrades: miniMenu.MenuItem[] = []
let cooldown = 0
tiles.setCurrentTilemap(tilemap`level`)
setup_sprites()
setup_status_bars()
setup_variables()
timer.after(cooldown, function () {
    base_attack_loop()
})
game.onUpdate(function () {
    if (Math.abs(witch.vx) != 0) {
        last_vx = witch.vx
    }
    melee_attack.setPosition(witch.x, witch.y)
})
game.onUpdateInterval(1000, function () {
    if (sprites.allOfKind(SpriteKind.Enemy).length < 50) {
        for (let index = 0; index < enemies_spawn; index++) {
            enemy = sprites.create(assets.image`ghost`, SpriteKind.Enemy)
            tilesAdvanced.placeOnRandomTileOffScreen(enemy, assets.tile`dirt`)
            enemy.follow(witch, 20)
            sprites.setDataNumber(enemy, "hp", randint(enemy_health * 0.75, enemy_health * 1.25))
        }
    }
})
