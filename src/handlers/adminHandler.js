
const User = require('../models/User');
const Question = require('../models/Question');
const { ADMIN_ID } = require('../config/config');

module.exports = async (bot, msg) => {
    const chatId = msg.chat.id;
    const text = msg.text || '';
    const userId = msg.from.id.toString();

    // Middleware: Check if user is admin
    if (userId !== ADMIN_ID) {
        return; // Ignore non-admin commands silently or send "Unauthorized"
    }

    // Handle File Upload (Excel)
    if (msg.document) {
        const fileName = msg.document.file_name;
        if (fileName.endsWith('.xlsx')) {
            const fileId = msg.document.file_id;
            // Download file
            const fileLink = await bot.getFileLink(fileId);
            const response = await fetch(fileLink);
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const filePath = `./temp_${Date.now()}.xlsx`;
            require('fs').writeFileSync(filePath, buffer);

            await bot.sendMessage(chatId, "Fayl qabul qilindi. Tahlil qilinmoqda...");

            const { importFromExcel } = require('../services/importService');
            try {
                const count = await importFromExcel(filePath);
                await bot.sendMessage(chatId, `✅ Muvaffaqiyatli! ${count} ta yangi savol qo'shildi.`);
            } catch (e) {
                console.error(e);
                await bot.sendMessage(chatId, "❌ Xatolik yuz berdi. Fayl formati to'g'riligini tekshiring.");
            }
            return;
        }
    }

    if (text === '/admin') {
        const opts = {
            reply_markup: {
                keyboard: [
                    ['📊 Statistika', '📢 Xabar yuborish'],
                    ['🏆 Top Reyting', '➕ Savol qo\'shish'],
                    ['⏰ Vaqtni sozlash', '🔙 Chiqish']
                ],
                resize_keyboard: true,
                one_time_keyboard: true
            }
        };
        await bot.sendMessage(chatId, "Admin paneliga xush kelibsiz!", opts);
    }
    else if (text === '📊 Statistika') {
        const userCount = await User.count();
        const questionCount = await Question.count();
        await bot.sendMessage(chatId, `📊 **Statistika:**\n\n👤 Foydalanuvchilar: ${userCount}\n❓ Jami savollar: ${questionCount}`, { parse_mode: 'Markdown' });
    }
    else if (text === '🏆 Top Reyting') {
        const topUsers = await User.findAll({
            order: [['totalScore', 'DESC']],
            limit: 20
        });

        let message = "🏆 **Eng faol 20 foydalanuvchi:**\n\n";
        topUsers.forEach((u, index) => {
            const name = u.firstName ? u.firstName.replace(/</g, "&lt;") : (u.username ? `@${u.username}` : 'Noma\'lum');
            message += `${index + 1}. <b>${name}</b> - ${u.totalScore} ball\n`;
        });

        await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
    }
    else if (text === '📢 Xabar yuborish') {
        await bot.sendMessage(chatId, "Xabar matnini yuboring (boshiga /broadcast deb yozing, masalan: /broadcast Salom hammaga!).");
    }
    else if (text.startsWith('/broadcast ')) {
        const messageToSend = text.substring(11);
        const users = await User.findAll();
        let successCount = 0;

        await bot.sendMessage(chatId, "Xabar yuborilmoqda...");

        for (const user of users) {
            try {
                await bot.sendMessage(user.telegramId, messageToSend);
                successCount++;
            } catch (e) {
                // User blocked bot or handle error
            }
        }
        await bot.sendMessage(chatId, `✅ Xabar ${successCount} ta foydalanuvchiga yuborildi.`);
    }
    else if (text === '➕ Savol qo\'shish') {
        await bot.sendMessage(chatId, "Yangi savol qo'shish uchun quyidagi formatda yuboring:\n\n/add_q [mavzu] [savol] [javob1|javob2|javob3] [togri_javob_raqami]\n\nMasalan:\n/add_q html HTML qaysi tilda yozilgan? Ingliz|Rus|O'zbek 0\n(Bu yerda 'Ingliz' to'g'ri javob, chunki indeksi 0)");
    }
    else if (text.startsWith('/add_q ')) {
        // Simple parsing logic (can be improved)
        // /add_q html Question? A|B|C 0
        try {
            const parts = text.split(' ');
            const topic = parts[1];
            const correctIndex = parseInt(parts[parts.length - 1]);

            // Reconstruct question and options from the middle
            const remaining = parts.slice(2, parts.length - 1).join(' '); // "Question? A|B|C"

            // This simple split is risky if question has '|'. Better regex needed or multi-step dialog.
            // For now, assume format strictly as guided.
            // Actually, let's look for the LAST space as separator for correctIndex.

            const lastSpaceIndex = text.lastIndexOf(' ');
            const content = text.substring(8, lastSpaceIndex); // Remove '/add_q ' and index
            const firstSpaceInContent = content.indexOf(' ');

            const actualTopic = content.substring(0, firstSpaceInContent);
            const questionAndOptions = content.substring(firstSpaceInContent + 1);

            // Split by |? No, question text shouldn't have specific delimiter for options easily. 
            // Let's rely on line breaks instead or pipe for options?
            // Let's use pipe for options: Question Text? | Opt1 | Opt2 | Opt3

            const splitPipe = questionAndOptions.split('|');
            if (splitPipe.length < 2) {
                throw new Error("Format xato.");
            }

            const questionText = splitPipe[0].trim();
            const options = splitPipe.slice(1).map(o => o.trim());

            await Question.create({
                topic: actualTopic,
                questionText: questionText,
                options: options,
                correctOptionIndex: correctIndex
            });

            await bot.sendMessage(chatId, "✅ Savol bazaga qo'shildi!");
        } catch (e) {
            await bot.sendMessage(chatId, "Xatolik: Format noto'g'ri. Qaytadan urinib ko'ring.");
        }
    }
    else if (text === '⏰ Vaqtni sozlash') {
        await bot.sendMessage(chatId, "Kunlik musobaqa vaqtini o'zgartirish uchun:\n\n/set_daily_time HH:mm\nMasalan: /set_daily_time 14:30");
    }
    else if (text.startsWith('/set_daily_time ')) {
        const time = text.split(' ')[1];
        // Validate HH:mm regex
        if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
            await bot.sendMessage(chatId, "❌ Noto'g'ri format! HH:mm (masalan 14:30) ko'rinishida yozing.");
            return;
        }

        const { rescheduleDailyChallenge } = require('../services/dailyChallengeService');
        try {
            await rescheduleDailyChallenge(bot, time);
            await bot.sendMessage(chatId, `✅ Kunlik musobaqa vaqti <b>${time}</b> ga o'zgartirildi!`, { parse_mode: 'HTML' });
        } catch (e) {
            console.error(e);
            await bot.sendMessage(chatId, "❌ Xatolik yuz berdi.");
        }
    }
    else if (text === '🔙 Chiqish') {
        await bot.sendMessage(chatId, "Asosiy menyuga qaytdingiz.", { reply_markup: { remove_keyboard: true } });
    }
};
