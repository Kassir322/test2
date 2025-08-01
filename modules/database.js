const fs = require('fs').promises
const path = require('path')

const DATA_FILE = path.join(__dirname, '..', 'data', 'users.json')

async function ensureDataFileExists() {
	try {
		await fs.access(DATA_FILE)
	} catch (error) {
		console.log('📁 Создаем файл базы данных users.json...')

		const dataDir = path.dirname(DATA_FILE)
		await fs.mkdir(dataDir, { recursive: true })

		await fs.writeFile(DATA_FILE, '{}', 'utf8')
		console.log('✅ Файл базы данных создан успешно')
	}
}

async function loadUsers() {
	try {
		await ensureDataFileExists()
		const data = await fs.readFile(DATA_FILE, 'utf8')
		return JSON.parse(data)
	} catch (error) {
		console.error('❌ Ошибка при чтении базы данных:', error)
		return {}
	}
}

async function saveUsers(users) {
	try {
		await ensureDataFileExists()
		const data = JSON.stringify(users, null, 2)
		await fs.writeFile(DATA_FILE, data, 'utf8')
		console.log('💾 Данные сохранены успешно')
	} catch (error) {
		console.error('❌ Ошибка при сохранении:', error)
	}
}

async function getUser(userId) {
	const users = await loadUsers()
	if (!users[userId]) {
		console.log(`👤 Создаем профиль для нового пользователя ${userId}`)
		users[userId] = {
			habits: [],
			createdAt: new Date().toISOString(),
		}
		await saveUsers(users)
	}
	return users[userId]
}

async function updateUser(userId, userData) {
	const users = await loadUsers()
	users[userId] = userData
	await saveUsers(users)
}

module.exports = {
	loadUsers,
	saveUsers,
	getUser,
	updateUser,
}
