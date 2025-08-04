const { getUser, updateUser } = require('./database')

async function createHabit(userId, habitName, reminderTimes = []) {
	const user = await getUser(userId)

	const habitId = Date.now().toString()

	const newHabit = {
		id: habitId,
		name: habitName,
		reminderTimes: reminderTimes,
		createdAt: new Date().toISOString(),
		completions: [],
		streak: 0,
		totalCompletions: 0,
	}

	user.habits.push(newHabit)

	await updateUser(userId, user)

	return newHabit
}

async function getUserHabits(userId) {
	const user = await getUser(userId)
	return user.habits
}

async function getHabitById(userId, habitId) {
	const habits = await getUserHabits(userId)
	return habits.find((habit) => habit.id === habitId)
}

async function completeHabit(userId, habitId) {
	const user = await getUser(userId)
	const habitIndex = user.habits.findIndex((habit) => habit.id === habitId)

	if (habitIndex === -1) {
		throw new Error('Привычка не найдена')
	}

	const today = new Date().toISOString().split('T')[0]
	const habit = user.habits[habitIndex]

	if (habit.completions.includes(today)) {
		return { alreadyCompleted: true, habit }
	}

	habit.completions.push(today)
	habit.totalCompletions++

	habit.streak = calculateStreak(habit.completions)

	await updateUser(userId, user)

	return { alreadyCompleted: false, habit }
}

function calculateStreak(completions) {
	if (completions.length === 0) return 0

	const sortedDates = completions
		.map((date) => new Date(date))
		.sort((a, b) => b - a)

	let streak = 0
	const today = new Date()
	today.setHours(0, 0, 0, 0)

	for (let i = 0; i < sortedDates.length; i++) {
		const checkDate = new Date(today)
		checkDate.setDate(today.getDate() - i)

		const completionDate = sortedDates.find((date) => {
			date.setHours(0, 0, 0, 0)
			return date.getTime() === checkDate.getTime()
		})

		if (completionDate) {
			streak++
		} else {
			break
		}
	}

	return streak
}

async function deleteHabit(userId, habitId) {
	const user = await getUser(userId)
	user.habits = user.habits.filter((habit) => habit.id !== habitId)
	await updateUser(userId, user)
}

async function updateHabitReminders(userId, habitId, newTimes) {
	const user = await getUser(userId)
	const habitIndex = user.habits.findIndex((habit) => habit.id === habitId)

	if (habitIndex !== -1) {
		user.habits[habitIndex].reminderTimes = newTimes
		await updateUser(userId, user)
		return user.habits[habitIndex]
	}

	throw new Error('Привычка не найдена')
}

async function getHabitsStatistics(userId) {
	const habits = await getUserHabits(userId)

	const stats = {
		totalHabits: habits.length,
		totalCompletions: habits.reduce(
			(sum, habit) => sum + habit.totalCompletions,
			0
		),
		averageStreak:
			habits.length > 0
				? habits.reduce((sum, habit) => sum + habit.streak, 0) / habits.length
				: 0,
		bestStreak: Math.max(...habits.map((habit) => habit.streak), 0),
		habitsCompletedToday: 0,
	}

	const today = new Date().toISOString().split('T')[0]
	stats.habitsCompletedToday = habits.filter((habit) =>
		habit.completions.includes(today)
	).length

	return stats
}

module.exports = {
	createHabit,
	getUserHabits,
	getHabitById,
	completeHabit,
	deleteHabit,
	updateHabitReminders,
	getHabitsStatistics,
	calculateStreak,
}
