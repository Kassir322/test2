require('dotenv').config()

const { Bot } = require('grammy')

const {
	startCommand,
	helpCommand,
	handleCallbackQuery,
} = require('./modules/commands')
const { startReminderSystem } = require('./modules/reminders')
const { createHabit } = require('./modules/habits')
const { getTimeBasedGreeting } = require('./utils/helpers')

const bot = new Bot(process.env.BOT_TOKEN)

const userStates = new Map()

console.log('🤖 Запуск бота "Трекер Привычек"...')

bot.command('start', async (ctx) => {
	console.log(
		`👤 Пользователь ${ctx.from.first_name} (${ctx.from.id}) запустил бота`
	)
	await startCommand(ctx)
})

bot.command('help', async (ctx) => {
	console.log(`❓ Пользователь ${ctx.from.id} запросил справку`)
	await helpCommand(ctx)
})

bot.on('callback_query', async (ctx) => {
	const callbackData = ctx.callbackQuery.data
	const userId = ctx.from.id

	console.log(`🔘 Пользователь ${userId} нажал кнопку: ${callbackData}`)

	try {
		if (callbackData === 'add_habit') {
			userStates.set(userId, { action: 'waiting_habit_name' })
		}

		if (callbackData.startsWith('complete_')) {
			const habitId = callbackData.replace('complete_', '')
			await handleHabitCompletion(ctx, habitId)
			return
		}

		if (callbackData.startsWith('snooze_')) {
			const habitId = callbackData.replace('snooze_', '')
			await handleSnoozeReminder(ctx, habitId)
			return
		}

		if (callbackData.startsWith('skip_')) {
			await ctx.answerCallbackQuery(
				'⏭️ Пропущено. Не переживай, завтра получится!'
			)
			return
		}

		await handleCallbackQuery(ctx)
	} catch (error) {
		console.error('Ошибка при обработке callback:', error)
		await ctx.answerCallbackQuery('⚠️ Произошла ошибка. Попробуй еще раз.')
	}
})

// bot.on('message:text', async (ctx) => {
// 	const userId = ctx.from.id
// 	const messageText = ctx.message.text
// 	const userState = userStates.get(userId)

// 	console.log(`💬 Сообщение от ${userId}: "${messageText}"`)

// 	try {
// 		if (userState && userState.action === 'waiting_habit_name') {
// 			await handleNewHabitName(ctx, messageText)
// 			return
// 		}

// 		if (userState && userState.action === 'waiting_reminder_time') {
// 			await handleReminderTime(ctx, messageText)
// 			return
// 		}

// 		await handleRegularMessage(ctx, messageText)
// 	} catch (error) {
// 		console.error('Ошибка при обработке сообщения:', error)
// 		await ctx.reply(
// 			'⚠️ Произошла ошибка. Попробуй еще раз или используй /start'
// 		)
// 	}
// })

async function handleNewHabitName(ctx, habitName) {
	const userId = ctx.from.id

	if (habitName.length < 2) {
		await ctx.reply('❌ Название привычки слишком короткое. Попробуй еще раз:')
		return
	}

	if (habitName.length > 100) {
		await ctx.reply('❌ Название привычки слишком длинное. Попробуй покороче:')
		return
	}

	userStates.set(userId, {
		action: 'waiting_reminder_time',
		habitName: habitName,
	})

	const timeMessage = `
✅ Отлично! Привычка "${habitName}" почти добавлена.

⏰ Теперь укажи время для напоминаний.

📝 Примеры:
• 09:00 - одно напоминание в 9 утра
• 09:00 15:00 21:00 - три напоминания в день
• 08:30 20:30 - утром и вечером

⌨️ Просто напиши время в формате ЧЧ:ММ через пробел:
    `

	await ctx.reply(timeMessage)
}

