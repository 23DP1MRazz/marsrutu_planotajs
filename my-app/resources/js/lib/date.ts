const shortDateFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
});

export function formatShortDate(date: string | null | undefined): string {
    if (!date) {
        return '-';
    }

    return shortDateFormatter.format(new Date(`${date}T00:00:00`));
}
