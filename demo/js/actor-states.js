import { Sprite, Animation, Texture, State}  from '../../src/jstick.js';




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


async function generateStates(){

    let spriteSheet    =  await new Texture( './spritesheet/lemmings.png' );

    let walkAnimation = new Animation({
        0  : await new Sprite( spriteSheet,  5,  1, 4, 9 ), 
        10 : await new Sprite( spriteSheet, 21,  0, 5, 10 ), 
        20 : await new Sprite( spriteSheet, 36,  1, 6, 9 ), 
        30 : await new Sprite( spriteSheet, 52,  1, 5, 9 ), 
        40 : await new Sprite( spriteSheet, 69,  1, 4, 9 ), 
        50 : await new Sprite( spriteSheet, 85,  0, 5, 10 ), 
        60 : await new Sprite( spriteSheet, 100, 1, 6, 9 ),
        70 : await new Sprite( spriteSheet, 116, 1, 5, 9 ) 
    } , 80 , true ); 



    let myStates = {
        block : new State( 
            'block', 
            walkAnimation, 
            (lem, pixelMap)=>{
                if( lem.__stateTick__ === 1 ){
                    console.log('aaa')
                    pixelMap.setPixel(lem.x+2 , lem.y+3 , [255,255,255,255]);
                    pixelMap.setPixel(lem.x+2 , lem.y+4 , [255,255,255,255]);
                    pixelMap.setPixel(lem.x+2 , lem.y+5 , [255,255,255,255]);
                    pixelMap.setPixel(lem.x+2 , lem.y+6 , [255,255,255,255]);
                    pixelMap.setPixel(lem.x+2 , lem.y+7 , [255,255,255,255]);
                    pixelMap.apply();
                }

            } 
        ),
        fall : new State( 
            'fall', 
            walkAnimation, 
            (lem, pixelMap)=>{
                lem.y++;
                if( !pixelMap.isPixelTransparent( groundX(lem), groundY(lem) ) ){ 
                    lem.y--;
                    lem.setState('walk');
                }
                return;
            }
        ),
        tunnel : new State( 
            'tunnel', 
            walkAnimation, 
            (lem, pixelMap)=>{
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
                    pixelMap.apply();

                    lem.x++;
                }
            }
        ),
        dig : new State( 
            'dig',  
            walkAnimation, 
            (lem, pixelMap)=>{
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
                    pixelMap.clearPixel(lem.x +6, groundY(lem)+1 );
                    pixelMap.apply();

                    lem.y++;
                }
            }
        ),   
        walk : new State( 
            'walk', 
            walkAnimation,
            (lem, pixelMap)=>{
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
        )
    };

    return myStates;
}

export {generateStates};