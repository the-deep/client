// eslint-disable-next-line import/prefer-default-export
export function breadcrumb(...args: string[]) {
    return args.filter(arg => arg).join(' › ');
}

