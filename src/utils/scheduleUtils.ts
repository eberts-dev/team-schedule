import { differenceInMinutes, isAfter, isBefore, parseISO } from 'date-fns'
import type {
	EmployeeSchedule,
	ScheduleItem,
	ShiftInfo,
} from '../types/schedule'

export const processScheduleData = (
	planned: ScheduleItem[],
	actual: ScheduleItem[],
	isAdvancedMode: boolean = false
): EmployeeSchedule[] => {
	const employeeMap = new Map<string, EmployeeSchedule>()

	// Группируем плановые смены
	planned.forEach((shift) => {
		const key = `${shift.employee}-${shift.store}`
		if (!employeeMap.has(key)) {
			employeeMap.set(key, {
				employee: shift.employee,
				store: shift.store,
				role: shift.role,
				plannedShifts: [],
				actualShifts: [],
			})
		}
		employeeMap.get(key)!.plannedShifts.push(shift)
	})

	// Группируем фактические (идет в вариант 2)
	if (isAdvancedMode) {
		actual.forEach((shift) => {
			const key = `${shift.employee}-${shift.store}`
			if (employeeMap.has(key)) {
				employeeMap.get(key)!.actualShifts.push(shift)
			}
		})
	}

	return Array.from(employeeMap.values())
}

// анализ смены
export const analyzeShift = (
	planned: ScheduleItem,
	actual?: ScheduleItem,
	isAdvancedMode: boolean = false
): ShiftInfo => {
	const plannedStart = parseISO(planned.startTime)
	const plannedEnd = parseISO(planned.endTime)
	const plannedDuration = differenceInMinutes(plannedEnd, plannedStart)

	if (!actual) {
		return {
			planned,
			isLate: false,
			isEarlyLeave: false,
			isAbsent: isAdvancedMode, // помечаем как отсутствие (только в вариант 2)
			duration: plannedDuration,
		}
	}

	const actualStart = parseISO(actual.startTime)
	const actualEnd = parseISO(actual.endTime)
	const actualDuration = differenceInMinutes(actualEnd, actualStart)

	const isLate = isAfter(actualStart, plannedStart)
	const isEarlyLeave = isBefore(actualEnd, plannedEnd)

	return {
		planned,
		actual,
		isLate,
		isEarlyLeave,
		isAbsent: false,
		duration: actualDuration,
	}
}

export const filterByDateRange = (
	schedules: EmployeeSchedule[],
	startDate: Date,
	endDate: Date
): EmployeeSchedule[] => {
	// Нормализуем даты до начала
	const normalizedStartDate = new Date(
		startDate.getFullYear(),
		startDate.getMonth(),
		startDate.getDate()
	)
	const normalizedEndDate = new Date( // нормализуем дату до конца дня
		endDate.getFullYear(),
		endDate.getMonth(),
		endDate.getDate(),
		23,
		59,
		59
	)

	const filteredSchedules = schedules.map((schedule) => {
		const filteredPlanned = schedule.plannedShifts.filter((shift) => {
			const shiftStartDate = parseISO(shift.startTime)
			const shiftEndDate = parseISO(shift.endTime)
			// Смена должна пересекаться с выбранным диапазоном
			return (
				shiftStartDate <= normalizedEndDate &&
				shiftEndDate >= normalizedStartDate
			)
		})

		const filteredActual = schedule.actualShifts.filter((shift) => {
			const shiftStartDate = parseISO(shift.startTime)
			const shiftEndDate = parseISO(shift.endTime)
			// Смена должна пересекаться с выбранным диапазоном
			return (
				shiftStartDate <= normalizedEndDate &&
				shiftEndDate >= normalizedStartDate
			)
		})

		return {
			...schedule, // отфильтрованные смены
			plannedShifts: filteredPlanned,
			actualShifts: filteredActual,
		}
	})

	return filteredSchedules.filter(
		(schedule) =>
			schedule.plannedShifts.length > 0 || schedule.actualShifts.length > 0
	)
}

export const formatDuration = (minutes: number): string => {
	const hours = Math.floor(minutes / 60)
	const mins = minutes % 60
	return `${hours}ч ${mins}м`
}

export const formatTime = (dateString: string): string => {
	return parseISO(dateString).toLocaleTimeString('ru-RU', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
	})
}
