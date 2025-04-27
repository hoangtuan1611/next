export interface StatisticalData {
  room: string
  createDate: StatisticalByDate[]
}

export interface StatisticalByDate {
  createDate: string
  teacherName: string
  subjectname: string
  className: string
  maxStudent: number
  firstTime: TimeLog
  lastTime: TimeLog
}

export interface TimeLog {
  currentCount: number
  dateTime: string
}
