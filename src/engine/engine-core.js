
let _stylesDef = `
    [hide-device-cursor]{ cursor : none !important; }

`;

let _styles       = document.createElement('style');
_styles.innerHTML = _stylesDef;
document.body.appendChild(_styles);

const JStick  = {
    rootpath : '',
    status : 1,
    showInfo : true,
    debug : false,

    log(...args){
        if(JStick.debug) console.log(...args);
    },

    updateInfo(){
        // info panel

        document.getElementById('FPS').innerHTML = JStick.FPS.value;
        document.getElementById("scaleInfo").innerHTML = JStick.Viewport.scale.toFixed(2);
        document.getElementById("scrollInfo").innerHTML = Math.floor(JStick.Viewport.Scroll.x) +' | '+Math.floor(JStick.Viewport.Scroll.y);

        //let b = Map.getBufferIndex(lem.x+lem.w-3,lem.y+lem.h)
        //document.getElementById('mapData').innerHTML= Map.buffer[b+3];
    },

    frame(e){
        if(!this.status) return;
        this.tick();
        requestAnimationFrame( ()=>this.frame() ); // use an arrow function to force the binding
    },

    tick(){
        JStick.Viewport.updateZoom();
        JStick.Viewport.updateScroll();
        let input = JStick.Input.getStatus();
        JStick.Loop.update( input );
        JStick.Loop.draw( input );
        if( JStick.showInfo ) JStick.updateInfo();
        // reset some possible events like mousewheel
        JStick.Input.__update__();
    },


    toggle(){
        JStick.status = !JStick.status;
        JStick.frame();
    },
    
    Loop : {
        update(){
            // user provided 
        },
        draw(){
            // user provided 
        }
    }
}




export {JStick};