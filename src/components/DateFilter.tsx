import { addDays, format } from 'date-fns'
import React, { useEffect, useState } from 'react'
import './DateFilter.css'

interface DateFilterProps {
	startDate: Date
	endDate: Date
	onStartDateChange: (date: Date) => void
	onEndDateChange: (date: Date) => void
	maxDays?: number
	showMaxDaysLimit?: boolean
}

const DateFilter: React.FC<DateFilterProps> = ({
	// фильтр по диапазону дат
	startDate,
	endDate,
	onStartDateChange,
	onEndDateChange,
	maxDays = 4,
	showMaxDaysLimit = true,
}) => {
	const [activeButton, setActiveButton] = useState<string | null>(null)

	// Определяем активную кнопку на основе текущих дат
	useEffect(() => {
		const today = new Date()
		const daysDifference =
			Math.ceil(
				(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
			) + 1

		// Проверка, соответствует ли текущий диапазон одной из кнопок быстрого выбора
		// Сравниваем даты (только день)
		const startDateOnly = new Date(
			startDate.getFullYear(),
			startDate.getMonth(),
			startDate.getDate()
		)
		const todayOnly = new Date(
			today.getFullYear(),
			today.getMonth(),
			today.getDate()
		)

		if (startDateOnly.getTime() === todayOnly.getTime()) {
			if (daysDifference === 1) {
				setActiveButton('Сегодня')
			} else if (daysDifference === 4) {
				setActiveButton('4 дня')
			} else if (daysDifference === 7) {
				setActiveButton('1 неделя')
			} else if (daysDifference === 14) {
				setActiveButton('2 недели')
			} else {
				setActiveButton(null)
			}
		} else {
			setActiveButton(null)
		}
	}, [startDate, endDate])

	const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newStartDate = new Date(e.target.value)
		onStartDateChange(newStartDate)

		// Автоматический переход на конец диапазона, если он превышает maxDays
		if (showMaxDaysLimit) {
			const maxEndDate = addDays(newStartDate, maxDays - 1)
			if (endDate > maxEndDate) {
				onEndDateChange(maxEndDate)
			}
		}
	}

	const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newEndDate = new Date(e.target.value)

		if (showMaxDaysLimit) {
			const maxEndDate = addDays(startDate, maxDays - 1)
			if (newEndDate > maxEndDate) {
				onEndDateChange(maxEndDate)
				return
			}
		}

		onEndDateChange(newEndDate)
	}

	const quickDateButtons = [
		{ label: 'Сегодня', days: 0 },
		{ label: '4 дня', days: 3 },
		{ label: '1 неделя', days: 6 },
		{ label: '2 недели', days: 13 },
	]

	const handleQuickDate = (days: number, label: string) => {
		const today = new Date()
		const newStartDate = today
		// Для "Сегодня" (days = 0) показываем один день, для остальных - указанное количество дней
		const newEndDate = days === 0 ? today : addDays(today, days)

		if (showMaxDaysLimit && days >= maxDays) {
			onStartDateChange(newStartDate)
			onEndDateChange(addDays(newStartDate, maxDays - 1))
		} else {
			onStartDateChange(newStartDate)
			onEndDateChange(newEndDate)
		}

		// Устанавливаем активную кнопку
		setActiveButton(label)
	}

	const daysDifference =
		Math.ceil(
			(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
		) + 1

	return (
		<div className='date-filter'>
			<div className='filter-header'>
				<h3>Фильтр по диапазону</h3>
				{showMaxDaysLimit && (
					<div className='max-days-info'>
						Макс: {maxDays} дней | Текущий: {daysDifference} дней
					</div>
				)}
			</div>

			<div className='date-inputs'>
				<div className='date-input-group'>
					<label htmlFor='start-date'>Начало:</label>
					<input
						type='date'
						id='start-date'
						value={format(startDate, 'yyyy-MM-dd')}
						onChange={handleStartDateChange}
						max={format(endDate, 'yyyy-MM-dd')}
					/>
				</div>

				<div className='date-input-group'>
					<label htmlFor='end-date'>Конец:</label>
					<input
						type='date'
						id='end-date'
						value={format(endDate, 'yyyy-MM-dd')}
						onChange={handleEndDateChange}
						min={format(startDate, 'yyyy-MM-dd')}
						max={
							showMaxDaysLimit
								? format(addDays(startDate, maxDays - 1), 'yyyy-MM-dd')
								: undefined
						}
					/>
				</div>
			</div>

			<div className='quick-date-buttons'>
				<span>Быстрый выбор:</span>
				{quickDateButtons.map((button, index) => (
					<button
						key={index}
						onClick={() => handleQuickDate(button.days, button.label)}
						className={`quick-btn ${
							button.days >= maxDays && showMaxDaysLimit ? 'disabled' : ''
						} ${activeButton === button.label ? 'active' : ''}`}
						disabled={button.days >= maxDays && showMaxDaysLimit}
						title={
							showMaxDaysLimit &&
							(button.label === '1 неделя' || button.label === '2 недели')
								? 'Перейдите на вариант 2 в шапке приложения'
								: undefined
						}
					>
						{button.label}
					</button>
				))}
			</div>

			{showMaxDaysLimit && daysDifference > maxDays && (
				<div className='warning-message'>
					⚠️ Диапазон дат превышает максимальное количество дней {maxDays}
				</div>
			)}
		</div>
	)
}

export default DateFilter
