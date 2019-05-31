# throttledAnimation (fps-throttle) : JS Animation framerate limiter 

This simple **crossbrowser** library helps you to limit the framerate of an animation. It has incorporated an interface to the [fps-observer](https://github.com/colxi/fps-observer) module, which provides useful information about the effective framerate of an animation (with stabilized values). 


See a visual  **example of FPS throttler** in action [here](http://colxi.info/fps-throttle/test/)

## Usage examples 

**Automatic mode :** 
```javascript
import {throttledAnimation} from './fps-throttle.js';

let myAnimation = new throttledAnimation( timestamp=>{
    console.log( 'Framerate :' , myAnimation.fps );
    /* 
    * this is your animation cycle loop ... 
    * throttled at 30 fps (±1 fps) 
    */
} , 30 );
```

## Constructor Syntax :

```javascript
new throttledAnimation( cycleCallback , throttleValue ); 
```
Parameters : 
- **cycleCallback** : Function to be executed in each loop cycle. (Callback receives a timestamp as first argument.)
- **throttleValue** : Integer that represents the FPS limit of the animation

Returns:
- new throttledAnimation instance object 


## Properties and methods : 

The throttledAnimation Constructor will create and init a new throttledAnimation instance and return an object with the following properties and methods :

- **throttledAnimation.prototype.throttle** : Integer. Can be changed to assign a new throttling value
- **throttledAnimation.prototype.fps** : Integer. Holds the value of the effective framerate
- **throttledAnimation.prototype.fpsObserve** : Boolean. Framerate observation can be disabled to win some extra performance.
- **throttledAnimation.prototype.stop()** : Stops the animation
- **throttledAnimation.prototype.start()** : Starts (or restarts) a stopped animation.


# Package distribution 

This library can be obtained using any of the following methods : 

**Npm** : Install using the package manager 
```bash
$ npm install fps-throttle -s
```

**Git** : Clone from Github... (Or download the latest release [here](https://github.com/colxi/fps-throttle/releases/latest))
```bash
$ git clone https://github.com/colxi/fps-throttle
```

**CDN** : Inlcude the latest release of the library in your HTML head
> Warning : Not recomended for production enviroments!
```html
<script src="https://colxi.info/fps-throttle/src/main.js" type="module"></script>
```
> When including in the header, the throttledAnimation Constructor becomes available in `window.throttledAnimation`
