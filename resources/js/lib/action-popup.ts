export type PopupPosition = {
    top: number;
    left: number;
};

export type ActionPopup = {
    id: number;
    message: string;
    position?: PopupPosition;
    visible: boolean;
};

export function popupPositionFromElement(element: HTMLElement): PopupPosition {
    const rect = element.getBoundingClientRect();
    const popupWidth = Math.min(320, window.innerWidth - 32);
    const hasRoomOnRight = window.innerWidth - rect.right >= popupWidth + 16;
    const left = hasRoomOnRight
        ? rect.right + 8
        : Math.max(16, rect.left - popupWidth - 200);

    return {
        left,
        top: Math.min(
            Math.max(40, rect.top + rect.height / 2),
            window.innerHeight - 40,
        ),
    };
}
