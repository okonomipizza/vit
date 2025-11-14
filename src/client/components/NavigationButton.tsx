export default function NavigationButton({
    direction,
    onClick,
    show,
}: {
    direction: "prev" | "next";
    onClick: (e: React.MouseEvent) => void;
    show: boolean;
}) {
    if (!show) return null;

    const isPrev = direction === "prev";
    const points = isPrev ? "15 18 9 12 15 6" : "9 18 15 12 9 6";
    const className = `absolute ${isPrev ? "left-4" : "right-4"} top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full p-3 hover:bg-opacity-70`;

    return (
        <button
            type="button"
            onClick={onClick}
            className={className}
            title={`${direction} image`}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <polyline points={points} />
            </svg>
        </button>
    );
}
