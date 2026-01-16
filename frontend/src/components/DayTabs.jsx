function DayTabs({ days = [], currentDay = 0, onDayChange }) {
    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mb-1">
            {days.map((day, index) => (
                <button
                    key={index}
                    onClick={() => onDayChange(index)}
                    className={`
            flex-shrink-0 px-3 sm:px-4 py-2 rounded-lg font-medium text-sm
            transition-all duration-200 border
            ${currentDay === index
                            ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                        }
          `}
                >
                    <span className="whitespace-nowrap">Day {day.day}</span>
                    <span className={`block text-xs ${currentDay === index ? 'text-primary-100' : 'text-slate-400'}`}>
                        {day.date}
                    </span>
                </button>
            ))}
        </div>
    )
}

export default DayTabs
