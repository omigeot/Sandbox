var avatarDef = {
    "extends": "character.vwf",
    "source": "./avatars/AA_Soldier_Male1.DAE",
    "type": "subDriver/threejs/asset/vnd.collada+xml",
    "properties": {
        "PlayerNumber": "Rob",
        "isDynamic": true,
        "castShadows": true,
        "receiveShadows": true,
        "activeCycle": [],
        "standingOnID": null,
        "standingOnOffset": null,
        "___physics_activation_state": 4,
        "___physics_deactivation_time": 0,
        "___physics_velocity_linear": [
            0,
            0,
            0
        ],
        "___physics_velocity_angular": [
            0,
            0,
            0
        ],
        "___physics_factor_linear": [
            0,
            0,
            0
        ],
        "___physics_factor_angular": [
            0,
            0,
            0
        ],
        "___physics_enabled": true,
        "___physics_mass": 100,
        "transform": [
            1,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            1
        ],
        "cycles": {
            "stand": {
                "start": 1,
                "length": 0,
                "speed": 1.25,
                "current": 0,
                "loop": true
            },
            "walk": {
                "start": 6,
                "length": 27,
                "speed": 1,
                "current": 0,
                "loop": true
            },
            "straferight": {
                "start": 108,
                "length": 16,
                "speed": 1.5,
                "current": 0,
                "loop": true
            },
            "strafeleft": {
                "start": 124,
                "length": 16,
                "speed": -1.5,
                "current": 0,
                "loop": true
            },
            "walkback": {
                "start": 0,
                "length": 30,
                "speed": -1.25,
                "current": 0,
                "loop": true
            },
            "run": {
                "start": 70,
                "length": 36,
                "speed": 1.25,
                "current": 0,
                "loop": true
            },
            "jump": {
                "start": 70,
                "length": 36,
                "speed": 1.25,
                "current": 0,
                "loop": false
            },
            "runningjump": {
                "start": 109,
                "length": 48,
                "speed": 1.25,
                "current": 0,
                "loop": false
            }
        },
        "materialDef": {
            "color": {
                "r": 1,
                "g": 1,
                "b": 1
            },
            "ambient": {
                "r": 1,
                "g": 1,
                "b": 1
            },
            "emit": {
                "r": 0.27058823529411763,
                "g": 0.2549019607843137,
                "b": 0.2549019607843137
            },
            "specularColor": {
                "r": 0.2,
                "g": 0.2,
                "b": 0.2
            },
            "specularLevel": 1,
            "alpha": 1,
            "shininess": 0,
            "side": 0,
            "reflect": 0,
            "layers": [
                {
                    "mapTo": 1,
                    "scalex": 1,
                    "scaley": 1,
                    "offsetx": 0,
                    "offsety": 0,
                    "alpha": 1,
                    "src": "./avatars/AA_Soldier_Male1-1.jpg",
                    "mapInput": 0
                }
            ],
            "type": "phong",
            "depthtest": true,
            "morphTargets": true
        },
        "standing": 0,
        "owner": "Rob",
        "ownerClientID": [
            "MmRkODT86WFMSuVOAAAA"
        ],
        "scale": [
            1,
            1,
            1
        ]
    },
    "events": {
        "ShowProfile": null,
        "Message": null
    },
    "scripts": [
        "this.ShowProfile = function(){if(vwf.client() != vwf.moniker()) return; _UserManager.showProfile(this.ownerClientID[0])     }; \nthis.Message = function(){if(vwf.client() != vwf.moniker()) return; setupPmWindow(this.ownerClientID[0])     }"
    ],
    "children": {
        "collision": {
            "extends": "box2.vwf",
            "source": "vwf/model/threejs/box.js",
            "type": "subDriver/threejs",
            "properties": {
                "___physics_activation_state": 1,
                "___physics_deactivation_time": 0,
                "___physics_velocity_linear": [
                    0,
                    0,
                    0
                ],
                "___physics_velocity_angular": [
                    0,
                    0,
                    0
                ],
                "DisplayName": "CharacterCollision",
                "_length": 0.8,
                "height": 1.54,
                "isSelectable": false,
                "owner": "Rob",
                "transform": [
                    1,
                    0,
                    0,
                    0,
                    0,
                    1,
                    0,
                    0,
                    0,
                    0,
                    1,
                    0,
                    0,
                    0,
                    0.8009999394416809,
                    1
                ],
                "type": "Primitive",
                "width": 0.62,
                "visible": false,
                "___physics_enabled": true
            }
        }
    }
}

exports.getDefaultAvatarDef = function(){return JSON.parse(JSON.stringify(avatarDef));}