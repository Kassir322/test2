const cron = require('node-cron')
const { loadUsers } = require('./database')
const { getReminderButtons } = require('../utils/keyboards')

const scheduledTasks = new Map()

function startReminderSystem(bot) {
	console.log('🔔 Система напоминаний запущена')

	cron.schedule('* * * * *', async () => {
		await checkReminders(bot)
	})

	console.log('📋 Загружено 0 напоминаний из базы данных')
}

async function checkReminders(bot) {
	try {
		const users = await loadUsers()
		const now = new Date()
		const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now
			.getMinutes()
			.toString()
			.padStart(2, '0')}`

		for (const [userId, userData] of Object.entries(users)) {
			if (!userData.habits) continue

			for (const habit of userData.habits) {
				if (habit.reminderTimes && habit.reminderTimes.includes(currentTime)) {
					await sendReminder(bot, userId, habit)
				}
			}
		}
	} catch (error) {
		console.error('❌ Ошибка при проверке напоминаний:', error)
	}
}

async function sendReminder(bot, userId, habit) {
	try {
		const today = new Date().toISOString().split('T')[0]
		if (habit.completions && habit.completions.includes(today)) {
			return
		}

		const reminderMessage = `
🔔 НАПОМИНАНИЕ

⏰ Время для: **${habit.name}**

${getMotivationalMessage(habit)}

Отметь выполнение кнопкой ниже! 👇
        `

		await bot.api.sendMessage(userId, reminderMessage, {
			parse_mode: 'Markdown',
			reply_markup: getReminderButtons(habit.id),
		})

		console.log(
			`📨 Отправлено напоминание пользователю ${userId} о "${habit.name}"`
		)
	} catch (error) {
		console.error(
			`❌ Ошибка отправки напоминания пользователю ${userId}:`,
			error
		)
	}
}

function getMotivationalMessage(habit) {
	const habitName = habit.name.toLowerCase()

	if (habitName.includes('вода') || habitName.includes('пить')) {
		return '💧 Твое тело нуждается в воде! Выпей стакан прямо сейчас.'
	}

	if (
		habitName.includes('зарядка') ||
		habitName.includes('упражнения') ||
		habitName.includes('спорт')
	) {
		return '💪 Движение - это жизнь! Сделай несколько упражнений.'
	}

	if (habitName.includes('читать') || habitName.includes('книга')) {
		return '📚 Знания - сила! Прочитай хотя бы несколько страниц.'
	}

	if (habitName.includes('медитация') || habitName.includes('дыхание')) {
		return '🧘‍♀️ Время для внутреннего покоя. Сделай глубокий вдох.'
	}

	const generalMessages = [
		'🌟 Каждый маленький шаг приближает к цели!',
		'🚀 Ты можешь это сделать! Просто начни.',
		'💫 Постоянство - ключ к успеху.',
		'🏆 Твое будущее "Я" скажет спасибо!',
		'⭐ Превращай мечты в привычки!',
	]

	return generalMessages[Math.floor(Math.random() * generalMessages.length)]
}

function addHabitReminders(userId, habit) {
	console.log(
		`✅ Добавлены напоминания для "${habit.name}" в ${habit.reminderTimes.join(
			', '
		)}`
	)
}

function removeHabitReminders(userId, habitId) {
	console.log(`🗑️ Удалены напоминания для привычки ${habitId}`)
}

function snoozeReminder(bot, userId, habitId) {
	setTimeout(async () => {
		console.log(
			`⏰ Повторное напоминание для пользователя ${userId}, привычка ${habitId}`
		)
	}, 30 * 60 * 1000)
}

module.exports = {
	startReminderSystem,
	addHabitReminders,
	removeHabitReminders,
	snoozeReminder,
}
