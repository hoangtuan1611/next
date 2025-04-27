export type TimeInfo = {
  currentCount: number
  dateTime: string
}

export type CreateDateInfo = {
  createDate: string
  className: string
  room: string
  firstTime: TimeInfo
  lastTime: TimeInfo
}

export type SubjectInfo = {
  subjectName: string
  maxStudent: number
  createDate: CreateDateInfo[]
}

export type TeacherLogInfo = {
  teacherName: string
  subject: SubjectInfo[]
}
