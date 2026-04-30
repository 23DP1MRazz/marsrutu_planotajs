const shortDateFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
});

export function formatShortDate(date: string | null | undefined): string {
    if (!date) {
        return '-';
    }

    const normalizedDate = date.includes('T')
        ? new Date(date)
        : new Date(`${date}T00:00:00`);

    if (Number.isNaN(normalizedDate.getTime())) {
        return '-';
    }

    return shortDateFormatter.format(normalizedDate);
}
