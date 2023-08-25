'use strict'; // Ativa o modo estrito do JavaScript

// Seleciona elementos HTML com base em atributos de dados (data attributes)
const slideWrapper = document.querySelector('[data-slide="wrapper"]');
const slideList = document.querySelector('[data-slide="list"]');
const navPreviousButton = document.querySelector('[data-slide="nav-previous-button"]');
const navNextButton = document.querySelector('[data-slide="nav-next-button"]');
const controlsWrapper = document.querySelector('[data-slide="controls-wrapper"]');
let slideItems = document.querySelectorAll('[data-slide="item"]'); // Seleciona todos os elementos de slide
let controlButtons; // Variável para armazenar os botões de controle
let slideInterval; // Variável para armazenar o intervalo de troca automática de slides

// Objeto de estado que armazena informações sobre o estado do carrossel
const state = {
    startingPoint: 0,
    savedPosition: 0,
    currentPoint: 0,
    movement: 0,
    currentSlideIndex: 0,
    autoPlay: true,
    timeInterval: 0
}

// Função para mover os slides (altera a posição)
function translateSlide({ position }) {
    state.savedPosition = position;
    slideList.style.transform = `translateX(${position}px)`;
}

// Função para obter a posição central de um slide com base em seu índice
function getCenterPosition({ index }) {
    const slideItem = slideItems[index];
    const slideWidth = slideItem.clientWidth;
    const windowWidth = document.body.clientWidth;
    const margin = (windowWidth - slideWidth) / 2;
    const position = margin - (index * slideWidth);
    return position;
}

// Função para definir qual slide deve ser visível
function setVisibleSlide({ index, animate }) {
    // Verifica se o índice está nos limites, caso contrário, mantém o índice atual
    if (index === 0 || index === slideItems.length - 1) {
        index = state.currentSlideIndex;
    }
    const position = getCenterPosition({ index });
    state.currentSlideIndex = index;
    // Define a transição ou remove-a, dependendo do parâmetro 'animate'
    slideList.style.transition = animate === true ? 'transform .5s' : 'none';
    // Ativa o botão de controle correspondente
    activeControlButton({ index });
    // Move o slide para a posição desejada
    translateSlide({ position: position });
}

// Função para avançar para o próximo slide
function nextSlide() {
    setVisibleSlide({ index: state.currentSlideIndex + 1, animate: true });
}

// Função para retroceder para o slide anterior
function previousSlide() {
    setVisibleSlide({ index: state.currentSlideIndex - 1, animate: true });
}

// Função para criar botões de controle para cada slide
function createControlButtons() {
    slideItems.forEach(function () {
        const controlButton = document.createElement('button');
        controlButton.classList.add('slide-control-button');
        controlButton.classList.add('fas');
        controlButton.classList.add('fa-circle');
        controlButton.dataset.slide = 'control-button';
        controlsWrapper.append(controlButton);
    });
}

// Função para ativar o botão de controle correspondente ao slide atual
function activeControlButton({ index }) {
    const slideItem = slideItems[index];
    const dataIndex = Number(slideItem.dataset.index);
    const controlButton = controlButtons[dataIndex];
    controlButtons.forEach(function (controlButtonItem) {
        controlButtonItem.classList.remove('active');
    });
    if (controlButton) controlButton.classList.add('active');
}

// Função para criar clones dos primeiros e últimos slides
function createSlideClones() {
    const firstSlide = slideItems[0].cloneNode(true);
    firstSlide.classList.add('slide-cloned');
    firstSlide.dataset.index = slideItems.length;

    const secondSlide = slideItems[1].cloneNode(true);
    secondSlide.classList.add('slide-cloned');
    secondSlide.dataset.index = slideItems.length + 1;

    const lastSlide = slideItems[slideItems.length - 1].cloneNode(true);
    lastSlide.classList.add('slide-cloned');
    lastSlide.dataset.index = -1;

    const penultimateSlide = slideItems[slideItems.length - 2].cloneNode(true);
    penultimateSlide.classList.add('slide-cloned');
    penultimateSlide.dataset.index = -2;

    slideList.append(firstSlide);
    slideList.append(secondSlide);
    slideList.prepend(lastSlide);
    slideList.prepend(penultimateSlide);

    slideItems = document.querySelectorAll('[data-slide="item"]');
    
}

