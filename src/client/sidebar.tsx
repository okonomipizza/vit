import React, { JSX, ReactNode, useState } from "react";
import { DirectoryItem } from "../server/index.ts";

import { FolderOpen, FolderClosed, Dot } from "lucide-react";
import { DropZone } from "./draggable.tsx";

interface SidebarProps {
	isOpen: boolean;
	directory: DirectoryItem | undefined;
	handleDirectorySelect: (directory: string) => void;
}

export default function Sidebar({
	isOpen,
	directory,
	handleDirectorySelect,
}: SidebarProps) {
	const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
		new Set(),
	);

	const toggleFolder = (folderId: string) => {
		setExpandedFolders((prev) => {
			const next = new Set(prev);
			if (next.has(folderId)) {
				next.delete(folderId);
			} else {
				next.add(folderId);
			}
			return next;
		});
	};

	const handleFolderClick = (folderId: string, e: React.MouseEvent) => {
		e.stopPropagation();
		toggleFolder(folderId);
		handleDirectorySelect(folderId);
	};

	const handleDrop = (itemId: string, toArea: string, fromArea: string) => {
		console.log("image ID:", itemId);
		console.log("folder ID:", toArea);
	};

	const renderDirectory = (item: DirectoryItem, level = 0): JSX.Element => {
		const isExpanded = expandedFolders.has(item.id);
		const indent = level * 16;

		if (item.type === "folder") {
			return (
				<div key={item.id}>
					<DropZone areaId={item.id} onDrop={handleDrop} className="rounded">
						<div
							className="flex items-center cursor-pointer hover:bg-gray-400 p-2 rounded transition-colors"
							style={{ paddingLeft: `${indent}px` }}
							onClick={(e) => {
								handleFolderClick(item.id, e);
							}}
						>
							<span className="mr-2 text-lg">
								{isExpanded ? (
									<FolderOpen size={20} />
								) : (
									<FolderClosed size={20} />
								)}
							</span>
							<span className="text-lg text-blue-500">{item.name}</span>
						</div>
					</DropZone>
					{isExpanded && item.children && item.children.length > 0 && (
						<div>
							{item.children.map((child) => renderDirectory(child, level + 1))}
						</div>
					)}
				</div>
			);
		}
		return (
			<div
				key={item.id}
				draggable
				onDragStart={(e) => {
					e.dataTransfer.effectAllowed = "move";
					e.dataTransfer.setData("imageId", item.id); // UUID
					e.dataTransfer.setData("imageName", item.name);
				}}
				className="flex items-center cursor-move hover:bg-gray-400 p-2 rounded transition-colors"
				style={{ paddingLeft: `${indent}px` }}
			>
				<span className="mr-2 text-lg">
					<Dot size={20} />
				</span>
				<span className="text-lg truncate">{item.name}</span>
			</div>
		);
	};

	return (
		<div
			className={`fixed left-0 top-12 p-4 h-full bg-gray-300 text-blue-500 overflow-y-auto transition-transform duration-300 ease-in-out ${
				isOpen ? "translate-x-0" : "-translate-x-full"
			}`}
            style={{width: "298px"}}
		>
			{directory?.children && directory.children.length > 0 ? (
				<div
					className="flex flex-col h-full text-lg border border-transparent hover:border-sky-500 transition-all duration-500 ease-in-out"
					onClick={(e) => {
						handleFolderClick(directory.id, e);
					}}
				>
					<h2>{directory.name}</h2>

					<div>
						{directory.children.map((child) => renderDirectory(child, 0))}
					</div>
				</div>
			) : (
				<div className="text-white text-sm">No data</div>
			)}
		</div>
	);
}
