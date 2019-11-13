////////////////////////////////////////////////////////////////////////////////
//
//  Astronaute Engine v.0.6.0
//
//  Author: Christophe Leblanc < christopheleblanc@gmx.com >
//  Web: http://cjpl.ws
//
//  Description: Basic framework for canvas animation/game.
//  
//  Last updates:   
//                  -February, 23, 2019 (Adding of comments and improvements on readability)
//                  -March, 29, 2018
//                  -March, 28, 2018
//                  -March, 25, 2018
//                  -March, 23, 2018
//  
//  TODO: ...all?
//  
//  Notes:  -This version use a loop that don't simulate the time passed between
//      the update and the draw. 
//  
//  License: This code is released under the MIT License:
//  
//  Copyright 2018 Christophe Leblanc
//
//  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated 
//  documentation files (the "Software"), to deal in the Software without restriction, 
//  including without limitation the rights to use, copy, modify, merge, publish, 
//  distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software 
//  is furnished to do so, subject to the following conditions:
//
//  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
//  INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. 
//  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, 
//  WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE 
//  OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. 
//
////////////////////////////////////////////////////////////////////////////////





/*
 * AstronauteEngine: the main class.
 * @param {object} canvas - The DOM object of the canvas used by the engine
 * @param {number} width - The width of the canvas
 * @param {number} height - The height of the canvas
 * @param {function} loopFunction - The function called at each update
 * @returns {AstronauteEngine}
 */
function AstronauteEngine(canvas, width, height, loopFunction) {
    
    this.canvas = canvas;
    this.scene = false;
    this.screen = new AstronauteEngine.Screen(canvas, width, height);
    this.drawer = new AstronauteEngine.Drawer(this);
    this.timer = new AstronauteEngine.Timer(this, loopFunction);
    this.sequencer = new AstronauteEngine.Sequencer();
    this.loader = new AstronauteEngine.ResourcesLoader(canvas);
    
}

/*
 * Get the drawer of the engine
 * @returns {object} The drawer
 */
AstronauteEngine.prototype.getDrawer = function(){
    return this.drawer;
};

/*
 * Get the timer / clock of the engine
 * @returns {object} The timer
 */
AstronauteEngine.prototype.getTimer = function(){
    return this.timer;
};


/*
 * Get the number of "scratchs" since the engine has been started
 * @returns {number} The number of "scratchs"
 */
AstronauteEngine.prototype.getScratchs = function(){
    return this.timer.nScratchs;
}

/*
 * Load a scene
 * @param {object} scene - The scene to load
 */
AstronauteEngine.prototype.loadScene = function(scene){
    this.scene = scene;
    this.drawer.setScene(scene);
    this.loader.startLoadingScene(scene);
}

/*
 * Pause the engine
 */
AstronauteEngine.prototype.pause = function(){
    this.timer.pause();
}

/*
 * Prepare to start (If used, this function must be called before starting the engine)
 */
AstronauteEngine.prototype.prepareToStart = function(){
    if(!this.sequencer.isEmpty()){
        this.sequencer.prepareToStart();
    }
}

/*
 * Resume the engine
 */
AstronauteEngine.prototype.resume = function(){
    this.timer.resume();
}

/*
 * Set the rendering mode
 * @param {string} mode - The rendering mode
 */
AstronauteEngine.prototype.setRenderingMode = function(mode){
    this.drawer.setRenderingMode(mode);
}

/*
 * Start the engine
 */
AstronauteEngine.prototype.start = function(){

    this.timer.startInterval();

}

/*
 * Update the engine
 */
AstronauteEngine.prototype.update = function(){

    this.loader.update();
    this.sequencer.update();
    this.scene.update();

};










/*
 * Engine globals
 */

//Constants 
AstronauteEngine.UPDATES_PER_SECOND = 60;
AstronauteEngine.TIME_INTERVAL = 1000 / AstronauteEngine.UPDATES_PER_SECOND;
AstronauteEngine.TIME_INTERVAL_OUT = (AstronauteEngine.TIME_INTERVAL * 96.5) / 100;

//Enums
AstronauteEngine.NODETYPES = {"GROUP":1, "TEXT":2, "IMAGE":3, "SHAPE":4};
AstronauteEngine.ANIMTYPES = {"TRANSLATION":1, "ROTATION":2, "ZOOM":3, "OPACITY":4, "CSSFILTER":5};
AstronauteEngine.SEQUENCETYPES = {"AUTO":1, "FREE":0};










/*
 * Drawer: the class of the drawer.
 * @param {object} engine - The parent engine of this timer
 * @returns {AstronauteEngine.Drawer}
 */
AstronauteEngine.Drawer = function(engine){
    
    this.engine = engine;
    this.clipping = true;
    this.scene = false;

}

/*
 * Draw the content
 * @param {number} delta - The delta time between two draw
 */
AstronauteEngine.Drawer.prototype.draw = function(delta) {

    var ctx = this.engine.canvas.getContext("2d");

    var width = this.engine.canvas.width;
    var height = this.engine.canvas.height;

    //Clear the view
    ctx.clearRect(0, 0, width, height);

    // Clipping
    if(this.clipping){
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, width, height);
        ctx.clip();
    }


    if(this.scene != false){

        //Draw background
        var back = this.scene.getBackground();
        if(back != false){
            back.draw(ctx, width, height);
        }

        //Draw Scene
        var root = this.scene.getRoot();
        if(!root.isEmpty()){
            root.draw(ctx, delta);
        }

        //Draw Front
        var front = this.scene.getFront();
        if(front != false){
            front.draw(ctx, width, height);
        }

    }

    if(this.clipping){
        ctx.restore();
    }


};

/*
 * Get the scene to display
 * @returns {object} The scene of the engine
 */
AstronauteEngine.Drawer.prototype.getScene = function(){
    return this.scene;
}

/*
 * Set the scene to display
 * @param {object} scene - The scene
 */
AstronauteEngine.Drawer.prototype.setScene = function(scene){
    this.scene = scene;
}

/*
 * Set the rendering mode
 * @param {string} node - The rendering mode
 */
