// ESPORA - Survival Logic Simulation

const state = {
    ownId: `SP-${Math.floor(100 + Math.random() * 900)}`,
    currentView: 'dashboard',
    nodes: [
        { id: 'SP-001', top: '30%', left: '70%', trust: 'ALTA' },
        { id: 'SP-002', top: '60%', left: '20%', trust: 'MEDIA' }
    ],
    isSeedMode: false,
    pendingMessages: [],
    sentMessages: [],
    balance: 500
};

// --- View Management ---

function showView(viewId) {
    const views = ['dashboard', 'seed-view', 'messages-view', 'gps-view', 'wallet-view'];
    
    views.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = (id === viewId) ? 'flex' : 'none';
        if (id === viewId && id === 'messages-view') {
             if (el) el.style.display = 'flex'; // Ensure flex for chat layout
        }
    });
    
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        // Simple match by text for prototype
        if (item.innerText.includes('CHAT') && viewId === 'messages-view') item.classList.add('active');
        if (item.innerText.includes('MALLA') && viewId === 'dashboard') item.classList.add('active');
        if (item.innerText.includes('BALIZA') && viewId === 'gps-view') item.classList.add('active');
        if (item.innerText.includes('ECONOMÍA') && viewId === 'wallet-view') item.classList.add('active');
    });

    if (viewId === 'gps-view') updateGPS();
}

function toggleSeedMode() {
    state.isSeedMode = !state.isSeedMode;
    showView(state.isSeedMode ? 'seed-view' : 'dashboard');
}

// --- Pillar 2: Messaging Logic ---

function sendMessage(type) {
    const input = document.getElementById('chat-input');
    const content = input.value.trim();
    
    // Código Secreto para activar Economía
    if (content === 'ESPORA-ECONOMY') {
        unlockEconomy();
        input.value = '';
        return;
    }
    
    const recipient = document.getElementById('recipient-select').value;
    const msgContent = content || (type === 'text' ? "Alerta de prueba" : `Archivo ${type}`);
    
    // Pilar 3: Proof of Work (PoW) - Simulación de validación
    input.disabled = true;
    input.placeholder = "VERIFICANDO PAQUETE (PoW)...";
    
    setTimeout(() => {
        const payload = recipient !== 'PUBLICO' ? encryptSim(msgContent) : msgContent;

        const msg = {
            id: Date.now(),
            sender: state.ownId,
            recipient: recipient,
            type: type,
            content: payload,
            original: msgContent,
            size: calculateSize(type, msgContent),
            timestamp: new Date().toLocaleTimeString(),
            trust: 'VERIFICADO', // Pilar 3
            status: state.nodes.length > 0 ? 'ENTREGADO' : 'PENDIENTE'
        };

        if (state.nodes.length === 0) {
            state.pendingMessages.push(msg);
            addMessageToUI(msg, true);
        } else {
            state.sentMessages.push(msg);
            addMessageToUI(msg);
        }

        input.disabled = false;
        input.placeholder = "Escribe un mensaje...";
        input.value = '';
        input.focus();
    }, 800); // 800ms de esfuerzo computacional simulado
}

function encryptSim(text) {
    // Simulamos un cifrado real convirtiendo a Hexadecimal
    return btoa(text).split('').map(c => c.charCodeAt(0).toString(16)).join('').substring(0, 32) + "...[AES-256]";
}

function sendSOS() {
    const msg = {
        id: Date.now(),
        type: 'alert',
        content: "🚨 EMERGENCIA: RECOGIENDO COORDENADAS...",
        size: '12 bytes',
        timestamp: new Date().toLocaleTimeString(),
        status: state.nodes.length > 0 ? 'ENTREGADO' : 'PENDIENTE'
    };

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
            const lat = pos.coords.latitude.toFixed(4);
            const lon = pos.coords.longitude.toFixed(4);
            msg.content = `🚨 EMERGENCIA S.O.S. EN: ${lat}, ${lon}`;
            
            if (state.nodes.length === 0) {
                state.pendingMessages.push(msg);
                addMessageToUI(msg, true);
            } else {
                state.sentMessages.push(msg);
                addMessageToUI(msg);
            }
            alert("S.O.S. ENVIADO A LA MALLA");
        });
    }
}

function calculateSize(type, content) {
    if (type === 'text') return `${content.length} bytes`;
    if (type === 'audio') return `4.2 KB (10s @ 6kbps)`;
    if (type === 'image') return `12.5 KB (320px RAW)`;
    return '0b';
}

