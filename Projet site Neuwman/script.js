document.addEventListener('DOMContentLoaded', (event) => {
    const dateElement = document.getElementById('date');
    const currentDate = new Date();
    dateElement.textContent = currentDate.toLocaleDateString();
    initializeMemory();
    setupEventListeners();
});

function setupEventListeners() {
    // Gestionnaire pour l'unité de contrôle
    const controlBtn = document.querySelector('.simulate-control');
    if (controlBtn) {
        controlBtn.addEventListener('click', runControlCycle);
    }

    // Gestionnaire pour les opérations UAL
    const operations = document.querySelectorAll('.operation');
    operations.forEach(op => {
        op.addEventListener('click', (e) => {
            const type = e.target.textContent.toLowerCase();
            simulateOperation(type.split(' ')[0]);
        });
    });

    // Gestionnaire pour la mémoire
    const memoryBtns = document.querySelectorAll('.memory-btn');
    memoryBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (e.target.textContent === 'Écrire') {
                writeToMemory();
            } else if (e.target.textContent === 'Réinitialiser') {
                clearMemory();
            }
        });
    });

    // Gestionnaire pour les E/S
    const ioBtn = document.querySelector('.io-button');
    if (ioBtn) {
        ioBtn.addEventListener('click', processIO);
    }
}

function showStepDetails(stepNumber) {
    const allSteps = document.querySelectorAll('.step-card.interactive');
    const allDetails = document.querySelectorAll('.step-details');
    const selectedStep = document.getElementById(`step${stepNumber}`);
    
    // Ferme toutes les étapes sauf celle sélectionnée
    allDetails.forEach(detail => {
        if (detail !== selectedStep) {
            detail.classList.remove('active');
        }
    });

    // Active/désactive l'étape sélectionnée
    if (selectedStep) {
        const isExpanding = !selectedStep.classList.contains('active');
        selectedStep.classList.toggle('active');

        // Ajoute une classe active à la carte parente
        const parentCard = selectedStep.closest('.step-card');
        allSteps.forEach(step => step.classList.remove('active-card'));
        if (isExpanding) {
            parentCard.classList.add('active-card');
        }
    }
}

function simulateBusTransfer() {
    const packet = document.querySelector('.data-packet');
    const btn = document.querySelector('.simulate-btn');
    btn.disabled = true;
    
    // Réinitialise la position du paquet
    packet.style.left = '-8px';
    
    // Attend le prochain frame pour appliquer l'animation
    requestAnimationFrame(() => {
        packet.style.left = 'calc(100% - 8px)';
        
        // Réactive le bouton après l'animation
        setTimeout(() => {
            btn.disabled = false;
            // Réinitialise la position sans transition
            packet.style.transition = 'none';
            packet.style.left = '-8px';
            // Réactive la transition après un court délai
            setTimeout(() => {
                packet.style.transition = 'left 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
            }, 50);
        }, 1500);
    });
}

function showMemoryInfo(type) {
    const infoDiv = document.getElementById('memory-info');
    const info = {
        ram: "Mémoire vive principale, stockage temporaire des programmes et données en cours d'exécution",
        cache: "Mémoire ultra-rapide servant d'intermédiaire entre le processeur et la RAM",
        registers: "Mémoire intégrée au processeur, stockage des données en cours de traitement"
    };
    infoDiv.textContent = info[type];
    infoDiv.style.opacity = '1';
}

function hideMemoryInfo() {
    const infoDiv = document.getElementById('memory-info');
    infoDiv.style.opacity = '0';
}

function highlightCard(card) {
    card.style.transform = 'translateY(-10px)';
    card.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
    card.style.background = 'linear-gradient(135deg, #fff, #f8f9fa)';
}

function unhighlightCard(card) {
    card.style.transform = 'translateY(0)';
    card.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
    card.style.background = 'white';
}

function simulateOperation(type) {
    const result = document.getElementById('ual-result');
    const operations = {
        add: { nums: [5, 3], result: 8, op: '+' },
        sub: { nums: [8, 3], result: 5, op: '-' },
        and: { nums: [1, 1], result: 1, op: 'AND' },
        or: { nums: [1, 0], result: 1, op: 'OR' }
    };

    const op = operations[type];
    result.innerHTML = `
        <div class="operation-animation">
            <span>${op.nums[0]} ${op.op} ${op.nums[1]} = ${op.result}</span>
            <div class="operation-progress"></div>
        </div>
    `;
    
    // Active l'animation
    setTimeout(() => {
        result.querySelector('.operation-animation').classList.add('active');
    }, 100);
}

