import { useEffect, useState } from "react";
import Sidebar from "./sidebar";
import { Moon, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { DirectoryItem } from "../server/index.ts";
import { DraggableItem } from "./draggable.tsx";

interface ApiResponse {
	success: boolean;
	count: number;
	directory: DirectoryItem;
}

function ImageDisplay({
	imageId,
	imageName,
	onClick,
}: { imageId: string; imageName: string; onClick: () => void }) {
	return (
		<div className="group" onClick={onClick}>
			<div className="aspect-square overflow-hidden rounded-lg shadow-md hover:shadow-2xl transition-all duration-300">
				<img
					src={`/api/images/${imageId}`}
					alt={imageName}
					className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
					loading="lazy"
				/>
			</div>
			<div className="py-2 px-3">
				<p
					className="text-sm text-gray-800 text-center truncate drop-shadow-sm"
					title={imageName}
				>
					{imageName}
				</p>
			</div>
		</div>
	);
}

function ImageModal({
	imageId,
	imageName,
	onClose,
	onNext,
	onPrev,
	hasNext,
	hasPrev,
}: {
	imageId: string;
	imageName: string;
	onClose: () => void;
	onNext: () => void;
	onPrev: () => void;
	hasNext: boolean;
	hasPrev: boolean;
}) {
	useEffect(() => {
		const handleKeyboard = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
			} else if (e.key === "ArrowRight" && hasNext) {
				onNext();
			} else if (e.key === "ArrowLeft" && hasPrev) {
				onPrev();
			}
		};
		window.addEventListener("keydown", handleKeyboard);
		return () => window.removeEventListener("keydown", handleKeyboard);
	}, [onClose, onNext, onPrev, hasNext, hasPrev]);

	return (
		<div
			className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
			onClick={onClose}
		>
			<button
				type="button"
				onClick={onClose}
				className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
				title="Close (ESC)"
			>
				<X size={32} />
			</button>
			{hasPrev && (
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						onPrev();
					}}
					className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full p-3 hover:bg-opacity-70"
					title="prev image"
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
						<polyline points="15 18 9 12 15 6" />
					</svg>
				</button>
			)}
			{hasNext && (
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						onNext();
					}}
					className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full p-3 hover:bg-opacity-70"
					title="next image"
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
						<polyline points="9 18 15 12 9 6" />
					</svg>
				</button>
			)}
			<div
				className="max-w-7xl max-h-full flex flex-col items-center"
				onClick={(e) => e.stopPropagation()}
			>
				<img
					src={`/api/images/${imageId}`}
					alt={imageName}
					className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
				/>
			</div>
		</div>
	);
}

function getDirectImages(dir: DirectoryItem): DirectoryItem[] {
	if (dir.type === "folder" && dir.children) {
		return dir.children.filter((child) => child.type === "image");
	}
	return [];
}

function findDirectoryById(
	dir: DirectoryItem,
	targetId: string,
): DirectoryItem | null {
	if (dir.id === targetId) {
		return dir;
	}

	if (dir.children) {
		for (const child of dir.children) {
			const found = findDirectoryById(child, targetId);
			if (found) return found;
		}
	}

	return null;
}

function App() {
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);
	const [directory, setDirectory] = useState<DirectoryItem | undefined>(
		undefined,
	);
	const [selectedDirId, setSelectedDirId] = useState<string | null>(null);
	const [enlargedImageIndex, setEnlargedImageIndex] = useState<number | null>(
		null,
	);

	const toggleSidebar = (): void => {
		setIsSidebarOpen(!isSidebarOpen);
	};

	const handleDirectorySelect = (dirId: string) => {
		setSelectedDirId(dirId);
	};

	const handleImageClick = (imageIndex: number) => {
		setEnlargedImageIndex(imageIndex);
	};

	const handleCloseModal = () => {
		setEnlargedImageIndex(null);
	};

	const handleNextImage = () => {
		if (
			enlargedImageIndex !== null &&
			enlargedImageIndex < displayImages.length - 1
		) {
			setEnlargedImageIndex(enlargedImageIndex + 1);
		}
	};

	const handlePrevImage = () => {
		if (enlargedImageIndex !== null && enlargedImageIndex > 0) {
			setEnlargedImageIndex(enlargedImageIndex - 1);
		}
	};

	useEffect(() => {
		fetch("/api/images")
			.then((res) => res.json())
			.then((data: ApiResponse) => {
				console.log(data.directory);
				setDirectory(data.directory);
				setSelectedDirId(data.directory.id);
			})
			.catch((err) => {
				console.error("Failed to fetch data:", err);
			});
	}, []);

	const displayImages = (() => {
		if (!directory || !selectedDirId) return [];

		const selectedDir = findDirectoryById(directory, selectedDirId);
		if (!selectedDir) return [];

		return getDirectImages(selectedDir);
	})();

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-200 to-gray-100 text-blue-500">
			<div className="flex flex-col h-screen">
				{/* topbar */}
				<div
					className="h-14 bg-gray-300 transition-all duration-300 ease-in-out"
					style={{
						width: isSidebarOpen ? "298px" : "0px",
					}}
				>
					<div className="flex items-center w-full h-full">
						<button
							type="button"
							onClick={toggleSidebar}
							className="ml-4 mr-4"
							title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
						>
							{isSidebarOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
						</button>
						<div>
							<b>Vit</b>
						</div>
						<div className="absolute top-4 right-4">
							<button type="button">
								<Moon />
							</button>
						</div>
					</div>
				</div>
				<div className="flex-1 overflow-hidden">
					<Sidebar
						isOpen={isSidebarOpen}
						directory={directory}
						handleDirectorySelect={handleDirectorySelect}
					/>

					<div
						className="h-full overflow-y-auto p-6 transition-all duration-300 ease-in-out"
						style={{
							marginLeft: isSidebarOpen ? "298px" : "0px",
						}}
					>
						{displayImages.length > 0 ? (
							<div>
								<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
									{displayImages.map((image, index) => (
										<DraggableItem
											key={image.id}
											id={image.id}
											fromArea="main-content"
										>
											<ImageDisplay
												key={image.id}
												imageId={image.id}
												imageName={image.name}
												onClick={() => handleImageClick(index)}
											/>
										</DraggableItem>
									))}
								</div>
							</div>
						) : (
							<div className="text-center text-gray-400 mt-12">
								<p className="text-xl">No images in this directory</p>
							</div>
						)}
					</div>
				</div>
			</div>
			{enlargedImageIndex !== null && displayImages[enlargedImageIndex] && (
				<ImageModal
					imageId={displayImages[enlargedImageIndex].id}
					imageName={displayImages[enlargedImageIndex].name}
					onClose={handleCloseModal}
					onNext={handleNextImage}
					onPrev={handlePrevImage}
					hasNext={enlargedImageIndex < displayImages.length - 1}
					hasPrev={enlargedImageIndex > 0}
				/>
			)}
		</div>
	);
}

export default App;
