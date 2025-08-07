import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import React, { useState } from 'react'
import type { EmployeeSchedule, ShiftInfo } from '../types/schedule'
import {
	analyzeShift,
	formatDuration,
	formatTime,
} from '../utils/scheduleUtils'
import './ScheduleGrid.css'

interface ScheduleGridProps {
	schedules: EmployeeSchedule[]
	startDate: Date
	endDate: Date
	isAdvancedMode: boolean
}

interface ShiftModalProps {
	shiftInfo: ShiftInfo
	isOpen: boolean
	onClose: () => void
}

const ShiftModal: React.FC<ShiftModalProps> = ({
	// модальное окно с информацией о смене
	shiftInfo,
	isOpen,
	onClose,
}) => {
	if (!isOpen) return null

	const { planned, actual, isLate, isEarlyLeave, isAbsent, duration } =
		shiftInfo
	const plannedDuration = analyzeShift(planned).duration

	// Оптимизация: предварительное форматирование времени
	const plannedStartTime = formatTime(planned.startTime)
	const plannedEndTime = formatTime(planned.endTime)
	const actualStartTime = actual ? formatTime(actual.startTime) : null
	const actualEndTime = actual ? formatTime(actual.endTime) : null

	return (
		<div className='modal-overlay' onClick={onClose}>
			<div className='modal-content' onClick={(e) => e.stopPropagation()}>
				<div className='modal-header'>
					<h3>Детали смены</h3>
					<button className='modal-close' onClick={onClose}>
						×
					</button>
				</div>
				<div className='modal-body'>
					<div className='shift-info'>
						<div className='info-row'>
							<strong>Сотрудник:</strong> {planned.employee}
						</div>
						<div className='info-row'>
							<strong>Магазин:</strong> {planned.store}
						</div>
						<div className='info-row'>
							<strong>Роль:</strong> {planned.role}
						</div>
						<div className='info-row'>
							<strong>Начало:</strong> {plannedStartTime}
						</div>
						<div className='info-row'>
							<strong>Конец:</strong> {plannedEndTime}
						</div>
						<div className='info-row'>
							<strong>Продолжительность:</strong>{' '}
							{formatDuration(plannedDuration)}
						</div>
						{actual && (
							<>
								<div className='info-row'>
									<strong>Фактическое начало:</strong> {actualStartTime}
								</div>
								<div className='info-row'>
									<strong>Фактический конец:</strong> {actualEndTime}
								</div>
								<div className='info-row'>
									<strong>Фактическая продолжительность:</strong>{' '}
									{formatDuration(duration)}
								</div>
							</>
						)}
						<div className='status-indicators'>
							{isAbsent && (
								<span className='status-badge absent'>Отсутствие</span>
							)}
							{isLate && <span className='status-badge late'>Опоздание</span>}
							{isEarlyLeave && (
								<span className='status-badge early-leave'>Ранний уход</span>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

const ScheduleGrid: React.FC<ScheduleGridProps> = ({
	// таблица с графиками смен
	schedules,
	startDate,
	endDate,
	isAdvancedMode,
}) => {
	const [selectedShift, setSelectedShift] = useState<ShiftInfo | null>(null)
	const [isModalOpen, setIsModalOpen] = useState(false)

	const handleShiftClick = (shiftInfo: ShiftInfo) => {
		setSelectedShift(shiftInfo)
		setIsModalOpen(true)
	}

	const closeModal = () => {
		setIsModalOpen(false)
		setSelectedShift(null)
	}

	const getDaysInRange = () => {
		const days = []
		const current = new Date(startDate)
		while (current <= endDate) {
			days.push(new Date(current))
			current.setDate(current.getDate() + 1)
		}
		return days
	}

	const days = getDaysInRange()

	const getShiftForDay = (schedule: EmployeeSchedule, day: Date) => {
		const dayStr = format(day, 'yyyy-MM-dd')
		const plannedShift = schedule.plannedShifts.find(
			(shift) =>
				shift.startTime.startsWith(dayStr) || shift.endTime.startsWith(dayStr)
		)
		const actualShift = schedule.actualShifts.find(
			(shift) =>
				shift.startTime.startsWith(dayStr) || shift.endTime.startsWith(dayStr)
		)

		if (plannedShift) {
			return analyzeShift(plannedShift, actualShift, isAdvancedMode)
		}
		return null
	}

	return (
		<div className='schedule-container'>
			<div className='schedule-table-wrapper'>
				<div className='schedule-header'>
					<div className='header-cell employee-header'>Сотрудник</div>
					<div className='header-cell store-header'>Магазин</div>
					<div className='header-cell role-header'>Роль</div>
					{days.map((day) => (
						<div key={day.toISOString()} className='header-cell date-header'>
							{format(day, 'dd MMM', { locale: ru })}
						</div>
					))}
				</div>

				<div className='schedule-body'>
					{schedules.map((schedule) => (
						<div
							key={`${schedule.employee}-${schedule.store}`}
							className='schedule-row'
						>
							<div className='cell employee-cell'>{schedule.employee}</div>
							<div className='cell store-cell'>{schedule.store}</div>
							<div className='cell role-cell'>{schedule.role}</div>
							{days.map((day) => {
								const shift = getShiftForDay(schedule, day)

								// Оптимизация: форматирование времени для смены
								if (shift) {
									const plannedStartTime = formatTime(shift.planned.startTime)
									const plannedEndTime = formatTime(shift.planned.endTime)
									const actualStartTime = shift.actual
										? formatTime(shift.actual.startTime)
										: null
									const actualEndTime = shift.actual
										? formatTime(shift.actual.endTime)
										: null
									const shiftTitle = shift.isAbsent
										? 'Отсутствовал'
										: `${plannedStartTime} - ${plannedEndTime}`

									return (
										<div key={day.toISOString()} className='cell shift-cell'>
											<div
												className={`shift-block ${
													shift.isAbsent ? 'absent' : ''
												} ${shift.isLate ? 'late' : ''} ${
													shift.isEarlyLeave ? 'early-leave' : ''
												}`}
												onClick={() => handleShiftClick(shift)}
												title={shiftTitle}
											>
												<div className='shift-time'>
													{plannedStartTime} - {plannedEndTime}
												</div>
												{shift.actual ? (
													<div className='actual-overlay'>
														{actualStartTime} - {actualEndTime}
													</div>
												) : (
													<div className='actual-overlay'>---</div>
												)}
											</div>
										</div>
									)
								}

								return (
									<div
										key={day.toISOString()}
										className='cell shift-cell'
									></div>
								)
							})}
						</div>
					))}
				</div>
			</div>

			{selectedShift && (
				<ShiftModal
					shiftInfo={selectedShift}
					isOpen={isModalOpen}
					onClose={closeModal}
				/>
			)}
		</div>
	)
}

export default ScheduleGrid