AstronauteEngine.Drawer.prototype.setRenderingMode = function(mode){
        
    if(mode == "auto" || "bicubic" || "quality"){
        //Image rendering: BICUBIC/AUTO
        this.engine.canvas.style['image-rendering'] = 'auto';
        this.engine.canvas.style.msInterpolationMode = 'bicubic';
    }
    else if(mode == "crisp" || "pixelated" || "speed"){
        //Image rendering: CRISP
        var types = [ 'optimizeSpeed', 'crisp-edges', '-moz-crisp-edges', '-webkit-optimize-contrast', 'optimize-contrast', 'pixelated' ];
        types.forEach(function (type){
            this.engine.canvas.style['image-rendering'] = type;
        });
        this.engine.canvas.style.msInterpolationMode = 'nearest-neighbor';
    }

}










/*
 * AEResourcesLoader: Used by the engine when adding a scene, group or node, 
 * to compute the client resource loading time, to know/show loading state 
 * and/or wait loading completion.
 * @param {object} canvas - The DOM object of the canvas used by the engine
 * @returns {AstronauteEngine.ResourcesLoader}
 */
AstronauteEngine.ResourcesLoader = function(canvas){
    
    this.complete = false;//bool: when all resources are loadeds
    this.loading = false;//bool: when loader is loading but not complete
    this.resources = [];

    this.totalToLoad = 0;//int: will count the total to load
    this.nLoaded = 0;//int: will count the loadeds elements
    this.percentageLoaded = 0;//float: will be compute the percentage of loaded resources on each "update()"
    
}

/*
 * Function called when a resource is loaded
 * @param {object} node - The loaded scene node
 */
AstronauteEngine.ResourcesLoader.prototype.onResourceLoaded = function(node){
    this.nLoaded++;//Add loaded
    node.onLoad();//Call the onLoad() function of the node
}

/*
 * Add a node
 * @param {object} node - A scene node to add
 */
AstronauteEngine.ResourcesLoader.prototype.add = function(node){
    if(node.type == AstronauteEngine.NODETYPES.IMAGE){
        this.totalToLoad++;
        node.img.onload = () => {this.onResourceLoaded(node);}// Arrow function
    }
}

/*
 * Clear the loader
 */
AstronauteEngine.ResourcesLoader.prototype.clear = function(){
    this.resources = [];
}

/*
 * Load a node
 * @param {object} node - A scene node to load
 */
AstronauteEngine.ResourcesLoader.prototype.loadNode = function(node){
    if(node.type == AstronauteEngine.NODETYPES.GROUP){
        for(var i = 0, len = node.size(); i < len; i++){
            this.loadNode(node.get(i));
        }
    }
    else{
        this.add(node);
    }

}

/*
 * Start loading a scene
 */
AstronauteEngine.ResourcesLoader.prototype.startLoadingScene = function(scene){

    //console.log("StartLoading:-------------------");

    this.complete = false;
    this.loading = true;
    this.totalToLoad = 0;
    this.nLoaded = 0;
    this.percentageLoaded = 0;

    var root = scene.getRoot();
    if(!root.isEmpty()){
        this.loadNode(root);
    }
    
}

/*
 * Update
 */
AstronauteEngine.ResourcesLoader.prototype.update = function(){
    if(this.loading){
        if(this.nLoaded != this.totalToLoad){
            this.percentageLoaded = ( (this.nLoaded / this.totalToLoad) * 100);
        }
        else{
            //console.log("Loading ok:-------------------");
            this.percentageLoaded = ( (this.nLoaded / this.totalToLoad) * 100);
            this.complete = true;
            this.loading = false;
        }
    }

}

/*
 * Check if the loading process is complete
 * @returns {boolean} True of False
 */
AstronauteEngine.ResourcesLoader.prototype.isComplete = function(){
    return this.complete;
}

/*
 * Check if the program is loading resources
 * @returns {boolean} True of False
 */
AstronauteEngine.ResourcesLoader.prototype.isLoading = function(){
    return this.loading;
}

/*
 * Get the percentage of the loading
 * @returns {number} The percentage of the loading
 */
AstronauteEngine.ResourcesLoader.prototype.getPercentageLoaded = function(){
    return this.percentageLoaded;
}










/*
 * Screen: The class representating the canvas/screen used by the engine.
 * @param {object} canvas - The DOM object of the canvas used by the engine
 * @param {number} width - The width of the canvas
 * @param {number} height - The height of the canvas
 * @returns {AstronauteEngine.Screen}
 */
AstronauteEngine.Screen = function(canvas, width, height){
    
    var th_ = this;
    
    this.canvas = canvas;
    
    canvas.width = width;
    canvas.height = height;
    
    this.fsState = false;
    var fsRealState = false;
    
    this.styleWidth = canvas.style.width;
    this.styleHeight = canvas.style.height;
    this.styleMargin = canvas.style.margin;
    this.styleDisplay = canvas.style.display;
    
    var orientation = (canvas.width >= canvas.height) ? 0 : 1;//0 = horizontal, 1 = vertical
    
    this.fsWidth = (orientation == 0) ? window.screen.height * (canvas.width/canvas.height) : window.screen.width;
    this.fsHeight = (orientation == 0) ? window.screen.height : window.screen.width*(canvas.height/canvas.width);
    
    var stretch = false;
    
    function onFullScreenChange(){
        if (document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement !== null){
            fsRealState = !fsRealState;
            if(fsRealState == false){
                th_.exitFullScreen();
                th_.fsState = false;
            }
        }
    }
    
    //Add Listener on FullScreen Event
    canvas.addEventListener('webkitfullscreenchange', onFullScreenChange, false);
    canvas.addEventListener('mozfullscreenchange', onFullScreenChange, false);
    canvas.addEventListener('fullscreenchange', onFullScreenChange, false);
    canvas.addEventListener('MSFullscreenChange', onFullScreenChange, false);
    
}

/*
 * Display the canvas in fullscreen mode.
 */
AstronauteEngine.Screen.prototype.enterFullScreen = function(){

    this.fsState = true;

    //Cross Browser requestFullscreen

    if(this.canvas.requestFullscreen){
        this.canvas.requestFullscreen();
    }
    else if(this.canvas.msRequestFullscreen){
        this.canvas = document.body; //overwrite the element (for IE)
        this.canvas.msRequestFullscreen();
    }
    else if(this.canvas.mozRequestFullScreen){
        this.canvas.mozRequestFullScreen();
    }
    else if(this.canvas.webkitRequestFullScreen){
        this.canvas.webkitRequestFullScreen();

        //Stretch
        if(this.stretch){
            this.canvas.style.width = "100%";
            this.canvas.style.height = "100%";
            this.canvas.style.margin = "0 auto";
            this.canvas.style.display = "block";
        }
        //Fit to screen
        else{
            this.canvas.style.width = this.fsWidth + "px";
            this.canvas.style.height = this.fsHeight + "px";
        }


    }

}

