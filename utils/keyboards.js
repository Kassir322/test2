const { InlineKeyboard, Keyboard } = require('grammy')

function getMainMenu() {
	return new InlineKeyboard()
		.text('➕ Добавить привычку', 'add_habit')
		.row()
		.text('📋 Мои привычки', 'my_habits')
		.row()
		.text('📊 Статистика', 'statistics')
		.row()
		.text('⚙️ Настройки', 'settings')
}

function getHabitMenu(habitId) {
	return new InlineKeyboard()
		.text('✅ Выполнено', `complete_${habitId}`)
		.row()
		.text('⏰ Изменить время', `edit_time_${habitId}`)
		.text('✏️ Редактировать', `edit_habit_${habitId}`)
		.row()
		.text('🗑️ Удалить', `delete_${habitId}`)
		.text('◀️ Назад', 'my_habits')
}

function getConfirmationMenu(action, habitId = '') {
	return new InlineKeyboard()
		.text('✅ Да', `confirm_${action}_${habitId}`)
		.text('❌ Нет', 'cancel')
		.row()
		.text('◀️ Назад', 'my_habits')
}

function getFrequencyMenu() {
	return new InlineKeyboard()
		.text('1 раз в день', 'freq_1')
		.row()
		.text('2 раза в день', 'freq_2')
		.text('3 раза в день', 'freq_3')
		.row()
		.text('Каждый час', 'freq_hourly')
		.row()
		.text('◀️ Назад', 'add_habit')
}

function getBackToMenuButton() {
	return new InlineKeyboard().text('◀️ Главное меню', 'main_menu')
}

function getReminderButtons(habitId) {
	return new InlineKeyboard()
		.text('✅ Выполнил!', `complete_${habitId}`)
		.text('⏰ Напомнить позже', `snooze_${habitId}`)
		.row()
		.text('❌ Пропустить', `skip_${habitId}`)
}

module.exports = {
	getMainMenu,
	getHabitMenu,
	getConfirmationMenu,
	getFrequencyMenu,
	getBackToMenuButton,
	getReminderButtons,
}
