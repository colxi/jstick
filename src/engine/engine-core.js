const Jstick  = {
    rootpath : '',
    status   : true,
    showInfo : true,
    debug    : false,

    log(...args){
        if(Jstick.debug) console.log(...args);
    },

    updateInfo(){
        // info panel

        document.getElementById('FPS').innerHTML = Jstick.Loop.fps;
        if(Jstick.RenderEngine.activeScene){
            document.getElementById("scaleInfo").innerHTML = Jstick.RenderEngine.activeScene.Camera.zoom.toFixed(2);
            document.getElementById("scrollInfo").innerHTML = ( Jstick.RenderEngine.activeScene.Camera.x << 0 ) +' | '+ ( Jstick.RenderEngine.activeScene.Camera.y << 0 );
        }
    },

}


export {Jstick};