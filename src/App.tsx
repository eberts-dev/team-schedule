import { useEffect, useState } from 'react'
import './App.css'
import DateFilter from './components/DateFilter'
import ScheduleGrid from './components/ScheduleGrid'
import scheduleData from './data/scheduleData.json'
import type { EmployeeSchedule, ScheduleData } from './types/schedule'
import { filterByDateRange, processScheduleData } from './utils/scheduleUtils'

function App() {
	const [data] = useState<ScheduleData>(scheduleData)
	const [startDate, setStartDate] = useState(new Date())
	const [endDate, setEndDate] = useState(() => {
		const today = new Date()
		return new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000) // +3 дня
	})
	const [schedules, setSchedules] = useState<EmployeeSchedule[]>([])
	const [isAdvancedMode, setIsAdvancedMode] = useState(false)

	useEffect(() => {
		const processedSchedules = processScheduleData(
			data.planned,
			data.actual,
			isAdvancedMode
		)
		const filteredSchedules = filterByDateRange(
			processedSchedules,
			startDate,
			endDate
		)
		setSchedules(filteredSchedules)
	}, [data, startDate, endDate, isAdvancedMode])

	const handleStartDateChange = (date: Date) => {
		setStartDate(date)
	}

	const handleEndDateChange = (date: Date) => {
		setEndDate(date)
	}

	return (
		<div className='app'>
			<header className='app-header'>
				<div className='header-content'>
					<h1>График работы сотрудников</h1>
					<div className='mode-toggle'>
						<button
							className={`mode-btn ${!isAdvancedMode ? 'active' : ''}`}
							onClick={() => setIsAdvancedMode(false)}
						>
							Вариант 1
						</button>
						<button
							className={`mode-btn ${isAdvancedMode ? 'active' : ''}`}
							onClick={() => setIsAdvancedMode(true)}
						>
							Вариант 2
						</button>
					</div>
				</div>
			</header>

			<main className='app-main'>
				<div className='container'>
					<div className='mode-info'>
						{isAdvancedMode ? (
							<div className='info-card advanced'>
								<h3>Задача нормальной сложности</h3>
								<p>• Отображение запланированных и фактических смен</p>
								<p>
									• Показывать поздние прибытия, ранние отъезды и отсутствия
								</p>
								<p>• Без ограничения максимального диапазона дат</p>
							</div>
						) : (
							<div className='info-card basic'>
								<h3>Облегченная задача (минимум)</h3>
								<p>• Отображение только запланированных смен</p>
								<p>• Не более 4 дней в одном диапазоне дат</p>
								<p>• Нажмите на смену, чтобы просмотреть подробности</p>
							</div>
						)}
					</div>

					<DateFilter
						startDate={startDate}
						endDate={endDate}
						onStartDateChange={handleStartDateChange}
						onEndDateChange={handleEndDateChange}
						maxDays={4}
						showMaxDaysLimit={!isAdvancedMode}
					/>

					<div className='schedule-section'>
						<div className='section-header'>
							<h2>График работы</h2>
							<div className='legend'>
								<div className='legend-item'>
									<div className='legend-color planned'></div>
									<span>Плановый</span>
								</div>
								{isAdvancedMode && (
									<>
										<div className='legend-item'>
											<div className='legend-color actual'></div>
											<span>Фактический (наложение)</span>
										</div>
										<div className='legend-item'>
											<div className='legend-color late'></div>
											<span>Опоздание</span>
										</div>
										<div className='legend-item'>
											<div className='legend-color early-leave'></div>
											<span>Ранний уход</span>
										</div>
										<div className='legend-item'>
											<div className='legend-color absent'></div>
											<span>Отсутствие (прогул)</span>
										</div>
									</>
								)}
							</div>
						</div>

						{schedules.length === 0 ? (
							<div className='no-data'>
								<p>
									Для выбранного диапазона дат данные о расписании не найдены.
								</p>
							</div>
						) : (
							<ScheduleGrid
								schedules={schedules}
								startDate={startDate}
								endDate={endDate}
								isAdvancedMode={isAdvancedMode}
							/>
						)}
					</div>
				</div>
			</main>

			<footer className='app-footer'>
				<div className='container'>
					<p>&copy; 2025</p>
				</div>
			</footer>
		</div>
	)
}

export default App
