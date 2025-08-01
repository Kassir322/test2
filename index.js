require('dotenv').config()

const { Bot } = require('grammy')
const { getMainMenu } = require('./utils/keyboards')

const bot = new Bot(process.env.BOT_TOKEN)

console.log('🤖 Запуск бота "Трекер Привычек" - ШАГ 1...')

let messageCounter = 0

// Команда /start с импортированным меню
bot.command('start', async (ctx) => {
	messageCounter++

	console.log(
		`🔥 ВЫЗОВ №${messageCounter} команды /start от пользователя ${ctx.from.id}`
	)

	const userName = ctx.from.first_name || 'Друг'

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

	console.log(`✅ Отправлено сообщение №${messageCounter}`)
})

// Команда /help
bot.command('help', async (ctx) => {
	console.log(`❓ Пользователь ${ctx.from.id} запросил справку`)

	await ctx.reply(`
📖 СПРАВКА ПО БОТУ

🔸 Команды:
/start - главное меню
/help - эта справка

💡 Нажимай на кнопки под сообщениями!
    `)
})

// Пока простая обработка кнопок (без логики)
bot.on('callback_query', async (ctx) => {
	const data = ctx.callbackQuery.data
	console.log(`🔘 Нажата кнопка: ${data}`)

	// Простые ответы на кнопки
	switch (data) {
		case 'add_habit':
			await ctx.editMessageText('➕ Добавление привычки (функция будет позже)')
			break
		case 'my_habits':
			await ctx.editMessageText('📋 Мои привычки (функция будет позже)')
			break
		case 'statistics':
			await ctx.editMessageText('📊 Статистика (функция будет позже)')
			break
		case 'settings':
			await ctx.editMessageText('⚙️ Настройки (функция будет позже)')
			break
		case 'main_menu':
			await ctx.editMessageText(
				`
🏠 ГЛАВНОЕ МЕНЮ

Выбери действие:
            `,
				{
					reply_markup: getMainMenu(),
				}
			)
			break
		default:
			await ctx.answerCallbackQuery('🤔 Неизвестная кнопка')
			return
	}

	await ctx.answerCallbackQuery()
})

// Логируем входящие текстовые сообщения (пока не обрабатываем)
bot.on('message:text', async (ctx) => {
	console.log(`💬 Текстовое сообщение: "${ctx.message.text}" (пока игнорируем)`)
})

// Запуск бота
async function startBot() {
	try {
		console.log('🚀 Инициализация...')
		await bot.start()
		console.log('✅ Бот запущен (ШАГ 1)!')
	} catch (error) {
		console.error('❌ Ошибка:', error)
		process.exit(1)
	}
}

startBot()
