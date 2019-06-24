import {Jstick}  from '../src/jstick.js';
import {Sprite}  from '../src/components/Sprite.js';
import {Actor}   from '../src/components/Actor.js';
import {Texture} from '../src/components/Texture.js';
import {Scene}   from '../src/components/Scene.js';

import {configureInput} from './js/game-input.js';
import {generateStates} from './js/actor-states.js';


window.Jstick = Jstick;


let myScene;
let Actors;
let myBackground;
let myfarBackground;
let selectedActor;
let mySceneLayer_Landscape 
let mySceneLayer_Terrain   
let mySceneLayer_Sprites   
window.action = 'select';



(async function(){
    // Generate a new Scene, with three layers 
    myScene = new Scene( 1087, 319);
    mySceneLayer_Landscape = myScene.addLayer( 'landscape',  0 , 0.8);
    mySceneLayer_Terrain   = myScene.addLayer( 'terrain',    1 );
    mySceneLayer_Sprites   = myScene.addLayer( 'sprites',    2 );
    
    // assign the scene to the renderEngine as a source
    Jstick.RenderEngine.output( '#container' );
    Jstick.RenderEngine.input( myScene );

    // Load the textures for the level backgrounds
    myBackground       = await new Texture('./maps/map2.png');
    myfarBackground    = await new Texture('./maps/back.jpg');

    // Generate the mouse CURSOR sprites
    let spriteSheet    =  await new Texture( './spritesheet/lemmings.png' );
    let cursorSelected =  await new Sprite( spriteSheet,  133,  0, 14, 14 );
    let cursorRegular  =  await new Sprite( spriteSheet,  148,  0, 14, 14 );

    // Enable control Interfaces and configure buttons
    Jstick.Input.enableInterface('mouse');
    Jstick.Input.enableInterface('keyboard');
    configureInput();

    // hide the native cursor
    Jstick.Viewport.hideDeviceCursor = true;
    Jstick.RenderEngine.fullscreen   = true;

    // generate the game states (and its animations)
    let myStates = await generateStates();

    // set initial zoom, to fit the scene in the viewport
    myScene.Camera.zoomAnimation(Jstick.Viewport.height/myScene.height,400,150);
    

    Actors = [];
    let interval = setInterval( ()=>{
        Actors.push(
            new Actor({
                states : [myStates.walk, myStates.fall, myStates.dig, myStates.tunnel, myStates.block],
                state  : 'walk',
                x      : 470,
                y      : 102,
                attributes : {
                    direction : 1
                }
            }) 
        );
        if( Actors.length > 99 ) clearInterval( interval );
    }, 800);


    Jstick.Loop.draw = function(timestamp, input){
        document.getElementById('actorsCounts').innerHTML = Actors.length;
        // clear all the Scene Layers
        mySceneLayer_Landscape.clear();
        mySceneLayer_Terrain.clear();
        mySceneLayer_Sprites.clear();
        // draw the background
        mySceneLayer_Landscape.drawTexture( myfarBackground, 0, 0 );
        // draw the terrain
        mySceneLayer_Terrain.drawTexture( myBackground, 0, 0 );
        // draw each character
        for(let i = 0; i < Actors.length; i++){
            let flip = false;
            if(Actors[i].attributes.direction === -1) flip = true;
            mySceneLayer_Sprites.drawSprite( Actors[i].getCurrentSprite(), Actors[i].x, Actors[i].y , flip);
        }


        // RENDER STAGE :
        if( selectedActor ){ 
            let box = selectedActor.getBoundingBox();
            let x =  box.x - Math.round( (cursorSelected.texture.width - box.width) / 2);
            let y =  box.y - Math.round( (cursorSelected.texture.height - box.height) / 2);
            
            mySceneLayer_Sprites.drawSprite( cursorSelected , x, y  );
        }

        let coordActors = actorsAtCoords( input.MOUSEX, input.MOUSEY );

        if( coordActors.length ) mySceneLayer_Sprites.drawSprite( cursorSelected, (input.MOUSEX / myScene.Camera.zoom ) +Jstick.RenderEngine.activeScene.Camera.x -7 ,(input.MOUSEY / myScene.Camera.zoom ) +Jstick.RenderEngine.activeScene.Camera.y -7  );
        else mySceneLayer_Sprites.drawSprite( cursorRegular, (input.MOUSEX / myScene.Camera.zoom )-7 + Jstick.RenderEngine.activeScene.Camera.x,(input.MOUSEY / myScene.Camera.zoom ) +Jstick.RenderEngine.activeScene.Camera.y -7   );

    }

    Jstick.Loop.update = function( deltaTime , input ){
        document.getElementById('inputMouseCoords').innerHTML = input['MOUSEX'] + '-' + input['MOUSEY'];
        document.getElementById('inputMouseLeft').innerHTML = input['mouse-left'];
        document.getElementById('inputMouseRight').innerHTML = input['mouse-right'];
        document.getElementById('inputMouseWheelUp').innerHTML = input['mouse-wheel-up'];
        document.getElementById('inputMouseWheelDown').innerHTML = input['mouse-wheel-down'];
        document.getElementById('inputKeybD').innerHTML = input['draw-but'];
        document.getElementById('inputKeybE').innerHTML = input['erase-but'];
        document.getElementById('inputKeybArrowUp').innerHTML = input['arrow-up'];
        document.getElementById('inputKeybArrowDown').innerHTML = input['arrow-down'];
        document.getElementById('inputKeybArrowLeft').innerHTML = input['arrow-left'];
        document.getElementById('inputKeybArrowRight').innerHTML = input['arrow-right'];
        
        if(input['mouse-wheel-up']) setZoom( input.MOUSEX, input.MOUSEY, 1 );
        if(input['mouse-wheel-down']) setZoom( input.MOUSEX, input.MOUSEY, -1 );
        
        if(input['arrow-right']) myScene.Camera.scrollAnimation( myScene.Camera.x + 10, myScene.Camera.y );
        if(input['arrow-left']) myScene.Camera.scrollAnimation( myScene.Camera.x - 10, myScene.Camera.y );
        if(input['arrow-up']) myScene.Camera.scrollAnimation( myScene.Camera.x , myScene.Camera.y - 10 );
        if(input['arrow-down']) myScene.Camera.scrollAnimation( myScene.Camera.x , myScene.Camera.y + 10 );
        
        if(input['draw-but']) window.action='draw';
        if(input['erase-but']) window.action='erase';
        
        if(input['mouse-left']) applyAction( input.MOUSEX, input.MOUSEY );

        if(input['mouse-click']) onClick( input.MOUSEX, input.MOUSEY );

        // iterate all actors and update their States
        for(let i = 0; i < Actors.length; i++){ 
            Actors[i].updateState( myBackground );
        }

    }


   // Jstick.ViewPort.setView( myScene.Camera );
})()