/*
 * Exit the fullscreen mode
 */
AstronauteEngine.Screen.prototype.exitFullScreen = function(){
        
    //Cross Browser quitFullScreen

    if(document.fullscreenElement){
        document.exitFullscreen();
    }
    else if(document.msExitFullscreen){
        document.msExitFullscreen();
        document = canvas;
    }
    else if(document.mozCancelFullScreen){
        document.mozCancelFullScreen();
    }
    else if(document.webkitCancelFullScreen){
        document.webkitCancelFullScreen();
        this.canvas.style.width = this.styleWidth;
        this.canvas.style.height = this.styleHeight;
        this.canvas.style.margin = this.styleMargin;
        this.canvas.style.display = this.styleDisplay;
    }

}

/*
 * Check if the canvas is displayed in fullscreen or not
 * @returns {boolean} True or False
 */
AstronauteEngine.Screen.prototype.isFullScreen = function(){
    return this.fsState;
}

/*
 * Timer: the class of the timer
 * @param {object} engine - The parent engine of this timer
 * @param {function} loopFunction - The function called at each update
 * @returns {AstronauteEngine.Timer}
 */
AstronauteEngine.Timer = function(engine, loopFunction){
    
    this.engine = engine;
    this.loopFunction = loopFunction;
    
    this.deltaTransposition;
    this.lastFrameTime;
    this.delta;
    this.secondsTime;
    this.nScratchs = 0;
    this.running = false;
    
}

/*
 * Get the current timestamp
 */
AstronauteEngine.Timer.timestamp = function() {
    return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
};

/*
 * Start the timer
 */
AstronauteEngine.Timer.prototype.startInterval = function(){
    this.running = true;
    //setInterval(loopFunction, AstronauteEngine.TIME_INTERVAL);
    this.lastFrameTime = AstronauteEngine.Timer.timestamp();
    this.delta = 0;
    this.deltaTransposition = 0;
    this.secondsTime = this.lastFrameTime;
    this.frame();
};

/*
 * Resume the timer
 */
AstronauteEngine.Timer.prototype.resume = function(){
    this.running = true;
    this.frame();//Restart "frame"
};

/*
 * Pause the timer
 */
AstronauteEngine.Timer.prototype.pause = function(){
    this.running = false;
};

/*
 * Reset the dalta time
 */
AstronauteEngine.Timer.prototype.resetDelta = function(){
    this.delta = 0;
}

/*
 * Function called at each update
 */
AstronauteEngine.Timer.prototype.frame = function() {
    
    
    if(this.running == true){
        requestAnimationFrame(() => this.frame()); // Arrow function
    }

    //Get the current time
    var nowTime = AstronauteEngine.Timer.timestamp();

    //Get the time elapsed since the last time in milliseconds
    this.delta += nowTime - this.lastFrameTime;


    while (this.delta >= AstronauteEngine.TIME_INTERVAL) {

        //Update
        this.loopFunction();
        this.engine.update();

        this.delta -= AstronauteEngine.TIME_INTERVAL;

        if (this.delta >= AstronauteEngine.TIME_INTERVAL*20) {
            this.delta = AstronauteEngine.TIME_INTERVAL;
            break;
        }
    }

    this.delta -= this.deltaTransposition;

    if(this.delta >= AstronauteEngine.TIME_INTERVAL_OUT){
        this.nScratchs += Math.round(this.delta / AstronauteEngine.TIME_INTERVAL_OUT);
        this.deltaTransposition = (AstronauteEngine.TIME_INTERVAL + 1) - this.delta;
        this.delta = AstronauteEngine.TIME_INTERVAL;
    }
    else{
        this.deltaTransposition = 0;
    }

    //Render
    this.engine.drawer.draw(this.delta / AstronauteEngine.TIME_INTERVAL);

    this.lastFrameTime = nowTime;

};




/*
 * AstronauteEngine.Scene: The scene object, containing the main group node, the background
 * the front.
 * @returns {AstronauteEngine.Scene}
 */
AstronauteEngine.Scene = function(){
    this.background = false;
    this.front = false;
    this.root = new AstronauteEngine.Group();
}

/*
 * Set the background node of the scene
 * @param {object} background - The node to add
 */
AstronauteEngine.Scene.prototype.setBackground = function(background){
    this.background = background;
}

/*
 * Get the background node of the scene
 * @returns {object} The background node of the scene
 */
AstronauteEngine.Scene.prototype.getBackground = function(){
    return this.background;
}

/*
 * Set the front node of the scene
 * @param {object} front - The node to add
 */
AstronauteEngine.Scene.prototype.setFront = function(front){
    this.front = front;
}

/*
 * Get the front node of the scene
 * @returns {object} The front node of the scene
 */
AstronauteEngine.Scene.prototype.getFront = function(){
    return this.front;
}

/*
 * Get the root node of the scene
 * @returns {object} The root node of the scene
 */
AstronauteEngine.Scene.prototype.getRoot = function(){
    return this.root;
}

/*
 * Update the scene
 */
AstronauteEngine.Scene.prototype.update = function(){
    this.root.update();
}





/*
 * AstronauteEngine.Group: Group node.
 * @returns {AstronauteEngine.Group}
 */
AstronauteEngine.Group = function(){
    
    this.type = AstronauteEngine.NODETYPES.GROUP;
    this.children = [];
    
}

/*
 * Add a node to the group
 * @param {object} The node to add
 */
AstronauteEngine.Group.prototype.appendChild = function(child){
    this.children.push(child);
};

/*
 * Check if the group contains at least one node
 * @returns {boolean} True of false
 */
AstronauteEngine.Group.prototype.isEmpty = function(){
    if(this.children === undefined || this.children.length == 0) {return true;}
    else{return false;}
}

/*
 * Get the number of nodes in this group
 * @returns {number} The number of nodes
 */
AstronauteEngine.Group.prototype.size = function(){
    return this.children.length;
}

/*
 * Get the node at a given index
 * @param {number} idx - The index of the node to return
 * @returns {object} The scene node
 */
AstronauteEngine.Group.prototype.get = function(idx){
    return this.children[idx];
}

/*
 * Draw the group
 */
AstronauteEngine.Group.prototype.draw = function(context, delta){
    for(var i = 0, len = this.children.length; i < len; i++){
        this.children[i].draw(context, delta);
    }
};

/*
 * Update the group
 */
