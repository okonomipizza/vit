import React, { JSX, ReactNode, useState } from "react";

interface DraggableItemProps {
	id: string | number;
	fromArea: string;
	onDragStart?: (
		e: React.DragEvent<HTMLDivElement>,
		id: string | number,
		fromArea: string,
	) => void;
	children: ReactNode;
}

export function DraggableItem({
	id,
	fromArea,
	onDragStart,
	children,
}: DraggableItemProps) {
	const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
		e.dataTransfer.effectAllowed = "move";
		e.dataTransfer.setData("itemId", id.toString());
		e.dataTransfer.setData("fromArea", fromArea);
		if (onDragStart) onDragStart(e, id, fromArea);
	};

	return (
		<div draggable onDragStart={handleDragStart} className="cursor-move">
			{children}
		</div>
	);
}

interface DropZoneItemProps {
	areaId: string;
	onDrop?: (itemId: string, fromArea: string, toArea: string) => void;
	children: ReactNode;
    className?: string;
}

export function DropZone({ areaId, onDrop, children, className = "" }: DropZoneItemProps) {
	const [isDragOver, setIsDragOver] = useState(false);

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";
	};

	const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragOver(true);
	};

	const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		// 子要素への移動でもイベントが発火するため、実際に要素から出たかチェック
		const rect = e.currentTarget.getBoundingClientRect();
		const x = e.clientX;
		const y = e.clientY;

		if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
			setIsDragOver(false);
		}
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragOver(false);

		const itemId = e.dataTransfer.getData("itemId");
		const fromArea = e.dataTransfer.getData("fromArea");
		if (onDrop) onDrop(itemId, areaId, fromArea);
	};

	return (
		<div
			onDragOver={handleDragOver}
			onDragEnter={handleDragEnter}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
            className=
            {`${className} ${isDragOver ? "bg-blue-500 bg-opacity-30" : ""} transition-colors duration-100`}
		>
			{children}
		</div>
	);
}
