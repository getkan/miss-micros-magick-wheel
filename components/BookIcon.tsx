interface Props {
    className?: string,
    percent?: number
}

const defaultSize = 256

export default function BookIcon({className = "", percent = 1}: Props){
    const clampedPercent = Math.max(0, Math.min(1, percent))
    const height = Math.round(defaultSize * clampedPercent)
    const width = Math.round(defaultSize * clampedPercent)
    const opacity = 1- clampedPercent
    const speedLineThickness = Math.max(2, Math.round(16 * clampedPercent))

    const speedLines = [
        { left: '-15%', top: '25%', width: '15%'},
        { left: '-25%', top: '50%', transform: 'translateY(-50%)', width: '15%'},
        { left: '-15%', bottom: '25%', width: '15%' }
    ]

    return (
        <div className={`${className} relative inline-block text-white`} style={{ opacity }}>
            <div className="pointer-events-none absolute inset-0 z-10">
                {speedLines.map((line, index) => (
                    <span
                        key={`${line.left}-${line.top ?? line.bottom ?? index}`}
                        aria-hidden="true"
                        className="absolute block rounded-full bg-current"
                        style={{
                            left: line.left,
                            top: line.top,
                            bottom: line.bottom,
                            transform: line.transform,
                            width: line.width,
                            height: speedLineThickness,
                            zIndex: 1
                        }}
                    />
                ))}
            </div>

            <svg
                aria-hidden="true"
                height={height}
                viewBox="0 0 24 24"
                width={width}
                fill="#0b0e14"
                xmlns="http://www.w3.org/2000/svg"
                className="relative z-20 block"
            >
                <path
                    d="M4 19V6.2C4 5.0799 4 4.51984 4.21799 4.09202C4.40973 3.71569 4.71569 3.40973 5.09202 3.21799C5.51984 3 6.0799 3 7.2 3H16.8C17.9201 3 18.4802 3 18.908 3.21799C19.2843 3.40973 19.5903 3.71569 19.782 4.09202C20 4.51984 20 5.0799 20 6.2V17H6C4.89543 17 4 17.8954 4 19ZM4 19C4 20.1046 4.89543 21 6 21H20M9 7H15M9 11H15M19 17V21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </div>
    )
}