// eslint-disable-next-line import/prefer-default-export
export function breadcrumb(...args: string[]) {
    return args.filter(arg => arg).join(' › ');
}

type MonthNameMap = {
    [key: number]: string;
}

export const shortMonthNamesMap: MonthNameMap = {
    0: 'Jan',
    1: 'Feb',
    2: 'Mar',
    3: 'Apr',
    4: 'May',
    5: 'Jun',
    6: 'Jul',
    7: 'Aug',
    8: 'Sept',
    9: 'Oct',
    10: 'Nov',
    11: 'Dec',
};
