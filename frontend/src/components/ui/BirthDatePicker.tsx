import type {BirthDatePickerProps} from "../../types/ui.types.ts";
import {useBirthdayPicker} from "../../hooks/useBirthdayPicker.ts";

export default function BirthDatePicker({value, onChange}: BirthDatePickerProps) {
    const {
        day,
        month,
        year,
        handleChange,
        days,
        months,
        years,
        selectClass
    } = useBirthdayPicker({value, onChange});
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
    );
}