import { addDays, format } from 'date-fns'
import React, { useCallback, useEffect, useState } from 'react'
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

	// для форматирования даты
	const formatDateSafely = (date: Date): string => {
		return isNaN(date.getTime()) ? '' : format(date, 'yyyy-MM-dd')
	}

	// для создания даты без времени (только день)
	const createDateOnly = (date: Date): Date => {
		return new Date(date.getFullYear(), date.getMonth(), date.getDate())
	}

	// для сравнения дат (только день)
	const isSameDate = useCallback((date1: Date, date2: Date): boolean => {
		return createDateOnly(date1).getTime() === createDateOnly(date2).getTime()
	}, [])

	// Активная кнопка на основе дат
	useEffect(() => {
		const today = new Date()
		const daysDifference =
			Math.ceil(
				(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
			) + 1

		if (isSameDate(startDate, today)) {
			// Проверяем даты окончания для каждой кнопки
			const expectedEndDate = (() => {
				switch (daysDifference) {
					case 1:
						return isSameDate(endDate, today) ? 'Сегодня' : null
					case 4:
						return isSameDate(endDate, addDays(today, 3)) ? '4 дня' : null
					case 7:
						return isSameDate(endDate, addDays(today, 6)) ? '1 неделя' : null
					case 14:
						return isSameDate(endDate, addDays(today, 13)) ? '2 недели' : null
					default:
						return null
				}
			})()

			setActiveButton(expectedEndDate)
		} else {
			setActiveButton(null)
		}
	}, [startDate, endDate, isSameDate])

	const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newStartDate = new Date(e.target.value)

		// валидность даты
		if (isNaN(newStartDate.getTime())) {
			return
		}

		onStartDateChange(newStartDate)

		if (endDate <= newStartDate) {
			onEndDateChange(addDays(newStartDate, 1))
			return
		}

		// Автоматический переход на конец, если он превышает maxDays
		if (showMaxDaysLimit) {
			const maxEndDate = addDays(newStartDate, maxDays - 1)
			if (endDate > maxEndDate) {
				onEndDateChange(maxEndDate)
			}
		}
	}

	const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newEndDate = new Date(e.target.value)

		// валидность даты
		if (isNaN(newEndDate.getTime())) {
			return
		}

		// Проверяем, что дата окончания не равна дате начала (кроме кнопки "Сегодня")
		if (isSameDate(startDate, newEndDate) && activeButton !== 'Сегодня') {
			// Если выбрана та же дата и это не кнопка "Сегодня", устанавливаем следующий день
			onEndDateChange(addDays(startDate, 1))
			return
		}

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
		const newEndDate = days === 0 ? new Date(today) : addDays(today, days)

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

	// дни между датами
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
						value={formatDateSafely(startDate)}
						onChange={handleStartDateChange}
						max={formatDateSafely(endDate)}
					/>
				</div>

				<div className='date-input-group'>
					<label htmlFor='end-date'>Конец:</label>
					<input
						type='date'
						id='end-date'
						value={formatDateSafely(endDate)}
						onChange={handleEndDateChange}
						min={
							activeButton === 'Сегодня'
								? formatDateSafely(startDate)
								: formatDateSafely(addDays(startDate, 1))
						}
						max={
							showMaxDaysLimit
								? formatDateSafely(addDays(startDate, maxDays - 1))
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

			{showMaxDaysLimit &&
				daysDifference > maxDays &&
				activeButton !== 'Сегодня' && (
					<div className='warning-message'>
						⚠️ Диапазон дат превышает максимальное количество дней {maxDays}
					</div>
				)}
		</div>
	)
}

export default DateFilter
