import {JStick} from '../jstick.js';

JStick.Input = {
    
};




JStick.Map = {
    draw( map ){
        // Draw map data in canvas
        JStick.Viewport.Layers.map.drawImage( 
            map, 
            0 - JStick.Viewport.Scroll.x, 
            0 - JStick.Viewport.Scroll.y, 
            JStick.Viewport.width , 
            JStick.Viewport.height
        )   
    }
};
