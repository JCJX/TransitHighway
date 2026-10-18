// All speeds are metres/second in the road frame. Positive z is behind the player.
export function prepareBatteryCars(cars,dt,roadSpeed){for(const e of cars){if(!Number.isFinite(e.forwardSpeed))e.forwardSpeed=roadSpeed*.58;if(e.dropped){e.forwardSpeed=Math.max(0,e.forwardSpeed-9*dt);e.stopped=e.forwardSpeed===0;}e.speed=roadSpeed-e.forwardSpeed;}}
