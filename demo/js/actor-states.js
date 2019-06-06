
function checkGroundCollision( sprite ){
    let x = Math.floor( this.x +5 - (5/2) );
    let y = Math.floor( this.y + 5-1 );

}


function canGoDown( actor ){
    /*
    JstickAnimations
    actor.x 
    actor.action.animation.imageBitmap.width + ()
    let bottomX = Math.floor( sprite.x + 5 - (5/2) );
    let bottomY = Math.floor( sprite.y + 5-1 );

    if( pixelMap.isPixelTransparent(groundX(lem), groundY(lem)+1) &&
        pixelMap.isPixelTransparent(groundX(lem) + (1 *lem.attributes.direction), groundY(lem)+1) &&
        pixelMap.isPixelTransparent(groundX(lem) + (2 *lem.attributes.direction), groundY(lem)+1) ){
        return true;
    }
    */
}

function groundX(lem){ return Math.floor( lem.x + 5 - (5/2) ) };

function groundY(lem){ return Math.floor( lem.y + 9 - 1 ) }

let myStates = {
    fall(lem, pixelMap){
        lem.y++;
        if( !pixelMap.isPixelTransparent(groundX(lem), groundY(lem)) ){ 
            lem.y--;
            lem.setState('walk');
            return;
        }

    },
    tunnel(lem, pixelMap){
        // block if empty under the lemming
        if( pixelMap.isPixelTransparent(groundX(lem), groundY(lem)+1) &&
        pixelMap.isPixelTransparent(groundX(lem) + (1 *lem.attributes.direction), groundY(lem)+1) &&
        pixelMap.isPixelTransparent(groundX(lem) + (2 *lem.attributes.direction), groundY(lem)+1) ){
            lem.setState('fall');
            return;
        }

        if( lem.__stateTick__ % 10 === 0 ){
            pixelMap.clearPixel(lem.x + 5 , lem.y + 0 );
            pixelMap.clearPixel(lem.x + 5 , lem.y + 1 );
            pixelMap.clearPixel(lem.x + 5 , lem.y + 2 );
            pixelMap.clearPixel(lem.x + 5 , lem.y + 3 );
            pixelMap.clearPixel(lem.x + 5 , lem.y + 4 );
            pixelMap.clearPixel(lem.x + 5 , lem.y + 5 );
            pixelMap.clearPixel(lem.x + 5 , lem.y + 6 );
            pixelMap.clearPixel(lem.x + 5 , lem.y + 7 );
            pixelMap.clearPixel(lem.x + 5 , lem.y + 8 );
            lem.x++;
        }

    },
    dig(lem, pixelMap){
        // block if empty under the lemming
        if( pixelMap.isPixelTransparent(groundX(lem), groundY(lem)+1) &&
        pixelMap.isPixelTransparent(groundX(lem) + (1 *lem.attributes.direction), groundY(lem)+1) &&
        pixelMap.isPixelTransparent(groundX(lem) + (2 *lem.attributes.direction), groundY(lem)+1) ){
            lem.setState('fall');
            return;
        }

        if( lem.__stateTick__ % 10 === 0 ){
            pixelMap.clearPixel(lem.x , groundY(lem)+1 );
            pixelMap.clearPixel(lem.x +1, groundY(lem)+1 );
            pixelMap.clearPixel(lem.x +2, groundY(lem)+1 );
            pixelMap.clearPixel(lem.x +3, groundY(lem)+1 );
            pixelMap.clearPixel(lem.x +4, groundY(lem)+1 );
            pixelMap.clearPixel(lem.x +5, groundY(lem)+1 );
            lem.y++;
        }
             
    },
    walk(lem, pixelMap){
        if(lem.actionTick % 3) return;
        lem.x  = lem.x + ( .5 * lem.attributes.direction );
        
        // if should fall... adjust y coordinate
        if( pixelMap.isPixelTransparent(groundX(lem), groundY(lem)+1) &&
            pixelMap.isPixelTransparent(groundX(lem) + (1 *lem.attributes.direction), groundY(lem)+1) &&
            pixelMap.isPixelTransparent(groundX(lem) + (2 *lem.attributes.direction), groundY(lem)+1) ){ 
            lem.y++;
            // if the fall is bigger than 3 pixels, set falling action
            if( pixelMap.isPixelTransparent(groundX(lem), groundY(lem)+1) && 
                pixelMap.isPixelTransparent(groundX(lem), groundY(lem)+2) &&
                pixelMap.isPixelTransparent(groundX(lem), groundY(lem)+3) &&
                pixelMap.isPixelTransparent(groundX(lem), groundY(lem)+4) 
            ) lem.setState('fall');
            return;
        }
        // if it shouldnt fall... keep walking
        else{
            if( pixelMap.isPixelTransparent(groundX(lem), groundY(lem)) ){ } // do nothing 
            else if( pixelMap.isPixelTransparent(groundX(lem), groundY(lem)-1) ) lem.y -= 1;
            else if( pixelMap.isPixelTransparent(groundX(lem), groundY(lem)-2) ) lem.y -= 2;
            else{
                lem.attributes.direction *= -1;
                lem.flip.x = !lem.flip.x;
                lem.x  = lem.x + ( 1 * lem.attributes.direction );
            } 

            if( !pixelMap.isPixelTransparent(groundX(lem), groundY(lem)-3) ||
                !pixelMap.isPixelTransparent(groundX(lem), groundY(lem)-4) 
            ){ 
                lem.attributes.direction *= -1;
                lem.flip.x = !lem.flip.x;
                lem.x  = lem.x + ( 1 * lem.attributes.direction );
            }
        }


    }
};

export {myStates}