function setZoom( x,y,direction ){
    let newScale= myScene.Camera.zoom + ( 1 * direction );
    myScene.Camera.zoomAnimation(newScale, x , y);
}

function actorsAtCoords(x,y, single=false){
    let tolerance = 3;
    let affected = [];
    [x,y] = Jstick.Viewport.getAbsoluteCoordinates(x,y);
    for(let i=0; i<Actors.length; i++){
        let actor = Actors[i];
        let box = actor.getBoundingBox();
        if( x >= box.x-tolerance && y >= box.y-tolerance &&  
            x <= box.x+box.width+tolerance && y <= box.y + box.height+tolerance ){ 
                affected.push(actor);
        }
    }
    if( single && affected.length ) return [ affected[ Math.round( Math.random() * (affected.length -1) ) ] ];
    else return affected;
}








function onClick(x,y){
    if( window.action === 'select' ){
        let affected = actorsAtCoords(x,y, true);
        if( affected.length ){ 
            myScene.Camera.follow( affected[ 0 ] );
            selectedActor = affected[ 0 ];
        }
        else{ 
            myScene.Camera.follow( false );
            selectedActor = false;
        }
    }else if( window.action === 'dig'){
        let affected = actorsAtCoords(x,y, true);
        if( affected.length ) affected[ 0 ].setState('dig');
    }else if( window.action === 'tunnel'){
        let affected = actorsAtCoords(x,y, true);
        if( affected.length ) affected[ 0 ].setState('tunnel');
    }else if( window.action === 'block'){
        let affected = actorsAtCoords(x,y, true);
        if( affected.length ) affected[ 0 ].setState('block');
    }
}

function applyAction(x,y){
    if( window.action === 'zoomIn' ){
        Jstick.Camera.zoomAnimation( Jstick.Camera.zoom + 1 , x , y  )
    }else if( window.action === 'zoomOut' ){
        Jstick.Camera.zoomAnimation( Jstick.Camera.zoom - 1 , x , y  )
    }else if( window.action === 'erase' ){
        [x , y] = Jstick.Viewport.getAbsoluteCoordinates( x, y );

        myBackground.clearPixel(x -1, y -1);
        myBackground.clearPixel(x +0, y -1);
        myBackground.clearPixel(x +1, y -1);

        myBackground.clearPixel(x -1, y +0);
        myBackground.clearPixel(x +0, y +0);
        myBackground.clearPixel(x +1, y +0);

        myBackground.clearPixel(x -1, y +1);
        myBackground.clearPixel(x +0, y +1);
        myBackground.clearPixel(x +1, y +1);
        myBackground.apply();
    }else if( window.action === 'draw' ){
        [x , y] = Jstick.Viewport.getAbsoluteCoordinates( x, y );

        myBackground.setPixel(x -1, y -1, [255,255,255,255]);
        myBackground.setPixel(x +0, y -1, [255,255,255,255]);
        myBackground.setPixel(x +1, y -1, [255,255,255,255]);

        myBackground.setPixel(x -1, y +0, [255,255,255,255]);
        myBackground.setPixel(x +0, y +0, [255,255,255,255]);
        myBackground.setPixel(x +1, y +0, [255,255,255,255]);

        myBackground.setPixel(x -1, y +1, [255,255,255,255]);
        myBackground.setPixel(x +0, y +1, [255,255,255,255]);
        myBackground.setPixel(x +1, y +1, [255,255,255,255]);
        myBackground.apply();

    }

}



