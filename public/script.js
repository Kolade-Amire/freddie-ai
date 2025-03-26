// public/script.js
document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    const processingScreen = document.getElementById('processing-screen');
    const rankingsScreen = document.getElementById('rankings-screen');
    const messagesDiv = document.getElementById('messages');
    const completeMessage = document.getElementById('complete-message');
    const processingStartMessage = document.getElementById('processing-start-message');
    const processCandidatesBtn = document.getElementById('process-candidates-btn');
    const showRankingsBtn = document.getElementById('show-rankings-btn');
    const backBtn = document.getElementById('back-btn');
    const rankingsList = document.getElementById('rankings-list');

    // Socket.IO event listeners
    socket.on('email_sent', (data) => {
        const message = document.createElement('p');
        message.className = 'text-gray-600';
        message.textContent = data.message;
        messagesDiv.appendChild(message);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });

    socket.on('low_score', (data) => {
        const message = document.createElement('p');
        message.className = 'text-gray-600';
        message.textContent = data.message;
        messagesDiv.appendChild(message);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });

    socket.on('processing_complete', () => {
        completeMessage.classList.remove('hidden');
        processCandidatesBtn.classList.remove('hidden'); // Re-enable the button
        processCandidatesBtn.disabled = false;
    });

    socket.on('error', (data) => {
        const message = document.createElement('p');
        message.className = 'text-red-600';
        message.textContent = data.message;
        messagesDiv.appendChild(message);
        processCandidatesBtn.classList.remove('hidden'); // Re-enable the button on error
        processCandidatesBtn.disabled = false;
    });

    // Process candidates on button click
    processCandidatesBtn.addEventListener('click', async () => {
        processCandidatesBtn.disabled = true; // Disable the button while processing
        processingStartMessage.classList.remove('hidden');
        messagesDiv.innerHTML = ''; // Clear previous messages
        completeMessage.classList.add('hidden'); // Hide completion message
        try {
            const response = await fetch('/api/process-candidates', { method: 'POST' });
            if (!response.ok) {
                console.error('Failed to start processing candidates');
            }
        } catch (error) {
            console.error('Error starting candidate processing:', error);
            const message = document.createElement('p');
            message.className = 'text-red-600';
            message.textContent = 'Error starting candidate processing';
            messagesDiv.appendChild(message);
            processCandidatesBtn.disabled = false;
        }
    });

    // Load rankings
    async function loadRankings() {
        try {
            const response = await fetch('/api/rankings');
            const rankings = await response.json();
            rankings.sort((a, b) => b.score - a.score);

            rankingsList.innerHTML = '';
            rankings.forEach((candidate, index) => {
                const card = document.createElement('div');
                card.className = 'border border-gray-200 rounded-md p-3 flex justify-between items-center';
                card.innerHTML = `
                    <div>
                        <span class="text-base font-medium text-gray-800">${index + 1}. ${candidate.name}</span>
                        <p class="text-sm text-gray-500">${candidate.email}</p>
                    </div>
                    <span class="text-lg font-semibold text-blue-600">${candidate.score}</span>
                `;
                rankingsList.appendChild(card);
            });
        } catch (error) {
            console.error('Error loading rankings:', error);
        }
    }

    // Navigation
    showRankingsBtn.addEventListener('click', () => {
        processingScreen.classList.add('hidden');
        rankingsScreen.classList.remove('hidden');
        loadRankings().then();
    });

    backBtn.addEventListener('click', () => {
        rankingsScreen.classList.add('hidden');
        processingScreen.classList.remove('hidden');
    });
});