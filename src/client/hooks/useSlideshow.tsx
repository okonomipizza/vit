import { useEffect } from "react";
import { SLIDESHOW_INTERVAL } from "../constants/layout";

export function useSlideshow(
	isActive: boolean,
	currentIndex: number | null,
	onNext: () => void,
) {
	useEffect(() => {
		if (!isActive || currentIndex === null) return;

		const timer = setTimeout(onNext, SLIDESHOW_INTERVAL);
		return () => clearTimeout(timer);
	}, [isActive, currentIndex, onNext]);
}
