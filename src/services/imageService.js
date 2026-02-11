const { createCanvas, registerFont } = require('canvas');

async function generateLeaderboardImage(groupsData) {
    // groupsData: [{ group: 'N8', xp: 100 }, ...] sorted by XP descending

    const width = 800;
    const height = 400;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#1e1e2e'; // Dark theme background
    ctx.fillRect(0, 0, width, height);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Arial'; // Or load custom font
    ctx.textAlign = 'center';
    ctx.fillText('🏆 GURUHLAR REYTINGI', width / 2, 50);

    // Bars
    // Determine max score for scaling
    const maxXP = Math.max(...groupsData.map(g => g.xp), 1);
    const barWidth = 100;
    const spacing = 150;
    const startX = (width - (groupsData.length * (barWidth + spacing))) / 2 + 50;
    const bottomY = height - 50;

    groupsData.forEach((data, index) => {
        const barHeight = (data.xp / maxXP) * 200;
        const x = startX + index * spacing;
        const y = bottomY - barHeight;

        // Bar Color (Gold, Silver, Bronze)
        if (index === 0) ctx.fillStyle = '#FFD700'; // Gold
        else if (index === 1) ctx.fillStyle = '#C0C0C0'; // Silver
        else if (index === 2) ctx.fillStyle = '#CD7F32'; // Bronze
        else ctx.fillStyle = '#4e4e6e';

        // Draw Bar
        ctx.fillRect(x, y, barWidth, barHeight);

        // Group Name
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(data.group, x + barWidth / 2, bottomY + 30);

        // Score
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px Arial';
        ctx.fillText(`${data.xp} XP`, x + barWidth / 2, y - 10);
    });

    return canvas.toBuffer('image/png');
}

module.exports = { generateLeaderboardImage };
