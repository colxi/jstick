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
        if(Jstick.Viewport.view){
            document.getElementById("scaleInfo").innerHTML = Jstick.Viewport.view.zoom.toFixed(2);
            document.getElementById("scrollInfo").innerHTML = ( Jstick.Viewport.view.x << 0 ) +' | '+ ( Jstick.Viewport.view.y << 0 );
        }
    },

}


export {Jstick};