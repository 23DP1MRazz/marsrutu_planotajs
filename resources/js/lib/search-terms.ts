const searchSeparator = '||';

export function splitSearchTerms(search: string): string[] {
    return search
        .split(searchSeparator)
        .map((term) => term.trim())
        .filter(Boolean);
}

export function joinSearchTerms(terms: string[]): string {
    return terms.join(searchSeparator);
}
