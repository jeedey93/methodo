import { WeekSlot, WeekPeriod } from './WeekGrid'
import { SUBJECTS } from '@/lib/constants'

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']

const DEFAULT_PERIODS: WeekPeriod[] = [
  { id: 0, label: 'Période 1', startTime: '08:30', endTime: '09:15' },
  { id: 1, label: 'Période 2', startTime: '09:15', endTime: '10:00' },
  { id: 2, label: 'Période 3', startTime: '10:15', endTime: '11:00' },
  { id: 3, label: 'Période 4', startTime: '11:00', endTime: '11:45' },
  { id: 4, label: 'Période 5', startTime: '13:00', endTime: '13:45' },
  { id: 5, label: 'Période 6', startTime: '13:45', endTime: '14:30' },
]

interface WeekGridReadOnlyProps {
  slots: WeekSlot[]
  periods?: WeekPeriod[]
}

export function WeekGridReadOnly({ slots, periods }: WeekGridReadOnlyProps) {
  const activePeriods = periods && periods.length > 0 ? periods : DEFAULT_PERIODS

  const getSlot = (day: number, period: number) =>
    slots.find(s => s.day === day && s.period === period)

  const getSubjectLabel = (value: string) =>
    SUBJECTS.find(s => s.value === value)?.label ?? value

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="w-28 p-2 text-left text-xs font-medium text-stone-400" />
            {DAYS.map(d => (
              <th key={d} className="p-2 text-center text-xs font-semibold text-stone-600 border border-stone-200 bg-stone-50">
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {activePeriods.map((period, pi) => (
            <tr key={period.id}>
              <td className="p-2 text-center align-middle border border-stone-200 bg-stone-50">
                <p className="text-xs font-medium text-stone-700">{period.label}</p>
                {(period.startTime || period.endTime) && (
                  <p className="text-[10px] text-stone-400 mt-0.5">
                    {period.startTime}{period.startTime && period.endTime ? '–' : ''}{period.endTime}
                  </p>
                )}
              </td>
              {DAYS.map((_, di) => {
                const slot = getSlot(di, pi)
                return (
                  <td key={di}
                    className="border border-stone-200 p-2 align-top h-20 w-36"
                    style={{ backgroundColor: slot?.color ?? '#ffffff' }}>
                    {slot && (
                      <div className="space-y-0.5">
                        {slot.subject && (
                          <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide">
                            {getSubjectLabel(slot.subject)}
                          </p>
                        )}
                        {slot.title && (
                          <p className="text-xs font-medium text-stone-800 leading-tight">{slot.title}</p>
                        )}
                        {slot.notes && (
                          <p className="text-[10px] text-stone-500 leading-tight">{slot.notes}</p>
                        )}
                      </div>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
