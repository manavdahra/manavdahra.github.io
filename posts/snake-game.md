# Building a 3D Snake Game: A Journey Through WebGL and Physics

Creating this 3D snake game was an incredible learning experience that took me deep into the worlds of computer graphics, physics simulation, and interactive web development. Here are the key lessons I learned along the way.

## The Tech Stack

I built this game using:
- **Three.js** - A powerful WebGL library that makes 3D graphics accessible
- **Cannon.js** - A physics engine that brings realistic movement and collisions
- **CSS2DRenderer** - For overlaying UI elements like the score
- **Vanilla JavaScript** - No framework overhead, just pure ES6 modules

## Lesson 1: Physics Isn't Just About Realism

When I first started, I thought physics engines were only for realistic simulations. **I was wrong.**

Physics engines like Cannon.js provide something more valuable: **consistent, predictable behavior** that handles edge cases you'd never think to code yourself. Collision detection, velocity constraints, angular momentum - these are all solved problems.

The key insight: Don't fight the physics engine. Work with it.

### The Snake's Body Problem

The hardest part was making the snake's body follow the head smoothly. My first approach was purely kinematic - calculating positions based on the path. It looked robotic and lifeless.

The breakthrough came when I embraced the physics engine:

```javascript
// Each body segment is a physics body with constraints
const constraint = new PointToPointConstraint(
    prevSegment.body,
    new Vec3(0, 0, segmentLength / 2),
    segment.body,
    new Vec3(0, 0, -segmentLength / 2)
);
```

By using point-to-point constraints, the snake's body naturally follows the head with realistic momentum and wobble. The physics engine handles all the math.

## Lesson 2: Camera Control Makes or Breaks the Experience

A third-person camera that follows a moving object is deceptively complex. It's not just about positioning - it's about **anticipation and smoothness**.

```javascript
// Smooth camera follow with lerp (linear interpolation)
camera.position.lerp(targetPosition, 0.1);
camera.lookAt(snake.headPosition);
```

The magic number `0.1` took hours of tweaking. Too high, and the camera feels jittery. Too low, and it lags behind uncomfortably.

**Key learning:** User experience in 3D games is 80% about camera and controls, 20% about everything else.

## Lesson 3: Mobile Controls Are a Different Beast

Desktop keyboard controls are straightforward. Mobile touch controls? That's where things get interesting.

I had to solve:
- **Continuous movement** - The snake should move while finger is down, not just on tap
- **Direction changes** - Swipe gestures need to feel natural
- **Visual feedback** - Users need to know where they're touching

The solution combined touch events with state management:

```javascript
canvas.addEventListener('touchstart', (e) => {
    this.touchDown = true;
    this.touchStartX = e.touches[0].clientX;
});

canvas.addEventListener('touchmove', (e) => {
    if (!this.touchDown) return;
    const deltaX = e.touches[0].clientX - this.touchStartX;
    if (Math.abs(deltaX) > 30) {
        this.turnSnake(deltaX > 0 ? 'right' : 'left');
        this.touchStartX = e.touches[0].clientX;
    }
});
```

**Lesson learned:** Always test on real devices. Chrome DevTools mobile emulation doesn't capture the feel of actual touch interactions.

## Lesson 4: Textures and Visual Polish Matter

My first version had a solid green snake. Functional, but boring.

Adding a procedural texture changed everything:

```javascript
createSnakePattern() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    // Base color
    ctx.fillStyle = '#AAff00';
    ctx.fillRect(0, 0, 64, 64);
    
    // Add black stripes/scales pattern
    ctx.fillStyle = '#000000';
    for (let i = 0; i < 64; i += 16) {
        for (let j = 0; j < 64; j += 16) {
            if ((i + j) % 32 === 0) {
                ctx.fillRect(i, j, 12, 12);
            }
        }
    }
    
    const texture = new CanvasTexture(canvas);
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    return texture;
}
```

Creating textures programmatically with canvas gives you:
- No external assets to load
- Parametric control (easy to change colors/patterns)
- Tiny file size

**The principle:** Small visual details have disproportionate impact on perceived quality.

## Lesson 5: The Animation Loop Is Your Heartbeat

The game loop ties everything together. Every frame, you need to:

