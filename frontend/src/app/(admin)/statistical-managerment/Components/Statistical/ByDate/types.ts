export interface SubjectLogGroupItem {
  createTime: string
  currentCount: number
  imgPath: string
}

export interface TeachingSession {
  teachingSession: number
  teacherName: string
  subjectName: string
  className: string
  maxSudent: number
  firstLog: SubjectLogGroupItem
  lastLog: SubjectLogGroupItem
}

export interface SubjectLogGroupSummaryDto {
  createDate: string
  teachingSession: TeachingSession[]
}