AstronauteEngine.Group.prototype.update = function(){
    for(var i = 0, len = this.children.length; i < len; i++){
        this.children[i].update();
    }
};









/*
 * AstronauteEngine.Node: Parent object of all nodes.
 * @returns {AstronauteEngine.Node}
 */
AstronauteEngine.Node = function(){
    
    this.type;
    this.x = 0;
    this.y = 0;
    this.orientationX = 0;
    this.orientationY = 0;
    this.transform = false;
    this.rotate = false;
    this.rotationAngle = 0;
    this.scale = false;
    this.scaleX = 0;
    this.scaleY = 0;
    this.width;
    this.height;
    this.alpha = 1;
    
}

/*
 * Set the position of this scene node
 * @param {number} x - The horizontal position of the node
 * @param {number} y - The vertical position of the node
 */
AstronauteEngine.Node.prototype.setPosition = function(x, y){
    this.x = x;
    this.y = y;
}

/*
 * Set the rotation of this scene node
 * @param {number} angle - The rotation angle of the node
 */
AstronauteEngine.Node.prototype.setRotation = function(angle){
    this.transform = true;
    this.rotate = (angle == 0) ? false : true;
    this.rotationAngle = angle;
}

/*
 * Set the size of this scene node
 * @param {number} scaleX - The width of the node
 * @param {number} scaleY - The height of the node
 */
AstronauteEngine.Node.prototype.setSize = function(width, height){
    this.transform = true;
    this.width = width;
    this.height = height;
}

/*
 * Set the scale of this scene node
 * @param {number} scaleX - The horizontal scale of the node
 * @param {number} scaleY - The vertical scale of the node
 */
AstronauteEngine.Node.prototype.setScale = function(scaleX, scaleY){

    if(scaleY === undefined){
        scaleY = scaleX;
    }

    this.transform = true;
    this.scale = (scaleX == 1 && scaleY == 1) ? false : true;
    this.scaleX = scaleX;
    this.scaleY = scaleY;
}

/*
 * Update the position of this scene node
 */
AstronauteEngine.Node.prototype.update = function(){
    this.x += this.orientationX;
    this.y += this.orientationY;
}







/*
 * AstronauteEngine.NodeImage: Image node.
 * @param {string} id - The id of the image
 * @param {string} filePath - The path to the file
 * @param {number} width - The width of the image
 * @param {number} height - The height of the image
 * @returns {AstronauteEngine.NodeImage}
 */
AstronauteEngine.NodeImage = function(id, filePath, width, height){
    AstronauteEngine.Node.call(this);//Parent constructor

    this.useWidth = (width === undefined) ? false : width;
    this.useHeight = (height === undefined) ? false : height;
	
    this.type = AstronauteEngine.NODETYPES.IMAGE;
    this.img = document.createElement("img");
    this.img.id = id;
    this.img.src = filePath;
    
    this.filtered = false;
    this.filter = "none";
    this.filters = new Map();
    
}
//Inherit From AstronauteEngine.Node
AstronauteEngine.NodeImage.prototype = new AstronauteEngine.Node;

/*
 * Use the original image size
 */
AstronauteEngine.NodeImage.prototype.resizeToImageSize = function(){
    this.width = this.img.width;
    this.height = this.img.height;
}

/*
 * Function called on load of the image
 */
AstronauteEngine.NodeImage.prototype.onLoad = function(){
    this.width = (this.useWidth == false) ? this.img.width : this.useWidth;
    this.height = (this.useHeight == false) ? this.img.height : this.useHeight;
}

/*
 * Set a CSS filter to this image
 * @param {string} type - The type of the filter
 * @param {number} value - The value of the filter
 * @param {string} unit - The unit of the filter value ("px", "%", "deg")
 */
AstronauteEngine.NodeImage.prototype.setFilter = function(type, value, unit){
    this.filters.set(type, type + "(" + value + unit + ")");
    if(this.filters.size > 0){
        this.filter = "";
    }
}

/*
 * Draw this object
 * @param {object} context - The graphics context of the canvas
 * @param {number} delta - The delta time of the update
 */
AstronauteEngine.NodeImage.prototype.draw = function(context, delta){

    context.globalAlpha = this.alpha;
    context.filter = this.filter;//Set filter

    //context.mozImageSmoothingEnabled = true;
    //context.webkitImageSmoothingEnabled = true;
    //context.msImageSmoothingEnabled = true;
    context.imageSmoothingEnabled = true;

    if(this.transform){
        this.drawTransformed(context, delta);//Transformed
    }
    else{
        context.drawImage(this.img, this.x, this.y);//Normal
    }


}

/*
 * Draw this object transformed
 * @param {object} context - The graphics context of the canvas
 * @param {number} delta - The delta time of the update
 */
AstronauteEngine.NodeImage.prototype.drawTransformed = function(context, delta){

    //save the untransformed context
    context.save();

    //move to the center of the canvas
    context.translate(this.x + (this.width/2), this.y + (this.height/2));

    //rotate the canvas to the specified degrees if rotating is declared
    if(this.rotate){
        var rotationAngleInRadians = this.rotationAngle*Math.PI/180;
        context.rotate(rotationAngleInRadians);
    }

    //draw the image
    context.drawImage(this.img, - (this.width/2), - (this.height/2), this.width, this.height);
    //context.drawImage(this.img, - (this.width/2), - (this.height/2));

    //restore the untransformed context
    context.restore();

}







/*
 * AstronauteEngine.NodeRect: Rectangle node.
 * @param {number} width - The width of the rectangle
 * @param {number} height - The height of the rectangle
 * @param {string} fillStyle - The fill style of the rectangle
 * @returns {AstronauteEngine.NodeRect}
 */
AstronauteEngine.NodeRect = function(width, height, fillStyle){
	
    if(width === undefined){
        width = 0;
    }
    if(height === undefined){
        height = 0;
    }
    if(fillStyle === undefined){
        fillStyle = false;
    }
	
    AstronauteEngine.Node.call(this);//Parent constructor
    
    this.type = AstronauteEngine.NODETYPES.SHAPE;
    this.width = width;
    this.height = height;
    this.fillStyle = fillStyle;
    
}
//Inherit From AstronauteEngine.Node
AstronauteEngine.NodeRect.prototype = new AstronauteEngine.Node;

/*
 * Draw this object
 * @param {object} context - The graphics context of the canvas
 * @param {number} delta - The delta time of the update
 */