function simulateControlUnit() {
    const steps = document.querySelectorAll('.control-step');
    const btn = document.querySelector('.simulate-control');
    btn.disabled = true;

    // Animation séquentielle des étapes
    steps.forEach((step, index) => {
        setTimeout(() => {
            steps.forEach(s => s.classList.remove('active'));
            step.classList.add('active');
        }, index * 1000);
    });

    // Réinitialisation
    setTimeout(() => {
        steps.forEach(s => s.classList.remove('active'));
        btn.disabled = false;
    }, steps.length * 1000);
}

function toggleMemoryCell(cell) {
    const prevValue = cell.getAttribute('data-value') || '00';
    const newValue = prevValue === '00' ? 'FF' : '00';
    
    cell.classList.toggle('active');
    cell.setAttribute('data-value', newValue);
    cell.innerHTML = `0x${newValue}`;
    
    // Effet de flash
    cell.classList.add('flash');
    setTimeout(() => cell.classList.remove('flash'), 300);
}

function processIO() {
    const input = document.querySelector('.io-input');
    const output = document.getElementById('io-result');
    const button = document.querySelector('.io-button');
    
    if (!input.value) {
        output.textContent = 'Veuillez entrer des données';
        return;
    }

    button.disabled = true;
    output.textContent = 'Traitement...';
    
    // Simule un temps de traitement
    setTimeout(() => {
        output.textContent = input.value.split('').reverse().join('');
        button.disabled = false;
        
        // Animation du résultat
        output.style.animation = 'none';
        output.offsetHeight; // Force reflow
        output.style.animation = 'fadeIn 0.5s';
    }, 800);
}

function runControlCycle() {
    const states = document.querySelectorAll('.control-state');
    const output = document.getElementById('control-output');
    const register = document.getElementById('instruction-register');
    
    if (!states.length || !output || !register) return;

    const instructions = [
        'MOV AX, BX',
        'ADD AX, 42',
        'PUSH AX',
        'POP BX'
    ];

    let currentInstr = register.getAttribute('data-instr-index') || 0;
    currentInstr = parseInt(currentInstr);

    // Désactive le bouton pendant l'animation
    const btn = document.querySelector('.simulate-control');
    if (btn) btn.disabled = true;

    // Animation des états
    states.forEach((state, index) => {
        setTimeout(() => {
            states.forEach(s => s.classList.remove('active'));
            state.classList.add('active');
            
            const instruction = instructions[currentInstr];
            switch(index) {
                case 0:
                    output.textContent = `Fetch: Lecture de l'instruction ${instruction}`;
                    break;
                case 1:
                    output.textContent += `\nDecode: Analyse de l'opération`;
                    break;
                case 2:
                    output.textContent += `\nExecute: ${instruction}`;
                    break;
            }
        }, index * 1000);
    });

    // Réinitialisation et préparation de la prochaine instruction
    setTimeout(() => {
        states.forEach(s => s.classList.remove('active'));
        const nextInstr = (currentInstr + 1) % instructions.length;
        register.textContent = instructions[nextInstr];
        register.setAttribute('data-instr-index', nextInstr);
        if (btn) btn.disabled = false;
    }, 3000);
}

function initializeMemory() {
    const memoryContainer = document.querySelector('.memory-cells');
    for (let i = 0; i < 16; i++) {
        const cell = document.createElement('div');
        cell.className = 'memory-cell';
        cell.textContent = `0x${i.toString(16).padStart(2, '0')}: 00`;
        cell.onclick = () => toggleMemoryCell(cell);
        memoryContainer.appendChild(cell);
    }
}

function writeToMemory() {
    const cells = document.querySelectorAll('.memory-cell');
    const status = document.getElementById('memory-status');
    if (!cells.length || !status) return;

    status.textContent = 'État: Écriture en cours...';
    
    cells.forEach((cell, index) => {
        setTimeout(() => {
            const randomValue = Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase();
            cell.textContent = `0x${index.toString(16).padStart(2, '0')}: ${randomValue}`;
            cell.classList.add('active');
            setTimeout(() => cell.classList.remove('active'), 500);
        }, index * 100);
    });

    setTimeout(() => {
        status.textContent = 'État: Écriture terminée';
    }, cells.length * 100 + 500);
}

function clearMemory() {
    const cells = document.querySelectorAll('.memory-cell');
    const status = document.getElementById('memory-status');
    
    status.textContent = 'État: Réinitialisation...';
    
    cells.forEach((cell, index) => {
        setTimeout(() => {
            cell.textContent = `0x${index.toString(16).padStart(2, '0')}: 00`;
            cell.classList.add('active');
            setTimeout(() => cell.classList.remove('active'), 500);
        }, index * 50);
    });

    setTimeout(() => {
        status.textContent = 'État: Prêt';
    }, cells.length * 50);
}
