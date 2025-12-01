import { useState, useEffect } from 'react';

interface BirthDatePickerProps {
    value: string
    onChange: (date: string) => void
}

export default function BirthDatePicker({ value, onChange }: BirthDatePickerProps) {
    const [day, setDay] = useState('')
    const [month, setMonth] = useState('')
    const [year, setYear] = useState('')

    useEffect(() => {
        if (value) {
            const date = new Date(value)
            if (!isNaN(date.getTime())) {
                setDay(date.getDate().toString())
                setMonth((date.getMonth() + 1).toString())
                setYear(date.getFullYear().toString())
            }
        }
    }, [value])

    const handleChange = (d: string, m: string, y: string) => {
        setDay(d)
        setMonth(m)
        setYear(y)

        if (d && m && y) {
            const formattedDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
            onChange(formattedDate);
        } else {
            onChange('')
        }
    }

    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = [
        'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
        'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
    ]
    const currentYear = new Date().getFullYear()
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

    const selectClass = "w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4E61F6] outline-none bg-white appearance-none cursor-pointer text-gray-700 text-sm";

    return (
        <div className="grid grid-cols-3 gap-2">
            <div className="relative">
                <select value={day} onChange={(e) => handleChange(e.target.value, month, year)}
                    className={selectClass}>
                    <option value="" disabled>Dzień</option>
                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
            </div>

            <div className="relative">
                <select value={month} onChange={(e) => handleChange(day, e.target.value, year)}
                    className={selectClass}>
                    <option value="" disabled>Miesiąc</option>
                    {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select>
            </div>

            <div className="relative">
                <select value={year} onChange={(e) => handleChange(day, month, e.target.value)}
                    className={selectClass}>
                    <option value="" disabled>Rok</option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
            </div>
        </div>
    )
}