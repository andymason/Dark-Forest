/**
 * Dark Forest
 * ===========
 *
 * @author  Andrew Mason
 * @email   andrew@coderonfire.com
 * @www     coderonfire.com
 * @github  
 * 
 * Just having fun with WebGL :D
 *
 * Thanks to PhiloGl for the great framework and http://metamolecular.com for
 * a very good introduction to WebGL.
 *
 * TODO:
 *      - The player rotation and movement is broken and needs fixing.
 *
 */

var ForestGame = (function() {
    var canvas = undefined,
        width = 704,
        height = 480,
        philo = undefined,
        camera = undefined,
        gl = undefined,
        scene = undefined,
        animationLoop = undefined,
        player = {
            'walkingSpeed'  : 0.2,
            'turningSpeed'  : 0.1,
            'directionAngle': 0,
            'directionAngleCount': 0,
            'walking'       : false
        };
    
    var keyMap = {
        'up'    : [87, 38], // w and up arrow
        'down'  : [83, 40], // s and down arrow
        'left'  : [65, 37], // a and left arrow
        'right' : [68, 39]  // d and right arrow
    };

    /**
     * Workout the direction the player should move based on input.
     * @param {int} keyCode event keycode.
     */
    function getInputDirection(keyCode) {
        for (direction in keyMap) {
            for (index in keyMap[direction]) {
                var code = keyMap[direction][index];
                if (code === keyCode) {
                    return direction;
                }
            }
        }
    }

    /**
     * Handle when the player sends input.
     */
    function startMoving(event) {
        var direction = getInputDirection(event.code);
        if (direction === undefined) {
            return;
        }
        
        var cameraPos = camera.position,
            targetPos = camera.target;
        
    
        switch (direction) {
            case 'up':
                cameraPos[2] += player.walkingSpeed;
                break;
            case 'down': 
                cameraPos[2] -= player.walkingSpeed;
                break;
            case 'left':
                // TODO: Fix rotation
                player.directionAngleCount += 0.1;
                player.directionAngle = Math.sin(player.directionAngleCount);
                break;
            case 'right':
                player.directionAngleCount -= 0.1;
                player.directionAngle = Math.sin(player.directionAngleCount);
                break;
        }
        
        // TODO: Fix rotation
        targetPos[0] = Math.asin(player.directionAngle) * 40;
        targetPos[1] = Math.acos(player.directionAngle) * 40;
        
        console.log(targetPos);
        
        moveCamera(cameraPos, targetPos);
        render();
    }
    
    

    /**
     * Handle when the player stops sending input.
     */
    function stopMoving(event) {
        console.log(getInputDirection(event.event.keyCode));
    }
    
    
    /**
     * Setup the graphics layer settings.
     */
    function configureGraphics() {
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0, 0, 0, 1);
        gl.clearDepth(1);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
    }
    
    /**
     * Set the colour and brighness of the scene lights.
     * @param {array} brightness The r,g,b ambient light values.
     * @param {array} colour The r,g,b directional light values.
     */
    function illuminateScene(brightness, colour) {
        scene.config.lights.enable = true;
        scene.config.lights.ambient = {
            r: brightness[0],
            g: brightness[1],
            b: brightness[2]
        };
        scene.config.lights.directional.color = {
            r: colour[0],
            g: colour[1],
            b: colour[2]
        };
    }
    
    /**
     * Aim the scene light to a defined direction.
     * @param {array} direction The x,y,z direction of the scene light.
     * @param {array} direction The x,y,z direction of the scene light.
     */
    function aimLight(direction) {
        scene.config.lights.directional.direction = {
            x: direction[0],
            y: direction[1],
            z: direction[2]
        };
    }
    
    /**
     * Adjust the fog settings in the scene.
     * @param {float} nearDist Where the fog starts.
     * @param {float} farDist Where the fog ends.
     * @param {array} color The r,g,b colour values of the fog.
     */
    function adjustFog(nearDist, farDist, colour) {
        scene.config.effects.fog = {};
        scene.config.effects.fog.near = nearDist;
        scene.config.effects.fog.far = farDist;
        scene.config.effects.fog.color = {
            r: colour[0],
            g: colour[1],
            b: colour[2]
        };
    }
    
    /**
     * Sets the camera to a new position.
     * @param {array} position The x,y,z coordinates of the new position.
     * @param {array} target The x,y coordinates of the new target.
     */
    function moveCamera(position, target) {
        camera.position = position;
        camera.target = [target[0], position[1], target[1]];
        camera.update();
    }
    
    /**
     * Add 3D objects to the scene.
     */
    function addObjects() {
        var ball = new PhiloGL.O3D.Sphere({ nlat: 20, nlong: 20, radius: 1, colors: [1, 1, 1, 1] });
        ball.position = {  x: 0, y: 3, z: 2 };
        ball.update();
        
        
        var cube = new PhiloGL.O3D.Cube({ colors: [1, 1, 1, 1] });
        cube.position = {  x: 3, y: 1, z: 0 };
        // cube.rotation = {  x: 0.4, y: 0, z: 0 };
        cube.update();
        
        var ground = new PhiloGL.O3D.Plane({
            type: 'x,z',
            xlen: 200,
            zlen: 200,
            nx: 5,
            nz: 5,
            offset: 0,
            colors: [1, 1, 1, 1]
        });

        scene.add(ball);
        scene.add(cube);
        scene.add(ground);
    }
    
    /**
     * Run all the setup process for getting the scene ready to render.
     */
    function setUpScene() {
        configureGraphics();
        illuminateScene([0.2, 0.2, 0.2], [0.8, 0.8, 0.8]);
        aimLight([-2, -5, -7]);
        addObjects();
        moveCamera([0, 3, -7], [0, 40]);
        adjustFog(2, 60, [0.3, 0, 0]);
    }
    
    /**
     * Clear the frame and render out the scene.
     */
    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        scene.render();
    }
    
    /**
     * Start animating the scene at 60fps.
     */
    function startAnimation() {
        animationLoop = setInterval(render, 1000/60);
    }
    
    /**
     * Stop animating the scene.
     */
    function stopAnimation() {
        clearInterval(animationLoop);
    }
    
    /**
     * Create a canvas element and add it to the DOM.
     * @return {object} Canvas DOM element.
     */
    function createCanvas() {
        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        var target = document.querySelector('#oldCRT');
        target.appendChild(canvas);
        
        return canvas;
    }
    
    /**
     * Kick everything off and build the scene up.
     */
    function init() {
        canvas = createCanvas();
        
        PhiloGL(canvas, {
            events: {
                'onKeyDown': startMoving,
                'onKeyUp': stopMoving
            },
            onError: function() {
              alert("An error ocurred while loading the application");
            },
            onLoad: function(app) {
                philo = app,
                gl = app.gl,
                scene = app.scene,
                camera = app.camera;
                
                setUpScene();
                startAnimation();
            }
        });
    }
    
    return {
        'init': init
    };
}());

// Lets rock!
ForestGame.init();