function addMessageToUI(msg, isPending = false) {
    const container = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = 'message';
    
    const isPrivate = msg.recipient !== 'PUBLICO';
    const isForMe = msg.recipient === state.ownId || msg.sender === state.ownId;
    
    if (isPending) div.style.borderLeftColor = 'var(--node-inactive)';
    
    // UI Logic: Si es privado y no es para mí, se ve el cifrado
    const displayText = (isPrivate && !isForMe) ? 
        `<span style="color: #666; font-family: monospace;">${msg.content}</span>` : 
        msg.original || msg.content;

    div.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span class="time">${msg.timestamp} | ${msg.size}</span>
            <span style="font-size: 0.6rem; color: var(--node-active); font-weight: 800;">✓ ${msg.trust}</span>
        </div>
        <strong>[${msg.recipient}]</strong> ${displayText}
    `;
    
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

// --- Store & Forward Simulation ---

function checkPendingMessages() {
    if (state.nodes.length > 0 && state.pendingMessages.length > 0) {
        console.log(`Entregando ${state.pendingMessages.length} mensajes pendientes...`);
        
        state.pendingMessages.forEach(msg => {
            msg.status = 'ENTREGADO (VÍA MENSAJERO)';
            state.sentMessages.push(msg);
            // In a real app we would update the UI element, here we just re-add for prototype
            addMessageToUI(msg);
        });
        
        state.pendingMessages = [];
    }
}

// --- Radar Simulation ---

function updateRadar() {
    const container = document.querySelector('.radar-container');
    if (!container) return;

    const oldNodes = container.querySelectorAll('.node');
    oldNodes.forEach(n => n.remove());

    // Simulation: Nodes appear and disappear to test Store & Forward
    if (Math.random() > 0.8) {
        state.nodes = state.nodes.length > 0 ? [] : [{ id: 1, top: '40%', left: '30%' }, { id: 2, top: '20%', left: '60%' }];
        const statusEl = document.getElementById('mesh-status');
        const countEl = document.getElementById('node-count');
        
        if (state.nodes.length > 0) {
            statusEl.innerText = "MESH ACTIVO";
            statusEl.style.color = "var(--node-active)";
            countEl.innerText = `${state.nodes.length} NODOS CERCA`;
        } else {
            statusEl.innerText = "AISLADO (BUSCANDO...)";
            statusEl.style.color = "var(--alert-color)";
            countEl.innerText = "0 NODOS CERCA";
        }
    }

    state.nodes.forEach(node => {
        const div = document.createElement('div');
        div.className = 'node';
        div.style.top = node.top;
        div.style.left = node.left;
        container.appendChild(div);
    });

    checkPendingMessages();
}

setInterval(updateRadar, 3000);

// --- Pillar 3: GPS & Baliza Logic ---

function updateGPS() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
            const lat = pos.coords.latitude.toFixed(4);
            const lon = pos.coords.longitude.toFixed(4);
            const display = document.getElementById('coords-display');
            if (display) display.innerText = `${lat} , ${lon}`;
            
            // Simulación de brújula
            const arrow = document.getElementById('compass-arrow');
            if (arrow) {
                const randomAngle = Math.floor(Math.random() * 360);
                arrow.style.transform = `translate(-50%, -50%) rotate(${randomAngle}deg)`;
            }
        });
    }
}

// --- Pillar 4: Economy (Wallet) Logic ---

function simulateTransaction(type) {
    if (state.nodes.length === 0) {
        alert("ERROR: No hay nodos en rango para validar la transacción.");
        return;
    }

    if (type === 'send') {
        const amount = 50;
        if (state.balance >= amount) {
            state.balance -= amount;
            addTransactionToHistory('send', amount, 'SP-001');
            alert(`PAGO ENVIADO: ${amount} ESP a NODO SP-001`);
        }
    } else {
        const amount = 25;
        state.balance += amount;
        addTransactionToHistory('receive', amount, 'SP-002');
        alert(`PAGO RECIBIDO: ${amount} ESP desde NODO SP-002`);
    }

    document.getElementById('balance-amount').innerText = state.balance;
}

function unlockEconomy() {
    const nav = document.getElementById('wallet-nav');
    if (nav) {
        nav.style.display = 'flex';
        // Ajustar el grid del footer para 4 columnas
        document.querySelector('footer').style.gridTemplateColumns = 'repeat(4, 1fr)';
        alert("SISTEMA ECONÓMICO DESBLOQUEADO");
    }
}

function addTransactionToHistory(type, amount, node) {
    const container = document.getElementById('transaction-history');
    const div = document.createElement('div');
    div.className = 'message';
    div.style.display = 'flex';
    div.style.justifyContent = 'space-between';
    div.style.alignItems = 'center';
    
    const isReceive = type === 'receive';
    div.style.background = isReceive ? 'rgba(0,255,65,0.05)' : 'rgba(255,59,48,0.05)';
    
    div.innerHTML = `
        <div>
            <span class="time">${new Date().toLocaleTimeString()} | ${isReceive ? 'DESDE' : 'PARA'}: ${node}</span>
            Transacción de Supervivencia
        </div>
        <span style="color: ${isReceive ? 'var(--node-active)' : 'var(--alert-color)'}; font-weight: 800;">
            ${isReceive ? '+' : '-'}${amount} ESP
        </span>
    `;
    
    container.prepend(div);
}

// --- Boot ---
window.onload = () => {
    console.log("ESPORA Protocol Initialized...");
    document.getElementById('own-id').innerText = `ID: ${state.ownId}`;
};