AstronauteEngine.NodeRect.prototype.draw = function(context, delta){

    context.globalAlpha = this.alpha;
    if(this.fillStyle != false){
        context.fillStyle = this.fillStyle;
    }
    context.fillRect(this.x, this.y, this.width, this.height); 

}

/*
 * Set the fill style of the rectangle
 * @param {string} fillStyle - The fill style of the rectangle
 */
AstronauteEngine.NodeRect.prototype.setFillStyle = function(fillStyle){
    this.fillStyle = fillStyle;
}






/*
 * AstronauteEngine.NodeText: Text node.
 * @param {string} text - The text to display
 * @returns {AstronauteEngine.NodeText}
 */
AstronauteEngine.NodeText = function(text){
    AstronauteEngine.Node.call(this);//Parent constructor
    
    this.type = AstronauteEngine.NODETYPES.TEXT;
	
    this.text = text;
    this.fillStyle = "red";
    this.font = "30px Arial";
    this.fontArgs = this.font.split('px ');
    this.fontSize = this.fontArgs[0];
    
}
//Inherit From AstronauteEngine.Node
AstronauteEngine.NodeText.prototype = new AstronauteEngine.Node;

/*
 * Draw this object
 * @param {object} context - The graphics context of the canvas
 * @param {number} delta - The delta time of the update
 */
AstronauteEngine.NodeText.prototype.draw = function(context, delta){

    if(this.fillStyle != false){context.fillStyle = this.fillStyle;}
    context.font = this.font;
    context.fillText(this.text, this.x, this.y + this.fontSize); 
}

/*
 * Set text
 * @param {string} text - The text to display
 */
AstronauteEngine.NodeText.prototype.setText = function(text){
    this.text = text;
}






/*
 * AstronauteEngine.Front: Simple colored front.
 * @returns {AstronauteEngine.Front}
 */
AstronauteEngine.Front = function(useColor){
    
    if(useColor === undefined){
        useColor = "black";
    }
	
    this.fillColor = useColor;
    this.visible = false;
    this.opacity;
    
}

/*
 * Draw this object
 * @param {object} context - The graphics context of the canvas
 * @param {number} width - The width of the object
 * @param {number} height - The height of the object
 * 
 */
AstronauteEngine.Front.prototype.draw = function(context, width, height){

    if(this.visible){
        context.fillStyle = this.fillColor;
        context.fillRect(0, 0, width, height);
    }

}





/*
 * AstronauteEngine.Background: Simple colored background
 * @returns {AstronauteEngine.Background}
 */
AstronauteEngine.Background = function(useColor){
    
    if(useColor === undefined){
        useColor = "black";
    }
	
    this.fillColor = useColor;
    
}

/*
 * Draw this object
 * @param {object} context - The graphics context of the canvas
 * @param {number} width - The width of the object
 * @param {number} height - The height of the object
 */
AstronauteEngine.Background.prototype.draw = function(context, width, height){
    context.fillStyle = this.fillColor;
    context.fillRect(0, 0, width, height);
}










/*
 * AstronauteEngine.Timed: Object commonly herited by timed objects (as sequencer and sequences), containing some values.
 * @returns {AstronauteEngine.Timed}
 */
AstronauteEngine.Timed = function(useStartTime){
	
    if(useStartTime === undefined){
        useStartTime = false;
    }
	
    this.time;//int: current Time in the sequence
    this.running;//bool: running state
    this.startTime = useStartTime;
    this.endTime = false;
    this.loop = false;
    
}

/*
 * Function used to sort objects by comparing their starting time
 * @returns {number} The loop time (in milliseconds)
 */
AstronauteEngine.Timed.timeCompare = function (a, b) {
    
    if (a.startTime < b.startTime){
        return -1;
    }
    if (a.startTime > b.startTime){
        return 1;
    }
    return 0;
    
}

/*
 * Defines the loop time 
 * @returns {number} The loop time (in milliseconds)
 */
AstronauteEngine.Timed.prototype.loopAt = function(endTime){
    this.loop = true;
    this.endTime = endTime;
}

/*
 * Defines the end time 
 * @returns {number} The end time (in milliseconds)
 */
AstronauteEngine.Timed.prototype.finishAt = function(endTime){
    this.endTime = endTime;
}

/*
 * Get the end time (in milliseconds)
 * @returns {number} The timestamp
 */
AstronauteEngine.Timed.prototype.getEnd = function(){
    return this.endTime;
}

/*
 * Check if this object is going to loop
 * @returns {boolean} True or false
 */
AstronauteEngine.Timed.prototype.isLoop = function(){
    return this.loop;
}

/*
 * Check if this object is running
 * @returns {boolean} True or false
 */
AstronauteEngine.Timed.prototype.isRunning = function(){
    return this.running;
}










/*
 * AstronauteEngine.Sequence: Object used by the sequencer containing the array of animations and some values for the sequence.
 * @returns {AstronauteEngine.Sequence}
 */
AstronauteEngine.Sequence = function(useId){
	
    if(useId === undefined){
        useId = false;
    }
    
    AstronauteEngine.Timed.call(this);//Call parent constructor
    
    this.startDelay = null;
    this.loopDelay = null;
    this.delaying = false;
    this.pop = false;
    this.finished;
    
    this.type = AstronauteEngine.SEQUENCETYPES.AUTO; //Default
    
    this.sequencer;
   
    this.id = useId;
    this.animations = [];
    this.activeAnimations = [];
    
    this.currentIndex;//int: index of the current animation in the sequence
    
}
//Inherit From AstronauteEngine.Timed
AstronauteEngine.Sequence.prototype = new AstronauteEngine.Timed();

/*
 * Prepare sequence animations by sorting them in their order of launch
 */
AstronauteEngine.Sequence.prototype.prepareToStart = function(){
    //Sort animations by start indices to prevent unordered sequence
    this.animations.sort(AstronauteEngine.Timed.timeCompare);
}

/*
 * Start the sequence
 */
AstronauteEngine.Sequence.prototype.start = function(){
    //console.log("StartSequence:-------------------");
    this.activeAnimations = [];
    this.time = 0;
    this.running = true;
    this.currentIndex = 0;
    this.finished = false;
}

/*
 * Stop the sequence
 */
AstronauteEngine.Sequence.prototype.stop = function(){
    this.running = false;
    this.finished = true;
}

/*
 * Defines the end of the sequence
 */
AstronauteEngine.Sequence.prototype.popAt = function(endTime){
    this.endTime = endTime;
    this.pop = true;
}

