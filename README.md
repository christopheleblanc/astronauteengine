# astronauteengine
A basic animation engine for HTML canvas born from the idea of ​​animating a small astronaut designed by my sister and make a small demonstration of my skills in Javascript in end of 2017/ early 2018.

Astronaut Engine allows you to program different sequences of different types of animations (for example: move, rotate, resize).

It is coded according to a quite classical architecture : A main loop, a scene manager, a display manager and a sequencer.

Developer: Christophe Leblanc. 

## How to use

Instanciate the engine
```javascript
var engine = new AstronauteEngine(canvas, width, height, update);
```

Instanciate a scene
```javascript
var scene = new AstronauteEngine.Scene();
```

Get the root node of the scene
```javascript
var root = scene.getRoot();
```

Add an image to the scene
```javascript
var image = new AstronauteEngine.NodeImage("Object", "object.jpg");
root.appendChild(image);
```

Instanciate an animation sequence
```javascript
var sequence = new AstronauteEngine.Sequence();
```

Add a "translation" animation
```javascript
var animation = new AstronauteEngine.AnimatedTranslation(image, startTime, endTime, startX, startY, endX, endY, loop);
sequence.addAnimation(animation);
```

Start a sequence
```javascript
sequence.start();
```

Loop / repeat a sequence
```javascript
sequence.loopAt(loopTime);
```

Stop a sequence
```javascript
sequence.finishAt(endTime);
```

Load a scene
```javascript
engine.loadScene(scene);
```

Start running the sequencer
```javascript
engine.sequencer.start();
```

## Contributing

This program is not intended to compete with large animation or video game frameworks (like Pixi.js or Phaser). However, do not hesitate to contribute if you discover bugs.

### License

Astronaut Engine is [MIT licensed](./LICENSE).