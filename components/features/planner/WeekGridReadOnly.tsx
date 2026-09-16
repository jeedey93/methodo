import { WeekSlot } from './WeekGrid'
import { SUBJECTS } from '@/lib/constants'

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']
const PERIODS = ['Période 1', 'Période 2', 'Période 3', 'Période 4', 'Période 5', 'Période 6']

interface WeekGridReadOnlyProps {
  slots: WeekSlot[]
}

export function WeekGridReadOnly({ slots }: WeekGridReadOnlyProps) {
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
          {PERIODS.map((period, pi) => (
            <tr key={pi}>
              <td className="p-2 text-xs font-medium text-stone-400 whitespace-nowrap border border-stone-200 bg-stone-50">
                {period}
              </td>
              {DAYS.map((_, di) => {
                const slot = getSlot(di, pi)
                return (
                  <td
                    key={di}
                    className="border border-stone-200 p-2 align-top h-20 w-36"
                    style={{ backgroundColor: slot?.color ?? '#ffffff' }}
                  >
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