/*
 * Add an animation to this sequence
 */
AstronauteEngine.Sequence.prototype.addAnimation = function(animation){
    this.animations.push(animation);
}

/*
 * Check if the sequence is empty or not
 * @returns {boolean} True or false
 */
AstronauteEngine.Sequence.prototype.isEmpty = function(){
    return (this.animations.length != null && this.animations.length > 0) ? false : true;
}

/*
 * Get the number of animations in this sequence
 * @returns {number} The number of animations
 */
AstronauteEngine.Sequence.prototype.size = function(){
    return this.animations.length;
}

/*
 * Get the animations of the sequence
 * @returns {Array} The array of animations
 */
AstronauteEngine.Sequence.prototype.getAll = function(){
    return this.animations;
}

/*
 * Get the current active animations
 * @returns {Array} An array of all active animations
 */
AstronauteEngine.Sequence.prototype.getActiveAnimation = function(){
    return this.activeAnimations;
}

/*
 * Get an animation at a given index
 * @returns {object | undefined} The animation at the given index, or undefined
 */
AstronauteEngine.Sequence.prototype.getAt = function(idx){
    return this.animations[idx];
}










/*
 * AstronauteEngine.Sequencer: AstronauteEngine.Sequencer: the sequencer of the engine.
 * This takes a sequence, automatically prepares the sequence to sort 
 * the animations by their start time when "prepareToStart()", and start the sequence when "start()"
 * @returns {AstronauteEngine.Sequencer}
 */
AstronauteEngine.Sequencer = function(){
    
    AstronauteEngine.Timed.call(this);//Call parent constructor
    
    this.currentIndex;//int: index of the current animation in the sequence
    this.storedSequences = [];
    this.waitingSequences = [];
    this.activeSequences = [];
    
    
}
//Inherit From AstronauteEngine.Timed
AstronauteEngine.Sequencer.prototype = new AstronauteEngine.Timed();

/*
 * Start the sequencer
 */
AstronauteEngine.Sequencer.prototype.start = function(){
    //console.log("StartSequencer:-------------------");

    this.running = true;
    this.time = 0;
    this.currentIndex = 0;
    this.waitingSequences = [];
    this.activeSequences = [];
    this.autoSequencesToWaitings();

}

AstronauteEngine.Sequencer.prototype.autoSequencesToWaitings = function(){
    var j = 0;
    for(var i = 0, len = this.storedSequences.length; i < len; i++){

        //Verify if present sequence is automatic
        if(this.storedSequences[i].type == AstronauteEngine.SEQUENCETYPES.AUTO){
            this.waitingSequences[j] = this.storedSequences[i];
            j++;
        }

    }
}

AstronauteEngine.Sequencer.prototype.sequencesToActive = function(){
    for(var i = 0, len = this.storedSequences.length; i < len; i++){
        this.activeSequences[i] = this.storedSequences[i];
    }
}

/*
 * Start all sequences
 */
AstronauteEngine.Sequencer.prototype.startAllAutoSequences = function(){
    //Start sequences automatically???
    for(var i = 0, len = this.activeSequences.length; i < len; i++){
        this.activeSequences[i] = this.storedSequences[i];
        this.activeSequences[i].start();
    }
}

/*
 * Update a sequence
 */
AstronauteEngine.Sequencer.prototype.updateSequence = function(seq){

    if(seq.isRunning()){

        if(!seq.isEmpty()){

            var activeAnimations = seq.getActiveAnimation();

            //While candidate animation exist and candidate animation start at this step
            while(seq.currentIndex < seq.size() && seq.getAt(seq.currentIndex).startTime <= seq.time){

                //Push the animation to the active animations array
                activeAnimations.push(seq.getAt(seq.currentIndex));

                var animation = seq.getAt(seq.currentIndex);

                //Start the animation now
                animation.start();
                //console.log("Pushing()" + seq.getAt(currentIndex).type + " at Time " + seq.getAt(seq.currentIndex).startTime + " - ArraylengthNow = " + (activeAnimations.length));

                //Increase the index of candidate 
                seq.currentIndex++;

            }

            //If animations are active
            if(activeAnimations.length != 0){

                var i = 0;
                //For each
                while(i < activeAnimations.length){

                    //Do the animation step
                    activeAnimations[i].anim();

                    //if the active animation is not a loop and finished
                    if(!activeAnimations[i].loop && activeAnimations[i].endTime <= seq.time){
                        //console.log("Poping()" + activeAnimations[i].type + " at Time " + activeAnimations[i].endTime + " - ArraylengthNow = " + (activeAnimations.length-1));

                        //Delete from active animations
                        if(i == activeAnimations.length -1){
                            activeAnimations.pop();
                        }
                        else{
                            activeAnimations.splice(i, 1);
                        }
                    }
                    else{//Continue...
                        i++;
                    }
                }
            }
        }

        if(seq.getEnd() != false){
            if(seq.time >= seq.getEnd() && seq.isLoop()){
                seq.start();
            }
            else if(seq.time >= seq.getEnd()){
                //console.log("FinishSequence:-------------------" + seq.time);
                seq.stop();
            }
            else{
                seq.time += AstronauteEngine.TIME_INTERVAL;
            }
        }
        //Automatically detect the end of a sequence if nothing set as endTime
        else if(seq.getEnd() == false && activeAnimations.length == 0 && seq.currentIndex == seq.size()){
            //console.log("FinishSequence:-------------------" + seq.time);
            seq.stop();
        }
        else{
            seq.time += AstronauteEngine.TIME_INTERVAL;
        }
        

    }

}

/*
 * Update the sequencer
 */
