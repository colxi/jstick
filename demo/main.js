import {Jstick, Sprite, Actor, Texture}  from '../src/jstick.js';

import {configureInput} from './js/game-input.js';
import {generateStates} from './js/actor-states.js';




let game;
let Actors;
let myBackground;
let myfarBackground;
let selectedActor;
let sceneLayer_Landscape 
let sceneLayer_Terrain   
let sceneLayer_Sprites   
window.action = 'select';



(async function(){
    window.game = game = new Jstick('#container');

    console.log(game);

    // Generate a new Scene, with three layers 
    game.Scene.width  = 1087;
    game.Scene.height = 319;

    sceneLayer_Landscape = game.Scene.addLayer( 'landscape',  0 , 0.8);
    sceneLayer_Terrain   = game.Scene.addLayer( 'terrain',    1 );
    sceneLayer_Sprites   = game.Scene.addLayer( 'sprites',    2 );
    
    // Load the textures for the level backgrounds
    myBackground       = await new Texture('./maps/map2.png');
    myfarBackground    = await new Texture('./maps/back.jpg');

    // Generate the mouse CURSOR sprites
    let spriteSheet    =  await new Texture( './spritesheet/lemmings.png' );
    let cursorSelected =  await new Sprite( spriteSheet,  133,  0, 14, 14 );
    let cursorRegular  =  await new Sprite( spriteSheet,  148,  0, 14, 14 );
   
    // Enable control Interfaces and configure buttons
    game.Input.enableInterface('mouse');
    game.Input.enableInterface('keyboard');
    configureInput( game );
    
    
    // hide the native cursor
    game.Renderer.imageSmoothing   = false;
    game.Renderer.throttle         = 30;
    game.Viewport.hideDeviceCursor = true;
    game.Viewport.fullscreen       = true;
    


    // generate the game states (and its animations)
    let myStates = await generateStates();
    
    // set initial zoom, to fit the scene in the viewport
    game.Camera.zoomAnimation(game.Viewport.height/game.Scene.height,400,150);
    

    Actors = [];
    let interval = setInterval( ()=>{
        Actors.push(
            new Actor({
                states : [myStates.walk, myStates.fall, myStates.dig, myStates.tunnel, myStates.block],
                state  : 'walk',
                x      : 470,
                y      : 102,
                data : {
                    direction : 1
                }
            }) 
        );
        if( Actors.length > 99 ) clearInterval( interval );
    }, 800);


    game.Loop.draw = function(timestamp, input){
   
        // clear all the Scene Layers
        sceneLayer_Landscape.clear();
        sceneLayer_Terrain.clear();
        sceneLayer_Sprites.clear();
        // draw the background
        sceneLayer_Landscape.drawTexture( myfarBackground, 0, 0 );
        // draw the terrain
        sceneLayer_Terrain.drawTexture( myBackground, 0, 0 );
        // draw each character
        for(let i = 0; i < Actors.length; i++){
            let flip = false;
            if(Actors[i].data.direction === -1) flip = true;
            sceneLayer_Sprites.drawSprite( Actors[i].getCurrentSprite(), Actors[i].x, Actors[i].y , flip);
        }


        // RENDER STAGE :
        if( selectedActor ){ 
            let box = selectedActor.getBoundingBox();
            let x =  box.x - Math.round( (cursorSelected.texture.width - box.width) / 2);
            let y =  box.y - Math.round( (cursorSelected.texture.height - box.height) / 2);
            
            sceneLayer_Sprites.drawSprite( cursorSelected , x, y  );
        }

        let coordActors = actorsAtCoords( input.MOUSEX, input.MOUSEY );

        if( coordActors.length ) sceneLayer_Sprites.drawSprite( cursorSelected, (input.MOUSEX / game.Camera.zoom ) +game.Camera.x -7 ,(input.MOUSEY / game.Camera.zoom ) +game.Camera.y -7  );
        else sceneLayer_Sprites.drawSprite( cursorRegular, (input.MOUSEX / game.Camera.zoom )-7 + game.Camera.x,(input.MOUSEY / game.Camera.zoom ) +game.Camera.y -7   );

    }

    game.Loop.update = function( deltaTime , input ){
        //console.log(input);
        //return;
        document.getElementById('actorsCounts').innerHTML = Actors.length;
        document.getElementById('FPS').innerHTML = game.Renderer.fps;
        document.getElementById("scaleInfo").innerHTML = game.Camera.zoom.toFixed(2);
        document.getElementById("scrollInfo").innerHTML = ( game.Camera.x << 0 ) +' | '+ ( game.Camera.y << 0 );

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
        
        if(input['arrow-right']) game.Camera.scrollAnimation( game.Camera.x + 10, game.Camera.y );
        if(input['arrow-left']) game.Camera.scrollAnimation( game.Camera.x - 10, game.Camera.y );
        if(input['arrow-up']) game.Camera.scrollAnimation( game.Camera.x , game.Camera.y - 10 );
        if(input['arrow-down']) game.Camera.scrollAnimation( game.Camera.x , game.Camera.y + 10 );
        
        if(input['draw-but']) window.action='draw';
        if(input['erase-but']) window.action='erase';
        
        if(input['mouse-left']) applyAction( input.MOUSEX, input.MOUSEY );

        if(input['mouse-click']) onClick( input.MOUSEX, input.MOUSEY );

        // iterate all actors and update their States
        for(let i = 0; i < Actors.length; i++){ 
            Actors[i].updateState( myBackground );
        }

    }


   // _instance_ViewPort.setView( game.Camera );
})()


function setZoom( x,y,direction ){
    let newScale= game.Camera.zoom + ( 1 * direction );
    game.Camera.zoomAnimation(newScale, x , y);
}

function actorsAtCoords(x,y, single=false){
    let tolerance = 3;
    let affected = [];
    [x,y] = game.Viewport.getAbsoluteCoordinates(x,y);
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
            game.Camera.follow( affected[ 0 ] );
            selectedActor = affected[ 0 ];
        }
        else{ 
            game.Camera.follow( false );
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
        game.Camera.zoomAnimation( game.Camera.zoom + 1 , x , y  )
    }else if( window.action === 'zoomOut' ){
        game.Camera.zoomAnimation( game.Camera.zoom - 1 , x , y  )
    }else if( window.action === 'erase' ){
        [x , y] = game.Viewport.getAbsoluteCoordinates( x, y );

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
        [x , y] = game.Viewport.getAbsoluteCoordinates( x, y );

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