1. Update physics simulation
2. Update game state
3. Check for collisions
4. Update camera
5. Render the scene

Order matters enormously. Physics before state. State before rendering.

```javascript
animate() {
    requestAnimationFrame(() => this.animate());
    
    const deltaTime = Math.min(this.clock.getDelta(), 0.1);
    
    // 1. Physics
    this.world.step(1/60, deltaTime, 3);
    
    // 2. Game logic
    if (this.isPlaying) {
        this.snake.update(deltaTime);
        this.checkCollisions();
    }
    
    // 3. Camera
    this.updateCamera();
    
    // 4. Render
    this.renderer.render(this.scene, this.camera);
    this.labelRenderer.render(this.scene, this.camera);
}
```

The `Math.min(this.clock.getDelta(), 0.1)` cap prevents physics explosions when the tab loses focus and regains it - a bug that took me hours to track down.

## Lesson 6: Debugging 3D Is Different

When your game has a bug, you can't just `console.log()` your way through it. You need visual debugging tools.

Cannon.js has a debugger that renders physics bodies as wireframes. This was invaluable for understanding why collisions weren't working as expected.

```javascript
import cannonDebugger from 'cannon-es-debugger';
const debugger = cannonDebugger(scene, world.bodies);
```

**Pro tip:** Build debug modes into your game from day one. Toggle-able with a key press. Future you will thank present you.

## Lessons on Performance

Running 3D graphics and physics at 60fps on a web page isn't trivial. Here's what I learned:

### 1. Minimize Physics Bodies
Each body in the physics world costs computation. My apple collection system initially created hundreds of physics bodies. I refactored to reuse a pool of 10 apple objects.

```javascript
// Bad: Creating new physics body each time
spawnApple() {
    const apple = new Apple(this.scene, this.world);
    this.apples.push(apple);
}

// Good: Reuse from pool
spawnApple() {
    const apple = this.applePool.find(a => !a.active);
    apple.respawn(position);
}
```

### 2. Reduce Draw Calls
Every unique material causes a separate draw call. I use one shared texture for all snake segments, reducing draw calls from 20+ to 1.

### 3. Throttle Non-Critical Updates
HUD elements don't need 60fps updates. Score display updates once per collection, not every frame.

## The Biggest Lesson: Iterate and Ship

I spent weeks trying to make the "perfect" snake game before showing anyone. Then I shipped a basic version and got feedback:

- "The camera is too close" - Easy fix I hadn't considered
- "Mobile controls are confusing" - Led to the tutorial overlay
- "Can you add a pause button?" - Obvious in retrospect

**Shipping early taught me more than weeks of solo development.**

## What's Next?

This project opened my eyes to the possibilities of browser-based 3D experiences. Some ideas I'm exploring:

- Multiplayer using WebSockets
- Procedurally generated levels
- Sound design and audio feedback
- Particle effects for visual juice

## Key Takeaways

1. **Use physics engines** - They solve harder problems than you realize
2. **Polish the camera** - It's the player's window into your world
3. **Test on real devices** - Especially for touch controls
4. **Visual feedback** - Small details create big experiences
5. **Debug visually** - 3D bugs need 3D tools
6. **Optimize smartly** - Profile first, optimize second
7. **Ship early** - Real feedback beats perfect code

Building this game taught me that modern browsers are incredibly powerful platforms for interactive experiences. With WebGL, physics engines, and ES6 modules, you can create surprisingly sophisticated applications that run on any device.

The web is the most accessible platform for creative coding. No installation, no app store approval, just a URL. That's powerful.

---

**Want to see the code?** Check out the [source on GitHub](https://github.com/manavdahra/dev-blog) or play around with the demo above. Feel free to fork it and build your own version!

## Additional Resources

If you're interested in learning more about WebGL game development, here are some resources I found invaluable:

- [Three.js Documentation](https://threejs.org/docs/) - Comprehensive and well-organized
- [Cannon.js GitHub](https://github.com/pmndrs/cannon-es) - The physics engine powering our snake
- [WebGL Fundamentals](https://webglfundamentals.org/) - For understanding what Three.js does under the hood
- [Game Programming Patterns](https://gameprogrammingpatterns.com/) - Timeless design patterns for games

Happy coding! 🐍
