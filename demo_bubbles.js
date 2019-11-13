////////////////////////////////////////////////////////////////////////////////
//
//  "Bubbles generator / simili-particles emitter"
//
//  Author: Christophe Leblanc < christopheleblanc@gmx.com >
//
//  Description: Animation using Astronaute Engine.
//  
////////////////////////////////////////////////////////////////////////////////

/*
 * Return a random integer between two values
 * @param {number} a - The minimum value
 * @param {number} b - The maximum value
 * @returns {number} A random number between a and b
 */
function randomBetween(a,b){
    return Math.floor(Math.random() * Math.max(a,b)) + Math.min(a,b);
}

/*
 * BubbleMachine: A demonstration of using Astronaute Engine displaying some bubbles!
 * @param {object} canvas - The canvas DOM Element used to display the demo
 * @returns {BubbleMachine}
 */
function BubbleMachine(canvas){
    
    this.engine;
    
    var bubbleImage = "bubble.png";
    var bubbleIdPrefix = "bubble_";

    var bubbles = [];
    var bubblesIndex = 0;
    var bubbleLastTime = 0;
    var bubblesMaxTime = 20;
    
    var gameLoading = false;
    var gameLoaded = false;
    
    /*
    * Display the canvas in fullscreen mode
    */
    this.goFullScreen = () => {//Arrow function for binding
        this.engine.screen.enterFullScreen();
    }
    
    /*
    * Initialize a new bubble animation
    */
    var autoStartBubble = () => {//Arrow function for binding

        //Get the current node
        var node = bubbles[bubblesIndex];

        //Create a random sequence for this node

        var sequence = new AstronauteEngine.Sequence();
        var time = randomBetween(4500, 10000);
        var startX = randomBetween(0, 800);
        var endX = randomBetween(startX-200, startX+200);
        var animA = new AstronauteEngine.AnimatedTranslation(node, 0, time, startX, 600, endX, -800, false);
        sequence.addAnimation(animA);
        
        var startZoom = randomBetween(0.2, 1.2);
        var endZoom = randomBetween(0.2, 1.2);
        var animB = new AstronauteEngine.AnimatedZoom(node, 0, 10000, startZoom, endZoom, false);
        sequence.addAnimation(animB);
        
        //Auto pop the sequence at its end.
        sequence.popAt(10000);

        //Add the sequence
        this.engine.sequencer.play(sequence);

        //Step + 1 or reset
        if(bubblesIndex == bubbles.length-1){
            bubblesIndex = 0;
        }
        else{
            bubblesIndex++;
        }

    }
    
    /*
    * Create the background animations
    * @param {object} rectangle - The AstronauteEngine.NodeRect to animate
    * @returns {object} The sequence used to animation the background
    */
    function createBackGroundSequence(rectangle){
        
        var sequence = new AstronauteEngine.Sequence();

        var bgAnimA = new AstronauteEngine.AnimatedOpacity(rectangle, 0, 10001, 1, 0);
        sequence.addAnimation(bgAnimA);

        var bgAnimB = new AstronauteEngine.AnimatedOpacity(rectangle, 10000, 10000, 0, 1);
        sequence.addAnimation(bgAnimB);

        sequence.loopAt(20000);//Loop

        return sequence;
        
    }
    
    /*
    * Load the scene of this demo
    */
    var loadScene = () => {//Arrow function for binding

        //Create the world
        var scene = new AstronauteEngine.Scene();
        scene.setBackground(new AstronauteEngine.Background());
        scene.setFront(new AstronauteEngine.Front());

        //Get the root node of the scene
        var root = scene.getRoot();

        //Create a rectangle filled by a linear gradient
        var grd = canvas.getContext("2d").createLinearGradient(0, 700, 0, 0);
        grd.addColorStop(0, "blue");
        grd.addColorStop(1, "transparent");

        var backgroundA = new AstronauteEngine.NodeRect(canvas.width, canvas.height, grd);
        root.appendChild(backgroundA);

        //Create a black rectangle above the gradient rectangle
        var backgroundB = new AstronauteEngine.NodeRect(canvas.width, canvas.height, "black");
        root.appendChild(backgroundB);

        //Create an animated sequence for the mask rectangle
        var backgroundSequence = createBackGroundSequence(backgroundB);
        this.engine.sequencer.add(backgroundSequence);

        
        //Create some bubbles
        for(var i = 0; i < 201; i++){
            var bubbleId = bubbleIdPrefix + i;
            bubbles[i] = new AstronauteEngine.NodeImage(bubbleId, bubbleImage);
            bubbles[i].setPosition(400,800);
            root.appendChild(bubbles[i]);
        }

       //Load the scene
        this.engine.loadScene(scene);

        gameLoading = true;

    }


    /*
    * Function called on each step of the "game loop"
    */
    var run = () => {//Arrow function for binding

        // This let you control what to do when the loading is complete
        // Note: This is not really optimized but this is how we can start the animation in the current version of AE
        if(this.engine.loader.isComplete() && gameLoading && !gameLoaded){
            
            this.engine.sequencer.start();

            //Now declare loading definitively finished
            gameLoading = !gameLoading;
            gameLoaded = !gameLoaded;

        }
        
        if(gameLoaded){

            var timeNow = window.performance.now();
            var nTimes = timeNow;
            while(nTimes >= bubbleLastTime + bubblesMaxTime){
                bubblesMaxTime = randomBetween(50, 300);
                bubbleLastTime = timeNow;
                autoStartBubble();
                nTimes -= bubbleLastTime + bubblesMaxTime;
            }
            
        }

    }
    
    /*
    * Create the demo, instanciate the engine and start the sequencer
    */
    var create = () => {//Arrow function for binding

        //Create Astronaute Engine
        this.engine = new AstronauteEngine(canvas, 800, 600, run);

        //Load the scene
        loadScene();

        //Start the engine
        this.engine.start();
        
    }
    
    create();
    
}

function create(){
    var canvas = document.getElementById("astronaute_engine");
    var bubbleMachine = new BubbleMachine(canvas);
}