AstronauteEngine.Sequencer.prototype.update = function(){

    if(this.isRunning()){

        /* Check if there are some waiting sequences */
        if(this.waitingSequences.length > 0){
            //For each wainting sequence
            var i = 0;
            while(i < this.waitingSequences.length){
                if(this.waitingSequences[i].startTime == false || this.time >= this.waitingSequences[i].startTime){

                    //console.log(this.time);
                    //Become active
                    this.activeSequences.push(this.waitingSequences[i]);

                    //Start
                    this.waitingSequences[i].start();

                    //Delete from waiting sequences
                    if(i == this.waitingSequences.length -1){
                        this.waitingSequences.pop();
                    }
                    else{
                        this.waitingSequences.splice(i, 1);
                    }
                }
                else{
                    i++;
                }
            }
        }

        if(this.activeSequences.length > 0){

            //For each sequence
            var i = 0;
            while(i < this.activeSequences.length){

                //Update the sequence
                this.updateSequence(this.activeSequences[i]);


                if(this.activeSequences[i].finished){
                    //Delete from active sequences
                    //console.log("DeleteSequence:-------------------");
                    if(i == this.activeSequences.length -1){
                        this.activeSequences.pop();
                    }
                    else{
                        this.activeSequences.splice(i, 1);
                    }
                }
                else{
                    i++;
                }
            }

        }

        //Determine action at this time: continue to next step, restart or stop the sequencer
        if(this.endTime != false){

            if(this.time >= this.endTime && this.loop){
                //console.log("RestartSequencer:-------------------" + this.time);
                //console.log(storedSequences.length);
                this.time = 0;
                this.currentIndex = 0;
                this.waitingSequences = [];
                this.activeSequences = [];
                this.autoSequencesToWaitings();
            }
            else if(this.time >= this.endTime){
                //console.log("FinishSequencer:-------------------" + this.time);
                this.running = false;
            }
            else{
                this.time += AstronauteEngine.TIME_INTERVAL;
            }

        }
        else{
            this.time += AstronauteEngine.TIME_INTERVAL;
        }

    }
}
AstronauteEngine.Sequencer.prototype.isEmpty = function(){
    return (this.storedSequences[0] == false) ? true : false;
}
AstronauteEngine.Sequencer.prototype.isPlaying = function(){
    return this.running;
}
//This function add a sequence to stored array.
AstronauteEngine.Sequencer.prototype.add = function(sequence){

    sequence.prepareToStart();
    this.storedSequences.push(sequence);
}
//This function directly add a sequence to active array then start playing it.
AstronauteEngine.Sequencer.prototype.play = function(sequence){

    sequence.prepareToStart();
    this.activeSequences.push(sequence);

    //Start the sequence
    sequence.start();
    
}










/*
 * AstronauteEngine.Animation: The parent object of all animations.
 * @returns {AstronauteEngine.Animation}
 */
AstronauteEngine.Animation = function(node, type, startTime, loop, duration){
    
    this.node = node;
    
    this.type = type;
    this.startTime = startTime;
    this.endTime = startTime + duration;
    this.duration = duration;
    this.loop = loop;
    this.running = false;
    this.time = 0;
    
}
/*
 * Pause the animation
 */
AstronauteEngine.Animation.prototype.pause = function(running){
    this.running = !running;
}










/*
 * AstronauteEngine.AnimatedCSSFilter: Beta CSS Filter Animation
 * 
 * WARNING: This is really not optimized and must been manipulated with precautions.
 * 
 * @param {object} node - The scene node affected by this animation
 * @param {number} startTime - The start time of the animation
 * @param {number} duration - The duration of the animation
 * @param {string} filterType - The type of the CSS filter
 * @param {number} startValue - The starting value of the animation
 * @param {number} endValue - The end value of the animation
 * @param {string} filterUnit - The unit of the CSS value
 * @param {boolean} loop - Whether the animation must loop or not
 * @returns {AstronauteEngine.AnimatedCSSFilter}
 */
AstronauteEngine.AnimatedCSSFilter = function(node, startTime, duration , filterType, startValue, endValue, filterUnit, loop){
	
    if(loop === undefined){
        loop = true;
    }
	
    AstronauteEngine.Animation.call(this, node, AstronauteEngine.ANIMTYPES.CSSFILTER, startTime, loop, duration);//Parent constructor

    this.moveOrient = (endValue > startValue) ? 1 : -1;
    this.startValue = (moveOrient > 0) ? startValue : endValue;
    this.endValue = (moveOrient > 0) ? endValue : startValue;
    this.movement = (this.endValue - this.startValue)/(this.duration);
    this.currentValue;

    this.filterType = filterType;
    this.filterUnit = filterUnit;
    
    this.currentStep;
    
    this.x = 0;
    
    
    
}
//Inherit From AstronauteEngine.Animation+
AstronauteEngine.AnimatedCSSFilter.prototype = new AstronauteEngine.Animation;

/*
 * Start the animation
 */
AstronauteEngine.AnimatedCSSFilter.prototype.start = function(){
    this.running = true;
    this.currentValue = (this.moveOrient > 0) ? this.startValue : this.endValue;
}

/*
 * Animate
 */
AstronauteEngine.AnimatedCSSFilter.prototype.anim = function(){
    if(this.running){
        //var cssStringFilter = this.filterType + "(" + currentValue + this.filterUnit + ")";
        //Simple limiter
        if(this.x == 0){
            this.node.setFilter(this.filterType, this.currentValue.toFixed(0), this.filterUnit);
        }
        if(this.x >= 30){
            this.x = 0;
        }
        else{
            this.x++;
        }
        this.currentValue = (this.moveOrient > 0) ? this.currentValue + (this.movement*AstronauteEngine.TIME_INTERVAL) : this.currentValue - (this.movement * AstronauteEngine.TIME_INTERVAL);
    }
}










/*
 * AstronauteEngine.AnimatedOpacity: Opacity Animation
 * 
 * @param {object} node - The scene node affected by this animation
 * @param {number} startTime - The start time of the animation
 * @param {number} duration - The duration of the animation
 * @param {number} startOpacity - The starting value of the animation
 * @param {number} endOpacity - The end value of the animation
 * @param {boolean} loop - Whether the animation must loop or not
 * @returns {AstronauteEngine.AnimatedOpacity}
 */
AstronauteEngine.AnimatedOpacity = function(node, startTime, duration , startOpacity, endOpacity, loop){
	
    if(loop === undefined){
        loop = false;
    }
	
    AstronauteEngine.Animation.call(this, node, AstronauteEngine.ANIMTYPES.OPACITY, startTime, loop, duration);//Parent constructor
    
    this.currentOpacity;
    this.startOpacity = startOpacity;
    this.movement = (endOpacity - this.startOpacity)/(this.duration);
    
}
//Inherit From AstronauteEngine.Animation+
AstronauteEngine.AnimatedOpacity.prototype = new AstronauteEngine.Animation;

/*
 * Start the animation
 */
AstronauteEngine.AnimatedOpacity.prototype.start = function(){
    this.running = true;
    this.currentOpacity = this.startOpacity;
    //console.log("StartZoom:" + startZoom);
}

