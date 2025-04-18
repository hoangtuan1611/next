export interface Subject {
  subjectName: string
}

export interface Schedule {
  className: string
  startDay: string
  endDay: string
  weekNum: number
  maxStudents: number
  classId: string
}

export interface TimeTableItem {
  dayOfWeek: number
  timeOfDay: number
  subject: Subject
  schedule: Schedule
  room: string
  periodBegin: number
  periodEnd: number
}
