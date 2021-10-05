// eslint-disable-next-line import/prefer-default-export
export function convertDateToIsoDateTime(dateString: string | undefined) {
    if (!dateString) {
        return undefined;
    }
    const date = new Date(dateString);
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);

    return date.toISOString();
}
