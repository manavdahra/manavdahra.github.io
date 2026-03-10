import Game from './snake-game.js';

window.onload = () => {
    const canvasContainer = document.getElementById('intro-canvas');
    if (!canvasContainer) return;
    
    canvasContainer.focus();
    const game = new Game({ canvasContainer, debug: false });
    game.run();
}

window.onClickNavBarItem = (element) => {
	const elements = document.getElementsByClassName('active');
	for (let element of elements) { element.classList.remove('active'); }
	element.classList.add('active');
}