// Função executada quando o mouse é pressionado em um slide
function onMouseDown(event, index) {
    const slideItem = event.currentTarget;
    state.startingPoint = event.clientX;
    state.currentPoint = event.clientX - state.savedPosition;
    state.currentSlideIndex = index;
    slideList.style.transition = 'none';
    slideItem.addEventListener('mousemove', onMouseMove);
}

// Função executada quando o mouse é movido durante o arrasto
function onMouseMove(event) {
    state.movement = event.clientX - state.startingPoint;
    const position = event.clientX - state.currentPoint;
    translateSlide({ position });
}

// Função executada quando o mouse é solto após o arrasto
function onMouseUp(event) {
    const pointsToMove = event.type.includes('touch') ? 50 : 150;
    if (state.movement < -pointsToMove) {
        nextSlide();
    } else if (state.movement > pointsToMove) {
        previousSlide();
    } else {
        setVisibleSlide({ index: state.currentSlideIndex, animate: true });
    }
    state.movement = 0;
    const slideItem = event.currentTarget;
    slideItem.removeEventListener('mousemove', onMouseMove);
}

// Função executada quando o toque na tela começa
function onTouchStart(event, index) {
    event.clientX = event.touches[0].clientX;
    onMouseDown(event, index);
    const slideItem = event.currentTarget;
    slideItem.addEventListener('touchmove', onTouchMove);
}

// Função executada quando o toque na tela é movido
function onTouchMove(event) {
    event.clientX = event.touches[0].clientX;
    onMouseMove(event);
}

// Função executada quando o toque na tela termina
function onTouchEnd(event) {
    onMouseUp(event);
    const slideItem = event.currentTarget;
    slideItem.removeEventListener('touchmove', onTouchMove);
}

// Função executada quando um botão de controle é clicado
function onControlButtonClick(index) {
    setVisibleSlide({ index: index + 2, animate: true });
}

// Função executada quando a transição da lista de slides termina
function onSlideListTransitionEnd() {
    const slideItem = slideItems[state.currentSlideIndex];

    // Verifica se o slide atual é um clone no início ou no final da lista
    if (slideItem.classList.contains('slide-cloned') && Number(slideItem.dataset.index) > 0) {
        setVisibleSlide({ index: 2, animate: false });
    }
    if (slideItem.classList.contains('slide-cloned') && Number(slideItem.dataset.index) < 0) {
        setVisibleSlide({ index: slideItems.length - 3, animate: false });
    }
}

// Função para configurar o autoplay (troca automática de slides)
function setAutoPlay() {
    if (state.autoPlay) {
        slideInterval = setInterval(function () {
            setVisibleSlide({ index: state.currentSlideIndex + 1, animate: true });
        }, state.timeInterval);
    }
}

// Função para configurar os ouvintes de eventos
function setListeners() {
    controlButtons = document.querySelectorAll('[data-slide="control-button"]');
    controlButtons.forEach(function (controlButton, index) {
        controlButton.addEventListener('click', function (event) {
            onControlButtonClick(index);
        });
    });

    slideItems.forEach(function (slideItem, index) {
        slideItem.addEventListener('dragstart', function (event) {
            event.preventDefault();
        });
        slideItem.addEventListener('mousedown', function (event) {
            onMouseDown(event, index);
        });
        slideItem.addEventListener('mouseup', onMouseUp);
        slideItem.addEventListener('touchstart', function (event) {
            onTouchStart(event, index);
        });
        slideItem.addEventListener('touchend', onTouchEnd);
    });

    navNextButton.addEventListener('click', nextSlide);
    navPreviousButton.addEventListener('click', previousSlide);
    slideList.addEventListener('transitionend', onSlideListTransitionEnd);

    // Pausa o autoplay quando o mouse entra no carrossel
    slideWrapper.addEventListener('mouseenter', function () {
        clearInterval(slideInterval);
    });

    // Inicia o autoplay quando o mouse sai do carrossel
    slideWrapper.addEventListener('mouseleave', function () {
        setAutoPlay();
    });

    // Reajusta o slide quando a janela é redimensionada
    let resizeTimeout;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function () {
            setVisibleSlide({ index: state.currentSlideIndex, animate: true });
        }, 1000);
    });
}

// Função de inicialização principal do carrossel
function initSlider({ startAtIndex = 0, autoPlay = true, timeInterval = 3000 }) {
    state.autoPlay = autoPlay;
    state.timeInterval = timeInterval;
    createControlButtons();
    createSlideClones();
    setListeners();
    setVisibleSlide({ index: startAtIndex + 2, animate: true });
    setAutoPlay();
}
