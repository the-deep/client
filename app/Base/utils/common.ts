// eslint-disable-next-line import/prefer-default-export
export function find<T>(list: T[], selector: (value: T, index: number, obj: T[]) => boolean) {
    const index = list.findIndex(selector);
    if (index === -1) {
        return {
            index: undefined,
            value: undefined,
        };
    }
    return {
        index,
        value: list[index] as T,
    };
}
