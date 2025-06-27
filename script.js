function handleAddTileClick() {
    addParticipantBlock(true);
}
function clearChoices(resultDisplayElement) {
    if (resultDisplayElement) {
        const participantBlock = resultDisplayElement.closest('.participant-block');
        const selectedHero = participantBlock.selectedHero;
        if (selectedHero) {
            toggleGlobalBan(selectedHero.name, participantBlock.id, false);
            participantBlock.selectedHero = null;
        }
        if (participantBlock.classList.contains('expanded') || participantBlock.classList.contains('expanded-simple')) {
            resultDisplayElement.classList.add('fading-out');
            participantBlock.classList.remove('expanded', 'expanded-simple');
            setTimeout(() => {
                resultDisplayElement.innerHTML = '';
                resultDisplayElement.classList.remove('fading-out');
            }, 300);
        } else {
            resultDisplayElement.innerHTML = '';
        }
        const clearButton = participantBlock.querySelector('.clear-btn');
        if (clearButton) {
            clearButton.style.display = 'none';
        }
    }
}
function addParticipantBlock(animate = false) {
    if (participantCount >= MAX_PARTICIPANTS) {
        return;
    }
    const firstStates = new Map();
    document.querySelectorAll('.participant-block').forEach(tile => {
        firstStates.set(tile, tile.getBoundingClientRect());
    });
    const participantsContainer = document.getElementById('participantsContainer');
    const addTile = document.getElementById('addParticipantTile');
    const newParticipantBlock = document.createElement('div');
    newParticipantBlock.className = 'participant-block';
    participantCount++;
    newParticipantBlock.id = `participant-block-${participantCount}`;
    newParticipantBlock.excludedHeroes = [];
    newParticipantBlock.selectedHero = null;
    newParticipantBlock.clickCount = 0;
    newParticipantBlock.lastClickTime = 0;
    const nameInputDiv = document.createElement('div');
    nameInputDiv.className = 'participant-name-input';
    nameInputDiv.innerHTML = `
        <input type="text" id="participantName${participantCount}" placeholder="Joueur ${participantCount}" value="Joueur ${participantCount}">
    `;
    const roleButtonsDiv = document.createElement('div');
    roleButtonsDiv.className = 'role-buttons';
    roleButtonsDiv.innerHTML = `
        <div class="role-buttons-top-row">
            <button type="button" class="tank" tabindex="-1"><img src="img/tank.png" alt="Tank"></button>
            <button type="button" class="damage" tabindex="-1"><img src="img/damage.png" alt="Damage"></button>
            <button type="button" class="support" tabindex="-1"><img src="img/support.png" alt="Support"></button>
        </div>
        <button type="button" class="openQueue" tabindex="-1">Open Queue</button>
    `;
    const resultDisplayDiv = document.createElement('div');
    resultDisplayDiv.className = 'result-display';
    resultDisplayDiv.id = `result-display-${participantCount}`;
    const clearButton = document.createElement('button');
    clearButton.className = 'clear-btn';
    clearButton.textContent = 'Effacer les choix';
    clearButton.type = 'button';
    clearButton.tabIndex = -1;
    clearButton.style.display = 'none';
    clearButton.addEventListener('click', () => clearChoices(resultDisplayDiv));
    newParticipantBlock.appendChild(nameInputDiv);
    newParticipantBlock.appendChild(roleButtonsDiv);
    newParticipantBlock.appendChild(resultDisplayDiv);
    newParticipantBlock.appendChild(clearButton);
    participantsContainer.insertBefore(newParticipantBlock, addTile);
    newParticipantBlock.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        let contextMenu = document.getElementById('contextMenu');
        if (!contextMenu) {
            contextMenu = document.createElement('div');
            contextMenu.id = 'contextMenu';
            contextMenu.className = 'context-menu';
            contextMenu.innerHTML = `
                <span class="context-menu-item" id="deleteItem">Supprimer</span>
                <span class="context-menu-item" id="excludeHeroItem">Bannir des héros</span>
            `;
            document.body.appendChild(contextMenu);
            document.getElementById('deleteItem').addEventListener('click', () => {
                removeParticipantBlock(contextMenu.targetBlock);
                contextMenu.style.display = 'none';
            });
            document.getElementById('excludeHeroItem').addEventListener('click', () => {
                showExcludeModal(contextMenu.targetBlock);
                contextMenu.style.display = 'none';
            });
            document.addEventListener('click', () => {
                contextMenu.style.display = 'none';
            });
        }
        contextMenu.targetBlock = newParticipantBlock;
        contextMenu.style.top = `${event.clientY}px`;
        contextMenu.style.left = `${event.clientX}px`;
        contextMenu.style.display = 'block';
    });
    if (addTile) {
        addTile.remove();
    }
    if (participantCount < MAX_PARTICIPANTS) {
        createAddTile();
    }
    const lastStates = new Map();
    document.querySelectorAll('.participant-block').forEach(tile => {
        lastStates.set(tile, tile.getBoundingClientRect());
    });
    firstStates.forEach((firstRect, element) => {
        const lastRect = lastStates.get(element);
        if (lastRect) {
            const deltaX = firstRect.left - lastRect.left;
            const deltaY = firstRect.top - lastRect.top;
            if (deltaX !== 0 || deltaY !== 0) {
                element.style.transition = 'none';
                element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
                void element.offsetWidth;
                element.style.transition = '';
                element.style.transform = '';
            }
        }
    });
    const nameInput = document.getElementById(`participantName${participantCount}`);
    if (nameInput) {
        nameInput.addEventListener('input', (event) => {});
    }
    roleButtonsDiv.querySelector('.tank').addEventListener('click', (event) => showChoices('tank', resultDisplayDiv, newParticipantBlock, event));
    roleButtonsDiv.querySelector('.damage').addEventListener('click', (event) => showChoices('damage', resultDisplayDiv, newParticipantBlock, event));
    roleButtonsDiv.querySelector('.support').addEventListener('click', (event) => showChoices('support', resultDisplayDiv, newParticipantBlock, event));
    roleButtonsDiv.querySelector('.openQueue').addEventListener('click', (event) => showChoices('openQueue', resultDisplayDiv, newParticipantBlock, event));
    newParticipantBlock.style.pointerEvents = 'auto';
}
function removeParticipantBlock(block) {
    const firstStates = new Map();
    document.querySelectorAll('.participant-block').forEach(tile => {
        firstStates.set(tile, tile.getBoundingClientRect());
    });
    const selectedHero = block.selectedHero;
    if (selectedHero) {
        toggleGlobalBan(selectedHero.name, block.id, false);
    }
    block.remove();
    participantCount--;
    const participantBlocks = document.querySelectorAll('.participant-block:not(.add-block)');
    participantBlocks.forEach((tile, index) => {
        const participantNumber = index + 1;
        tile.id = `participant-block-${participantNumber}`;
        const nameInput = tile.querySelector('input[type="text"]');
        if (nameInput) {
            nameInput.id = `participantName${participantNumber}`;
        }
        const resultDisplay = tile.querySelector('.result-display');
        if (resultDisplay) {
            resultDisplay.id = `result-display-${participantNumber}`;
        }
    });
    createAddTile();
    const lastStates = new Map();
    document.querySelectorAll('.participant-block').forEach(tile => {
        lastStates.set(tile, tile.getBoundingClientRect());
    });
    firstStates.forEach((firstRect, element) => {
        const lastRect = lastStates.get(element);
        if (lastRect) {
            const deltaX = firstRect.left - lastRect.left;
            const deltaY = firstRect.top - lastRect.top;
            if (deltaX !== 0 || deltaY !== 0) {
                element.style.transition = 'none';
                element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
                void element.offsetWidth;
                element.style.transition = '';
                element.style.transform = '';
            }
        }
    });
}
var tanks = ['D.Va', 'Doomfist', 'Hazard', 'Junker Queen', 'Mauga', 'Orisa', 'Ramattra', 'Reinhardt', 'Roadhog', 'Sigma', 'Winston', 'Wrecking Ball', 'Zarya'];
var damages = ['Ashe', 'Bastion', 'Cassidy', 'Echo', 'Freja', 'Genji', 'Hanzo', 'Junkrat', 'Mei', 'Pharah', 'Reaper', 'Sojourn', 'Soldier: 76', 'Sombra', 'Symmetra', 'Torbjörn', 'Tracer', 'Venture', 'Widowmaker'];
var supports = ['Ana', 'Baptiste', 'Brigitte', 'Illari', 'Juno', 'Kiriko', 'Lifeweaver', 'Lúcio', 'Mercy', 'Moira', 'Zenyatta'];
let participantCount = 0;
const MAX_PARTICIPANTS = 6;
const globalBannedHeroes = new Map();
const selectedHeroesMap = new Map();
function preLoadImages() {
    var allHeroes = tanks.concat(damages, supports);
    var images = [];
    for (var i = 0; i < allHeroes.length; i++) {
        images[i] = new Image();
        images[i].src = 'img/' + formatHeroName(allHeroes[i]) + '.png';
    }
}
function createAddTile() {
    const participantsContainer = document.getElementById('participantsContainer');
    let addTile = document.getElementById('addParticipantTile');
    if (participantCount >= MAX_PARTICIPANTS) {
        if (addTile) {
            addTile.remove();
        }
        return;
    }
    if (!addTile) {
        addTile = document.createElement('div');
        addTile.id = 'addParticipantTile';
        addTile.className = 'participant-block add-block';
        addTile.addEventListener('click', handleAddTileClick);
        const addButton = document.createElement('button');
        addButton.id = 'addParticipantBtn';
        addButton.className = 'add-btn';
        addButton.textContent = '+';
        addButton.tabIndex = -1;
        addTile.appendChild(addButton);
        participantsContainer.appendChild(addTile);
    }
    addTile.style.display = 'flex';
}
function showChoices(type, resultDisplayElement, participantBlock, event) {
    if (!resultDisplayElement) return;
    const now = Date.now();
    if (now - participantBlock.lastClickTime < 1000) {
        participantBlock.clickCount++;
    } else {
        participantBlock.clickCount = 1;
    }
    participantBlock.lastClickTime = now;
    if (participantBlock.clickCount >= 5) {
        showCustomAlert("Arrête de spammer !");
        participantBlock.clickCount = 0;
        return;
    }
    const clearButton = participantBlock.querySelector('.clear-btn');
    const isHardcore = event && event.shiftKey;
    const isExpanded = participantBlock.classList.contains('expanded') || participantBlock.classList.contains('expanded-simple');
    if (isHardcore) {
        participantBlock.classList.add('hardcore-mode');
    } else {
        participantBlock.classList.remove('hardcore-mode');
    }
    if (isExpanded) {
        resultDisplayElement.classList.add('fading-out');
        participantBlock.classList.remove('expanded', 'expanded-simple');
        setTimeout(() => {
            resultDisplayElement.innerHTML = '';
            resultDisplayElement.classList.remove('fading-out');
            if (type === 'openQueue') {
                participantBlock.classList.add('expanded');
            } else {
                participantBlock.classList.add('expanded-simple');
            }
            if (type === 'openQueue') {
                const availableTanks = tanks.filter(hero => !participantBlock.excludedHeroes.includes(hero) && !globalBannedHeroes.has(hero));
                const availableDamages = damages.filter(hero => !participantBlock.excludedHeroes.includes(hero) && !globalBannedHeroes.has(hero));
                const availableSupports = supports.filter(hero => !participantBlock.excludedHeroes.includes(hero) && !globalBannedHeroes.has(hero));
                const tankChoices = isHardcore ? chooseRandomOne(availableTanks) : chooseRandomTwo(availableTanks);
                const damageChoices = isHardcore ? chooseRandomOne(availableDamages) : chooseRandomTwo(availableDamages);
                const supportChoices = isHardcore ? chooseRandomOne(availableSupports) : chooseRandomTwo(availableSupports);
                showOpenQueueWithImages(resultDisplayElement, tankChoices, damageChoices, supportChoices, participantBlock, isHardcore);
            } else {
                const array = type === 'tank' ? tanks : type === 'damage' ? damages : supports;
                const availableArray = array.filter(hero => !participantBlock.excludedHeroes.includes(hero) && !globalBannedHeroes.has(hero));
                const choices = isHardcore ? chooseRandomOne(availableArray) : chooseRandomTwo(availableArray);
                showChoicesWithImages(resultDisplayElement, type, choices, participantBlock, isHardcore);
            }
        }, 300);
    } else {
        if (type === 'openQueue') {
            participantBlock.classList.add('expanded');
        } else {
            participantBlock.classList.add('expanded-simple');
        }
        if (type === 'openQueue') {
            const availableTanks = tanks.filter(hero => !participantBlock.excludedHeroes.includes(hero) && !globalBannedHeroes.has(hero));
            const availableDamages = damages.filter(hero => !participantBlock.excludedHeroes.includes(hero) && !globalBannedHeroes.has(hero));
            const availableSupports = supports.filter(hero => !participantBlock.excludedHeroes.includes(hero) && !globalBannedHeroes.has(hero));
            const tankChoices = isHardcore ? chooseRandomOne(availableTanks) : chooseRandomTwo(availableTanks);
            const damageChoices = isHardcore ? chooseRandomOne(availableDamages) : chooseRandomTwo(availableDamages);
            const supportChoices = isHardcore ? chooseRandomOne(availableSupports) : chooseRandomTwo(availableSupports);
            showOpenQueueWithImages(resultDisplayElement, tankChoices, damageChoices, supportChoices, participantBlock, isHardcore);
        } else {
            const array = type === 'tank' ? tanks : type === 'damage' ? damages : supports;
            const availableArray = array.filter(hero => !participantBlock.excludedHeroes.includes(hero) && !globalBannedHeroes.has(hero));
            const choices = isHardcore ? chooseRandomOne(availableArray) : chooseRandomTwo(availableArray);
            showChoicesWithImages(resultDisplayElement, type, choices, participantBlock, isHardcore);
        }
    }
    if (clearButton) {
        clearButton.style.display = 'block';
    }
}
function updateHeroDisplay(heroElement, heroName, participantBlockId) {
    if (globalBannedHeroes.has(heroName) && globalBannedHeroes.get(heroName) !== participantBlockId) {
        heroElement.classList.add('banned-global');
        heroElement.classList.remove('selected-hero');
    } else {
        heroElement.classList.remove('banned-global');
        if (selectedHeroesMap.get(participantBlockId) === heroName) {
            heroElement.classList.add('selected-hero');
        } else {
            heroElement.classList.remove('selected-hero');
        }
    }
}
function showOpenQueueWithImages(element, tanks, damages, supports, participantBlock, isHardcore) {
    if (isHardcore) {
        element.innerHTML = `
            <div class="hero-category">
                <h4>Tank :</h4>
                <div class="hero-choices-wrapper">
                    <div class="hero" data-hero-name="${tanks[0] || 'N/A'}" data-participant-id="${participantBlock.id}">
                        <span class="green">${tanks[0] || 'N/A'}</span>
                        <img src="img/${formatHeroName(tanks[0])}.png" alt="${tanks[0]}" onerror="this.src='img/default.png';" draggable="false">
                    </div>
                </div>
            </div>
            <div class="hero-category">
                <h4>Damage :</h4>
                <div class="hero-choices-wrapper">
                    <div class="hero" data-hero-name="${damages[0] || 'N/A'}" data-participant-id="${participantBlock.id}">
                        <span class="green">${damages[0] || 'N/A'}</span>
                        <img src="img/${formatHeroName(damages[0])}.png" alt="${damages[0]}" onerror="this.src='img/default.png';" draggable="false">
                    </div>
                </div>
            </div>
            <div class="hero-category">
                <h4>Support :</h4>
                <div class="hero-choices-wrapper">
                    <div class="hero" data-hero-name="${supports[0] || 'N/A'}" data-participant-id="${participantBlock.id}">
                        <span class="green">${supports[0] || 'N/A'}</span>
                        <img src="img/${formatHeroName(supports[0])}.png" alt="${supports[0]}" onerror="this.src='img/default.png';" draggable="false">
                    </div>
                </div>
            </div>
        `;
    } else {
        element.innerHTML = `
            <div class="hero-category">
                <h4>Tank :</h4>
                <div class="hero-choices-wrapper">
                    <div class="hero" data-hero-name="${tanks[0] || 'N/A'}" data-participant-id="${participantBlock.id}">
                        <span class="green">${tanks[0] || 'N/A'}</span>
                        <img src="img/${formatHeroName(tanks[0])}.png" alt="${tanks[0]}" onerror="this.src='img/default.png';" draggable="false">
                    </div>
                    <div class="hero" data-hero-name="${tanks[1] || 'N/A'}" data-participant-id="${participantBlock.id}">
                        <span class="orange">${tanks[1] || 'N/A'}</span>
                        <img src="img/${formatHeroName(tanks[1])}.png" alt="${tanks[1]}" onerror="this.src='img/default.png';" draggable="false">
                    </div>
                </div>
            </div>
            <div class="hero-category">
                <h4>Damage :</h4>
                <div class="hero-choices-wrapper">
                    <div class="hero" data-hero-name="${damages[0] || 'N/A'}" data-participant-id="${participantBlock.id}">
                        <span class="green">${damages[0] || 'N/A'}</span>
                        <img src="img/${formatHeroName(damages[0])}.png" alt="${damages[0]}" onerror="this.src='img/default.png';" draggable="false">
                    </div>
                    <div class="hero" data-hero-name="${damages[1] || 'N/A'}" data-participant-id="${participantBlock.id}">
                        <span class="orange">${damages[1] || 'N/A'}</span>
                        <img src="img/${formatHeroName(damages[1])}.png" alt="${damages[1]}" onerror="this.src='img/default.png';" draggable="false">
                    </div>
                </div>
            </div>
            <div class="hero-category">
                <h4>Support :</h4>
                <div class="hero-choices-wrapper">
                    <div class="hero" data-hero-name="${supports[0] || 'N/A'}" data-participant-id="${participantBlock.id}">
                        <span class="green">${supports[0] || 'N/A'}</span>
                        <img src="img/${formatHeroName(supports[0])}.png" alt="${supports[0]}" onerror="this.src='img/default.png';" draggable="false">
                    </div>
                    <div class="hero" data-hero-name="${supports[1] || 'N/A'}" data-participant-id="${participantBlock.id}">
                        <span class="orange">${supports[1] || 'N/A'}</span>
                        <img src="img/${formatHeroName(supports[1])}.png" alt="${supports[1]}" onerror="this.src='img/default.png';" draggable="false">
                    </div>
                </div>
            </div>
        `;
    }
    const allGeneratedHeroes = [...tanks, ...damages, ...supports];
    if (allGeneratedHeroes.includes('Sombra')) {
        playBoopSound();
    }
    addHeroClickListeners(element, participantBlock);
}
function showChoicesWithImages(element, category, choices, participantBlock, isHardcore) {
    if (isHardcore) {
        element.innerHTML = `
            <div class="hero-choices-wrapper">
                <div class="hero" data-hero-name="${choices[0] || 'N/A'}" data-participant-id="${participantBlock.id}">
                    <span class="green">${choices[0] || 'N/A'}</span>
                    <img src="img/${formatHeroName(choices[0])}.png" alt="${choices[0]}" onerror="this.src='img/default.png';" draggable="false">
                </div>
            </div>
        `;
        if (choices.includes('Sombra')) {
            playBoopSound();
        }
    } else {
        element.innerHTML = `
            <div class="hero-choices-wrapper">
                <div class="hero" data-hero-name="${choices[0] || 'N/A'}" data-participant-id="${participantBlock.id}">
                    <span class="green">${choices[0] || 'N/A'}</span>
                    <img src="img/${formatHeroName(choices[0])}.png" alt="${choices[0]}" onerror="this.src='img/default.png';" draggable="false">
                </div>
                <div class="hero" data-hero-name="${choices[1] || 'N/A'}" data-participant-id="${participantBlock.id}">
                    <span class="orange">${choices[1] || 'N/A'}</span>
                    <img src="img/${formatHeroName(choices[1])}.png" alt="${choices[1]}" onerror="this.src='img/default.png';" draggable="false">
                </div>
            </div>
        `;
        if (choices.includes('Sombra')) {
            playBoopSound();
        }
    }
    addHeroClickListeners(element, participantBlock);
}
function addHeroClickListeners(container, participantBlock) {
    container.querySelectorAll('.hero').forEach(heroElement => {
        const heroName = heroElement.dataset.heroName;
        const participantId = participantBlock.id;
        updateHeroDisplay(heroElement, heroName, participantId);
        heroElement.addEventListener('click', () => {
            handleHeroSelection(heroName, participantId, participantBlock);
        });
    });
}
function handleHeroSelection(heroName, participantId, participantBlock) {
    const previousSelection = participantBlock.selectedHero;
    const isCurrentlySelected = previousSelection && previousSelection.name === heroName;
    if (isCurrentlySelected) {
        toggleGlobalBan(heroName, participantId, false);
        participantBlock.selectedHero = null;
    } else {
        if (previousSelection) {
            toggleGlobalBan(previousSelection.name, participantId, false);
        }
        toggleGlobalBan(heroName, participantId, true);
        participantBlock.selectedHero = { name: heroName, participantId: participantId };
    }
    updateAllHeroDisplays();
}
function toggleGlobalBan(heroName, participantId, ban) {
    if (heroName === 'N/A' || !heroName) {
        return;
    }
    if (ban) {
        globalBannedHeroes.set(heroName, participantId);
    } else {
        if (globalBannedHeroes.get(heroName) === participantId) {
            globalBannedHeroes.delete(heroName);
        }
    }
    updateSelectedHeroesMap();
}
function updateSelectedHeroesMap() {
    selectedHeroesMap.clear();
    globalBannedHeroes.forEach((participantId, heroName) => {
        selectedHeroesMap.set(participantId, heroName);
    });
}
function updateAllHeroDisplays() {
    document.querySelectorAll('.participant-block').forEach(participantBlock => {
        const participantId = participantBlock.id;
        const heroElements = participantBlock.querySelectorAll('.hero');
        heroElements.forEach(heroElement => {
            const heroName = heroElement.dataset.heroName;
            if (heroName && heroName !== 'N/A') {
                updateHeroDisplay(heroElement, heroName, participantId);
            }
        });
    });
}
function getRandomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function chooseRandomOne(array) {
    if (array.length < 1) {
        return [];
    }
    return [array[Math.floor(Math.random() * array.length)]];
}
function chooseRandomTwo(array) {
    var choices = [];
    if (array.length < 2) {
        return [];
    }
    while (choices.length < 2) {
        var candidate = array[Math.floor(Math.random() * array.length)];
        if (!choices.includes(candidate)) {
            choices.push(candidate);
        }
    }
    return choices;
}
function formatHeroName(hero) {
    if (!hero) return 'default';
    return hero.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}
