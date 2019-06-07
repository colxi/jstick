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
        document.getElementById("scaleInfo").innerHTML = Jstick.Camera.zoom.toFixed(2);
        document.getElementById("scrollInfo").innerHTML = ( Jstick.Camera.x << 0 ) +' | '+ ( Jstick.Camera.y << 0 );
    },

}


export {Jstick};