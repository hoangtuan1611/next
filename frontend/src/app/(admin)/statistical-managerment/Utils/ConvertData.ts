import { SubjectLogGroupSummaryDto } from '../Components/Statistical/ByDate/types'
import { StatisticalData } from '../Components/Statistical/ByRoom/types'
import { TeacherLogInfo } from '../Components/Statistical/ByTeacher/types'

export type ChartType = {
  name: string
  value1: number
  value2: number
  firstTime: string
  lastTime: string
}

type SelectType = {
  value: string
  label: string
}

type DataProp = {
  dataChart: ChartType[]
  dataSelect: SelectType[]
}

export const convertDataLogByDate = (
  data: SubjectLogGroupSummaryDto[],
  selectedDate: string
): DataProp => {
  const dataSelect: SelectType[] = data.map((item) => ({
    value: item.createDate,
    label: item.createDate,
  }))

  const selectedDay = data.find((item) => item.createDate === selectedDate)

  const dataChart: ChartType[] = selectedDay
    ? selectedDay.teachingSession.map((item) => ({
        name: item.subjectName,
        value1: item.firstLog.currentCount,
        value2: item.lastLog.currentCount,
        firstTime: item.firstLog.createTime,
        lastTime: item.lastLog.createTime,
      }))
    : []

  return {
    dataChart,
    dataSelect,
  }
}

export const convertDataLogByRoom = (
  data: StatisticalData[],
  selectedRoom: string
) => {
  const dataSelect: SelectType[] = data.map((item) => ({
    value: item.room,
    label: item.room,
  }))

  const selectRoom = data.find((item) => item.room === selectedRoom)

  const dataChart: ChartType[] = selectRoom
    ? selectRoom.createDate.map((item) => ({
        name: item.subjectname,
        value1: item.firstTime.currentCount,
        value2: item.lastTime.currentCount,
        firstTime: item.firstTime.dateTime,
        lastTime: item.lastTime.dateTime,
      }))
    : []

  return {
    dataChart,
    dataSelect,
  }
}

export const convertDataLogByTeacher = (
  data: TeacherLogInfo[],
  selectedTeacher: string
) => {
  const dataSelect: SelectType[] = data.map((item) => ({
    value: item.teacherName,
    label: item.teacherName,
  }))

  const selectTeacher = data.find(
    (item) => item.teacherName === selectedTeacher
  )

  const dataChart: ChartType[] = selectTeacher
    ? selectTeacher.subject.flatMap((subjectItem) =>
        subjectItem.createDate.map((session) => ({
          name: `${subjectItem.subjectName}`,
          value1: session.firstTime.currentCount,
          value2: session.lastTime.currentCount,
          firstTime: session.firstTime.dateTime,
          lastTime: session.lastTime.dateTime,
        }))
      )
    : []

  return {
    dataChart,
    dataSelect,
  }
}