function showExcludeModal(targetBlock) {
    const modal = document.getElementById('excludeModal');
    modal.targetBlock = targetBlock;
    const modalTitle = document.getElementById('modalTitle');
    const playerName = targetBlock.querySelector('input').value;
    modalTitle.textContent = `Bannir des héros pour ${playerName}`;
    renderHeroesInModal();
    modal.classList.add('visible');
    const modalContent = modal.querySelector('.modal-content');
    modalContent.classList.remove('closing');
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeExcludeModal();
        }
    });
}
function closeExcludeModal() {
    const modal = document.getElementById('excludeModal');
    const modalContent = modal.querySelector('.modal-content');
    modalContent.classList.add('closing');
    setTimeout(() => {
        modal.classList.remove('visible');
    }, 300);
}
function renderHeroesInModal() {
    const modal = document.getElementById('excludeModal');
    const targetBlock = modal.targetBlock;
    if (!targetBlock) return;
    const excludedHeroes = targetBlock.excludedHeroes;
    const renderList = (containerId, heroList) => {
        const container = document.getElementById(containerId);
        container.innerHTML = heroList.map(hero => {
            const heroClass = excludedHeroes.includes(hero) ? 'banned' : '';
            return `
                <div class="hero ${heroClass}" data-hero-name="${hero}">
                    <img src="img/${formatHeroName(hero)}.png" alt="${hero}" onerror="this.src='img/default.png';" draggable="false">
                    <span>${hero}</span>
                </div>
            `;
        }).join('');
        container.querySelectorAll('.hero').forEach(heroElement => {
            heroElement.addEventListener('click', () => {
                const heroName = heroElement.dataset.heroName;
                let roleArray;
                if (tanks.includes(heroName)) {
                    roleArray = tanks;
                } else if (damages.includes(heroName)) {
                    roleArray = damages;
                } else if (supports.includes(heroName)) {
                    roleArray = supports;
                }
                toggleExcludeHero(heroName, excludedHeroes, roleArray);
                renderHeroesInModal();
            });
        });
    };
    renderList('tank-hero-list', tanks);
    renderList('damage-hero-list', damages);
    renderList('support-hero-list', supports);
}
function showCustomAlert(message) {
    const alertDiv = document.getElementById('custom-alert');
    const messageSpan = alertDiv.querySelector('.alert-message');
    messageSpan.textContent = message;
    alertDiv.classList.add('show');
    setTimeout(() => {
        alertDiv.classList.remove('show');
    }, 3000);
}
function toggleExcludeHero(heroName, excludedHeroesList, roleArray) {
    const index = excludedHeroesList.indexOf(heroName);
    const excludedInThisRole = roleArray.filter(hero => excludedHeroesList.includes(hero));
    if (index === -1) {
        const availableHeroesInThisRoleCount = roleArray.length - excludedInThisRole.length;
        if (availableHeroesInThisRoleCount <= 2) {
            showCustomAlert("Vous devez laisser au moins 2 héros disponibles par rôle.");
            return;
        }
        excludedHeroesList.push(heroName);
    } else {
        excludedHeroesList.splice(index, 1);
    }
}
function banAllExceptTwo(roleType, excludedHeroesList) {
    let roleArray;
    switch (roleType) {
        case 'tank':
            roleArray = tanks;
            break;
        case 'damage':
            roleArray = damages;
            break;
        case 'support':
            roleArray = supports;
            break;
        default:
            return;
    }
    if (roleArray.length <= 2) {
        showCustomAlert(`Il n'y a pas assez de héros dans le rôle ${roleType} pour en bannir plus.`);
        return;
    }
    const heroesToBan = roleArray.filter(hero => !excludedHeroesList.includes(hero));
    const heroesToKeep = chooseRandomTwo(heroesToBan);
    roleArray.forEach(hero => {
        if (!heroesToKeep.includes(hero) && !excludedHeroesList.includes(hero)) {
            excludedHeroesList.push(hero);
        }
    });
    renderHeroesInModal();
}
function resetBansForRole(roleType, excludedHeroesList) {
    let roleArray;
    switch (roleType) {
        case 'tank':
            roleArray = tanks;
            break;
        case 'damage':
            roleArray = damages;
            break;
        case 'support':
            roleArray = supports;
            break;
        default:
            return;
    }
    roleArray.forEach(hero => {
        const index = excludedHeroesList.indexOf(hero);
        if (index > -1) {
            excludedHeroesList.splice(index, 1);
        }
    });
    renderHeroesInModal();
}
function resetAllBans(excludedHeroesList) {
    excludedHeroesList.splice(0, excludedHeroesList.length);
    renderHeroesInModal();
}
function initializeModalButtons() {
    const modal = document.getElementById('excludeModal');
    if (modal) { 
        modal.querySelector('.modal-close-btn').addEventListener('click', () => {
            modal.classList.remove('visible');
        });
        document.getElementById('resetAllBansBtn').addEventListener('click', () => {
            if (modal.targetBlock) {
                resetAllBans(modal.targetBlock.excludedHeroes);
            }
        });
        modal.querySelectorAll('.ban-all-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                if (modal.targetBlock) {
                    const roleType = event.target.dataset.roleType;
                    banAllExceptTwo(roleType, modal.targetBlock.excludedHeroes);
                }
            });
        });
        modal.querySelectorAll('.reset-role-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                if (modal.targetBlock) {
                    const roleType = event.target.dataset.roleType;
                    resetBansForRole(roleType, modal.targetBlock.excludedHeroes);
                }
            });
        });
    }
}
function playBoopSound() {
    const audio = document.getElementById('sombra-boop-audio');
    if (audio) {
        audio.currentTime = 0;
        audio.volume = 0.4;
        audio.play().catch(e => {
            console.error("Erreur lors de la lecture du son de Sombra :", e);
        });
    }
}
window.onload = function() {
    preLoadImages();
    createAddTile();
    addParticipantBlock(false);
    initializeModalButtons();
    document.getElementById('credits-link').addEventListener('click', function(event) {
        event.preventDefault();
        const audio = document.getElementById('credits-audio');
        if (audio.paused || audio.ended) {
            audio.currentTime = 0;
            audio.play().catch(error => {
                console.error("Erreur de lecture audio :", error);
                alert("La lecture audio a été bloquée par le navigateur. Veuillez interagir avec la page et réessayer.");
            });
        } else {
            audio.pause();
        }
    });
    document.body.addEventListener('contextmenu', function(event) {
        const isParticipantTile = event.target.closest('.participant-block:not(.add-block)');
        if (isParticipantTile) {
            event.preventDefault();
            const contextMenu = document.getElementById('contextMenu');
            contextMenu.targetBlock = isParticipantTile;
            contextMenu.style.top = `${event.clientY}px`;
            contextMenu.style.left = `${event.clientX}px`;
            contextMenu.style.display = 'block';
        }
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            const excludeModal = document.getElementById('excludeModal');
            if (excludeModal.classList.contains('visible')) {
                closeExcludeModal();
            }
        }
    });
    document.getElementById('deleteItem').addEventListener('click', () => {
        const contextMenu = document.getElementById('contextMenu');
        if (contextMenu.targetBlock) {
            removeParticipantBlock(contextMenu.targetBlock);
        }
        contextMenu.style.display = 'none';
    });
    document.getElementById('excludeHeroItem').addEventListener('click', () => {
        const contextMenu = document.getElementById('contextMenu');
        if (contextMenu.targetBlock) {
            showExcludeModal(contextMenu.targetBlock);
        }
        contextMenu.style.display = 'none';
    });
    document.addEventListener('click', (event) => {
        const contextMenu = document.getElementById('contextMenu');
        if (contextMenu && !contextMenu.contains(event.target)) {
            contextMenu.style.display = 'none';
        }
    });
};