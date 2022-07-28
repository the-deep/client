import { OrganigramDatum } from '#types/newAnalyticalFramework';

// FIXME: move this to utils
// eslint-disable-next-line import/prefer-default-export
export function getOrganigramFlatOptions(
    data?: OrganigramDatum,
    prefix?: string,
): Omit<OrganigramDatum, 'children'>[] {
    if (!data) {
        return [];
    }
    const { children, ...values } = data;
    const label = `${prefix ? `${prefix}/` : ''}${values.label}`;

    const childrenValues = children?.flatMap((v) => getOrganigramFlatOptions(v, label)) ?? [];
    return [
        { ...values, label },
        ...childrenValues,
    ];
}
