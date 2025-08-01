function formatTime(time) {
	const [hours, minutes] = time.split(':')
	const hour = parseInt(hours)

	if (hour < 6) {
		return `🌙 ${time} (ночь)`
	} else if (hour < 12) {
		return `🌅 ${time} (утро)`
	} else if (hour < 18) {
		return `☀️ ${time} (день)`
	} else {
		return `🌆 ${time} (вечер)`
	}
}

function getTimeBasedGreeting() {
	const hour = new Date().getHours()

	if (hour < 6) {
		return '🌙 Доброй ночи'
	} else if (hour < 12) {
		return '🌅 Доброе утро'
	} else if (hour < 18) {
		return '☀️ Добрый день'
	} else {
		return '🌆 Добрый вечер'
	}
}

function formatDate(dateString) {
	const date = new Date(dateString)
	const today = new Date()
	const yesterday = new Date()
	yesterday.setDate(today.getDate() - 1)

	if (date.toDateString() === today.toDateString()) {
		return '📅 Сегодня'
	} else if (date.toDateString() === yesterday.toDateString()) {
		return '📅 Вчера'
	} else {
		return `📅 ${date.toLocaleDateString('ru-RU')}`
	}
}

function getDaysBetween(startDate, endDate = new Date().toISOString()) {
	const start = new Date(startDate)
	const end = new Date(endDate)
	const diffTime = Math.abs(end - start)
	return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

function isValidTime(timeString) {
	const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
	return timeRegex.test(timeString)
}

function getStreakMessage(streak) {
	if (streak === 0) {
		return '🎯 Начни сегодня! Первый шаг самый важный.'
	} else if (streak === 1) {
		return '🌱 Отличное начало! Продолжай в том же духе.'
	} else if (streak < 7) {
		return `🔥 ${streak} дней подряд! Ты набираем обороты!`
	} else if (streak < 30) {
		return `⭐ ${streak} дней подряд! Привычка формируется!`
	} else if (streak < 100) {
		return `🏆 ${streak} дней подряд! Ты настоящий чемпион!`
	} else {
		return `💎 ${streak} дней подряд! Это уже образ жизни!`
	}
}

function getCompletionPercentage(completions, days = 30) {
	if (!completions || completions.length === 0) return 0

	const endDate = new Date()
	const startDate = new Date()
	startDate.setDate(endDate.getDate() - days)

	const completionsInPeriod = completions.filter((dateString) => {
		const date = new Date(dateString)
		return date >= startDate && date <= endDate
	})

	return Math.round((completionsInPeriod.length / days) * 100)
}

function getRandomHabitEmoji() {
	const emojis = ['⭐', '🎯', '💪', '🚀', '⚡', '🔥', '💎', '🌟', '✨', '🏆']
	return emojis[Math.floor(Math.random() * emojis.length)]
}

function createProgressBar(percentage, length = 10) {
	const filledBlocks = Math.round((percentage / 100) * length)
	const emptyBlocks = length - filledBlocks

	const filled = '🟩'.repeat(filledBlocks)
	const empty = '⬜'.repeat(emptyBlocks)

	return `${filled}${empty} ${percentage}%`
}

function isWeekend() {
	const day = new Date().getDay()
	return day === 0 || day === 6
}

function getWeekdayName(date = new Date()) {
	const weekdays = [
		'Воскресенье',
		'Понедельник',
		'Вторник',
		'Среда',
		'Четверг',
		'Пятница',
		'Суббота',
	]
	return weekdays[date.getDay()]
}

function truncateText(text, maxLength = 50) {
	if (text.length <= maxLength) return text
	return text.substring(0, maxLength - 3) + '...'
}

module.exports = {
	formatTime,
	getTimeBasedGreeting,
	formatDate,
	getDaysBetween,
	isValidTime,
	getStreakMessage,
	getCompletionPercentage,
	getRandomHabitEmoji,
	createProgressBar,
	isWeekend,
	getWeekdayName,
	truncateText,
}
