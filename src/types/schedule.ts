export interface ScheduleItem {
	id: number
	employee: string
	store: string
	role: string
	startTime: string
	endTime: string
}

export interface ScheduleData {
	planned: ScheduleItem[]
	actual: ScheduleItem[]
}

export interface EmployeeSchedule {
	employee: string
	store: string
	role: string
	plannedShifts: ScheduleItem[]
	actualShifts: ScheduleItem[]
}

export interface ShiftInfo {
	planned: ScheduleItem
	actual?: ScheduleItem
	isLate: boolean
	isEarlyLeave: boolean
	isAbsent: boolean
	duration: number
}
