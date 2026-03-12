// Achievements Rendering

export function renderAchievements(gameState) {
    const categories = {
        'training': document.getElementById('achievements-training'),
        'research': document.getElementById('achievements-research'),
        'infrastructure': document.getElementById('achievements-infrastructure')
    };
    
    let unlockedCount = 0;
    let totalCount = 0;
    
    for (const [id, achievement] of Object.entries(gameState.achievements)) {
        totalCount++;
        if (achievement.unlocked) unlockedCount++;
        
        const container = categories[achievement.category];
        if (!container) continue;
        
        let card = document.getElementById(`achievement-${id}`);
        if (!card) {
            card = createAchievementCard(id, achievement);
            container.appendChild(card);
        }
        
        updateAchievementCard(card, achievement);
    }
    
    // Update stats
    document.getElementById('achievements-unlocked').textContent = unlockedCount;
    document.getElementById('achievements-total').textContent = totalCount;
}

function createAchievementCard(id, achievement) {
    const card = document.createElement('div');
    card.className = 'achievement-card';
    card.id = `achievement-${id}`;
    
    card.innerHTML = `
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-info">
            <div class="achievement-name">${achievement.name}</div>
            <div class="achievement-description">${achievement.description}</div>
            <div class="achievement-reward">Reward: ${achievement.reward}</div>
        </div>
    `;
    
    return card;
}

function updateAchievementCard(card, achievement) {
    if (achievement.unlocked) {
        card.classList.add('unlocked');
    } else {
        card.classList.remove('unlocked');
    }
}