async function handleReminderTime(ctx, timeText) {
	const userId = ctx.from.id
	const userState = userStates.get(userId)

	if (!userState || !userState.habitName) {
		await ctx.reply('❌ Ошибка. Начни сначала с /start')
		return
	}

	const times = timeText.trim().split(/\s+/)
	const validTimes = []
	const invalidTimes = []

	for (const time of times) {
		if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
			validTimes.push(time)
		} else {
			invalidTimes.push(time)
		}
	}

	if (invalidTimes.length > 0) {
		await ctx.reply(
			`❌ Некорректное время: ${invalidTimes.join(
				', '
			)}\n\n⌨️ Используй формат ЧЧ:ММ (например: 09:00 15:30)`
		)
		return
	}

	if (validTimes.length === 0) {
		await ctx.reply(
			'❌ Не найдено ни одного корректного времени.\n\n⌨️ Попробуй еще раз в формате ЧЧ:ММ'
		)
		return
	}

	try {
		const newHabit = await createHabit(userId, userState.habitName, validTimes)

		userStates.delete(userId)

		const successMessage = `
🎉 Привычка успешно добавлена!

${getRandomHabitEmoji()} **${newHabit.name}**
⏰ Напоминания: ${validTimes.join(', ')}

Теперь я буду напоминать тебе в указанное время. 
Не забывай отмечать выполнение! 💪
        `

		await ctx.reply(successMessage, {
			parse_mode: 'Markdown',
			reply_markup: require('./utils/keyboards').getMainMenu(),
		})

		console.log(
			`✅ Создана привычка "${newHabit.name}" для пользователя ${userId}`
		)
	} catch (error) {
		console.error('Ошибка создания привычки:', error)
		await ctx.reply('❌ Ошибка при создании привычки. Попробуй еще раз.')
	}
}

async function handleHabitCompletion(ctx, habitId) {
	const userId = ctx.from.id

	try {
		const { completeHabit } = require('./modules/habits')
		const result = await completeHabit(userId, habitId)

		if (result.alreadyCompleted) {
			await ctx.answerCallbackQuery('✅ Эта привычка уже выполнена сегодня!')
		} else {
			const { getStreakMessage } = require('./utils/helpers')
			const streakMsg = getStreakMessage(result.habit.streak)

			await ctx.answerCallbackQuery(
				'🎉 Отлично! Привычка отмечена как выполненная!'
			)
			await ctx.reply(
				`✅ **${result.habit.name}** выполнена!\n\n${streakMsg}`,
				{
					parse_mode: 'Markdown',
				}
			)
		}
	} catch (error) {
		console.error('Ошибка при выполнении привычки:', error)
		await ctx.answerCallbackQuery('❌ Ошибка. Попробуй еще раз.')
	}
}

async function handleSnoozeReminder(ctx, habitId) {
	await ctx.answerCallbackQuery('⏰ Напомню через 30 минут!')

	const { snoozeReminder } = require('./modules/reminders')
	snoozeReminder(bot, ctx.from.id, habitId)
}

async function handleRegularMessage(ctx, messageText) {
	const greeting = getTimeBasedGreeting()

	const helpMessage = `
${greeting}! 👋

Я понимаю только команды и кнопки.

🎯 Используй:
• /start - главное меню
• /help - справка
• Или нажимай на кнопки под сообщениями

💡 Если хочешь добавить привычку, нажми кнопку "➕ Добавить привычку" в главном меню.
    `

	await ctx.reply(helpMessage, {
		reply_markup: require('./utils/keyboards').getMainMenu(),
	})
}

function getRandomHabitEmoji() {
	const emojis = ['⭐', '🎯', '💪', '🚀', '⚡', '🔥', '💎', '🌟']
	return emojis[Math.floor(Math.random() * emojis.length)]
}

async function startBot() {
	try {
		console.log('🚀 Инициализация бота...')

		startReminderSystem(bot)

		await bot.start()

		console.log('✅ Бот "Трекер Привычек" успешно запущен!')
		console.log('📱 Готов принимать сообщения...')
	} catch (error) {
		console.error('❌ Ошибка запуска бота:', error)
		process.exit(1)
	}
}

process.on('SIGINT', () => {
	console.log('\n🛑 Получен сигнал завершения...')
	console.log('👋 Бот завершает работу. До свидания!')
	process.exit(0)
})

process.on('unhandledRejection', (error) => {
	console.error('❌ Необработанная ошибка:', error)
})

startBot()
