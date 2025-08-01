const { getUser, updateUser } = require('./database')
const { getMainMenu, getBackToMenuButton } = require('../utils/keyboards')

async function startCommand(ctx) {
	const userId = ctx.from.id
	const userName = ctx.from.first_name || 'Друг'

	await getUser(userId)

	const welcomeMessage = `
🌟 Привет, ${userName}! 

Я бот-помощник для отслеживания привычек! 

🎯 Что я умею:
• Напоминать о важных привычках
• Отслеживать твой прогресс  
• Показывать статистику выполнения
• Мотивировать не сдаваться!

💡 Начни с добавления своей первой привычки!
    `

	await ctx.reply(welcomeMessage, {
		reply_markup: getMainMenu(),
	})
}

async function helpCommand(ctx) {
	const helpMessage = `
📖 СПРАВКА ПО БОТУ

🔸 Основные команды:
/start - главное меню
/help - эта справка

🔸 Как пользоваться:
1️⃣ Добавь привычку (например "Пить воду")
2️⃣ Настрой время напоминаний
3️⃣ Получай уведомления
4️⃣ Отмечай выполнение одной кнопкой!

🔸 Примеры привычек:
• Пить воду (3 раза в день)
• Делать зарядку (утром)
• Читать книги (вечером)
• Медитация (перед сном)

💪 Главное - постоянство! Даже маленькие шаги ведут к большим результатам.
    `

	await ctx.reply(helpMessage, {
		reply_markup: getBackToMenuButton(),
	})
}

async function handleCallbackQuery(ctx) {
	const data = ctx.callbackQuery.data

	switch (data) {
		case 'main_menu':
			await showMainMenu(ctx)
			break

		case 'add_habit':
			await showAddHabitDialog(ctx)
			break

		case 'my_habits':
			await showUserHabits(ctx)
			break

		case 'statistics':
			await showStatistics(ctx)
			break

		case 'settings':
			await showSettings(ctx)
			break

		default:
			await ctx.answerCallbackQuery('🤔 Неизвестная команда')
	}
}

async function showMainMenu(ctx) {
	const message = `
🏠 ГЛАВНОЕ МЕНЮ

Выбери действие:
    `

	await ctx.editMessageText(message, {
		reply_markup: getMainMenu(),
	})
	await ctx.answerCallbackQuery()
}

async function showAddHabitDialog(ctx) {
	const message = `
➕ ДОБАВЛЕНИЕ ПРИВЫЧКИ

Напиши название привычки, которую хочешь отслеживать.

📝 Примеры:
• Пить воду
• Делать зарядку  
• Читать книги
• Медитировать

✍️ Просто напиши название в следующем сообщении:
    `

	await ctx.editMessageText(message, {
		reply_markup: getBackToMenuButton(),
	})
	await ctx.answerCallbackQuery()
}

async function showUserHabits(ctx) {
	const userId = ctx.from.id
	const user = await getUser(userId)

	if (user.habits.length === 0) {
		const message = `
📋 ТВОИ ПРИВЫЧКИ

У тебя пока нет привычек для отслеживания.

💡 Добавь первую привычку, чтобы начать путь к лучшей версии себя!
        `

		await ctx.editMessageText(message, {
			reply_markup: getBackToMenuButton(),
		})
	} else {
		const message = `
📋 ТВОИ ПРИВЫЧКИ

Всего привычек: ${user.habits.length}

(Список привычек будет добавлен позже)
        `

		await ctx.editMessageText(message, {
			reply_markup: getBackToMenuButton(),
		})
	}

	await ctx.answerCallbackQuery()
}

async function showStatistics(ctx) {
	const message = `
📊 СТАТИСТИКА

(Статистика будет добавлена в следующих версиях)

🏆 Скоро здесь будет:
• Общий прогресс по всем привычкам
• Самая длинная серия выполнений
• Календарь активности
• Мотивирующие достижения
    `

	await ctx.editMessageText(message, {
		reply_markup: getBackToMenuButton(),
	})
	await ctx.answerCallbackQuery()
}

async function showSettings(ctx) {
	const message = `
⚙️ НАСТРОЙКИ

(Настройки будут добавлены позже)

🔧 Скоро здесь будет:
• Изменение времени уведомлений
• Настройка часового пояса
• Управление звуками
• Экспорт данных
    `

	await ctx.editMessageText(message, {
		reply_markup: getBackToMenuButton(),
	})
	await ctx.answerCallbackQuery()
}

module.exports = {
	startCommand,
	helpCommand,
	handleCallbackQuery,
}