AstronauteEngine.AnimatedOpacity.prototype.anim = function(){
    if(this.running){
        this.node.alpha = this.currentOpacity;
        //this.node.setScale(currentZoom);
        this.currentOpacity = Math.max(0, Math.min(this.currentOpacity + (this.movement * AstronauteEngine.TIME_INTERVAL), 1));
        //document.getElementById("debug_output_a").innerHTML = currentOpacity;
    }
}










/*
 * AstronauteEngine.AnimatedZoom: Zoom Animation
 * 
 * @param {object} node - The scene node affected by this animation
 * @param {number} startTime - The start time of the animation
 * @param {number} duration - The duration of the animation
 * @param {number} startZoom - The starting value of the animation
 * @param {number} endZoom - The end value of the animation
 * @param {boolean} loop - Whether the animation must loop or not
 * @returns {AstronauteEngine.AnimatedZoom}
 */
AstronauteEngine.AnimatedZoom = function(node, startTime, duration , startZoom, endZoom, loop){
	
    if(loop === undefined){
        loop = true;
    }
	
    AstronauteEngine.Animation.call(this, node, AstronauteEngine.ANIMTYPES.ZOOM, startTime, loop, duration);//Parent constructor
    
    this.startZoom = startZoom;
    this.currentZoom;
    this.movement = (endZoom-startZoom)/(this.duration);
    
}
//Inherit From AstronauteEngine.Animation
AstronauteEngine.AnimatedZoom.prototype = new AstronauteEngine.Animation;

/*
 * Start the animation
 */
AstronauteEngine.AnimatedZoom.prototype.start = function(){
    this.running = true;
    this.currentZoom = this.startZoom;
    //console.log("StartZoom:" + startZoom);
}

/*
 * Animate
 */
AstronauteEngine.AnimatedZoom.prototype.anim = function(){
    if(this.running){
        var newWidth = this.node.img.width * (this.currentZoom);
        var newHeight = this.node.img.height * (this.currentZoom);
        this.node.setSize(newWidth, newHeight);
        //this.node.setScale(currentZoom);
        this.currentZoom = this.currentZoom + (this.movement * AstronauteEngine.TIME_INTERVAL);
    }
}










/*
 * AstronauteEngine.AnimatedTranslation: Translation Animation
 * 
 * @param {object} node - The scene node affected by this animation
 * @param {number} startTime - The start time of the animation
 * @param {number} duration - The duration of the animation
 * @param {number} startX - The horizontal starting position of the animation
 * @param {number} startY - The vertical starting position of the animation
 * @param {number} endX - The horizontal end position of the animation
 * @param {number} endY - The vertical end position of the animation
 * @param {boolean} loop - Whether the animation must loop or not
 * @returns {AstronauteEngine.AnimatedTranslation}
 */
AstronauteEngine.AnimatedTranslation = function(node, startTime, duration , startX, startY, endX, endY, loop){
	
    if(loop === undefined){
        loop = true;
    }
	
    AstronauteEngine.Animation.call(this, node, AstronauteEngine.ANIMTYPES.TRANSLATION, startTime, loop, duration);//Parent constructor
    
    this.startX = startX;
    this.startY = startY;
    this.currentX;
    this.currentY;
    this.movementX = ((endX - startX)/this.duration);
    this.movementY = ((endY - startY)/this.duration);
    
}
//Inherit From AstronauteEngine.Animation
AstronauteEngine.AnimatedTranslation.prototype = new AstronauteEngine.Animation;

/*
 * Start the animation
 */
AstronauteEngine.AnimatedTranslation.prototype.start = function(){
    this.running = true;
    this.time = 0;
    this.currentX = this.startX;
    this.currentY = this.startY;
}

/*
 * Animate
 */
AstronauteEngine.AnimatedTranslation.prototype.anim = function(){
    if(this.running){
        this.currentX = this.currentX + (this.movementX * AstronauteEngine.TIME_INTERVAL);
        this.currentY = this.currentY + (this.movementY * AstronauteEngine.TIME_INTERVAL);
        this.node.setPosition(this.currentX, this.currentY);

        this.time += AstronauteEngine.TIME_INTERVAL;

    }

}










/*
 * AstronauteEngine.AnimatedRotation: Rotation Animation
 * 
 * @param {object} node - The scene node affected by this animation
 * @param {number} startTime - The start time of the animation
 * @param {number} movement - The orientation of the movement (-1 or 1)
 * @param {boolean} loop - Whether the animation must loop or not
 * @param {number} duration - The duration of the animation
 * @param {number} startAngle - The starting angle of the rotation
 * @param {number} endAngle - The end angle of the rotation
 * @returns {AstronauteEngine.AnimatedRotation}
 */
AstronauteEngine.AnimatedRotation = function(node, startTime, movement, loop, duration, startAngle, endAngle){
	
    if(loop === undefined){
        loop = true;
    }
    if(duration === undefined){
        duration = 0;
    }
    if(startAngle === undefined){
        startAngle = null;
    }
    if(endAngle === undefined){
        endAngle = null;
    }
	
    AstronauteEngine.Animation.call(this, node, AstronauteEngine.ANIMTYPES.ROTATION, startTime, loop, duration);//Parent constructor
    
    this.startAngle = startAngle;
    this.endAngle = endAngle;
    this.currentAngle;
    this.movement = movement;
    
    this.useStartAngle = startAngle;
    this.useEndAngle = endAngle;
    
}
//Inherit From AstronauteEngine.Animation
AstronauteEngine.AnimatedRotation.prototype = new AstronauteEngine.Animation;

/*
 * Start the animation
 */
AstronauteEngine.AnimatedRotation.prototype.start = function(){
    this.running = true;
    this.startAngle = (this.useStartAngle == null) ? this.node.rotationAngle : this.useStartAngle;
    this.endAngle = (this.useEndAngle == null) ? this.startAngle + 360 : this.useEndAngle;
    this.currentAngle = this.startAngle;
    this.time = 0;
}

/*
 * Animate
 */
AstronauteEngine.AnimatedRotation.prototype.anim = function(){
    if(this.running){

        //document.getElementById("debug_output_a").innerHTML = this.step;
        if(this.currentAngle < this.endAngle){
            this.currentAngle = this.currentAngle + (this.movement * AstronauteEngine.TIME_INTERVAL);
            this.node.setRotation(this.currentAngle);

        }
        else{
            if(this.loop){
                this.currentAngle = this.startAngle + (this.movement * AstronauteEngine.TIME_INTERVAL);
                this.node.setRotation(this.currentAngle);
            }
            else{
                this.running = false;
            }
        }
    }

}
