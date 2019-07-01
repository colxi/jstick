

let ACTOR_ID = 0;


const Actor =  function( config  ){
    // handle requests performed without using the keyword 'new'
    // otherwhise the Constructor will fail for the lack of own context (this)
    if( !new.target ) return new Actor( ...arguments );

    this.__id__                    = ACTOR_ID++;
    this.__stateTick__             = 0;
    this.__lasAnimationKeyframe__  = 0;
    this.__states__                = {} 
    this.type           = config.type || 'default';
    this.x              = config.x || 0;
    this.y              = config.y || 0;
    this.state          = config.state || 'default';
    this.flip           = {
        x : false,
        y : false
    }
    this.data     = config.data || {}; // eg: vulnerable, block, ...
    this.data.__parent__ = this;
    for(let i=0; i<config.states.length; i++){
        let stateName = config.states[i].name;
        this.__states__[stateName] = config.states[i];
    }

}

Actor.prototype.getBoundingBox = function(){
    let currentSpriteImage = this.getCurrentSprite().texture;
    return {
        x : this.x, 
        y : this.y, 
        width: currentSpriteImage.width, 
        height: currentSpriteImage.height 
    }
}

Actor.prototype.getCurrentSprite = function(){
    return this.__states__[this.state].animation.keyframes[this.__lasAnimationKeyframe__];
};

Actor.prototype.getCurrentAnimation = function(){
    return this.__states__[this.state].animation;
};



Actor.prototype.setState = function(state){
    if( !this.__states__.hasOwnProperty(state) ) throw new Error('The Actor #' + this.__id__ + ' has no state called : ' + state);
    this.state                    = state;
    this.__stateTick__            = 0;
    this.__lasAnimationKeyframe__ = 0;
    return true;
};

Actor.prototype.updateState = function(...args){
    // increase the counter of the state by 1 cycle
    this.__stateTick__++;
    // recover the state animation keyframes definitions
    let animation = this.getCurrentAnimation();
    // calculate according to the __stateTick__ in which frame
    // the animation should be
    let animationFrame = this.__stateTick__ % animation.length;
    // if corresponding frame has a keyframe in animation definition...
    if( animation.keyframes.hasOwnProperty(animationFrame) ){ 
        let hasAnimationEnded = this.__stateTick__ > animation.length;
        /// and looping is enabled, or looping is disabled but
        // animation has notyet ended(), assign new animationKeyframe
        if( animation.loop || !hasAnimationEnded  ) this.__lasAnimationKeyframe__ = animationFrame;
    }
    // callexecute the State controller
    this.__states__[this.state].controller( this, ...args );
    return true;
};



export {Actor};