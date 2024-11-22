import { ProjectRoleTypeEnum } from '#generated/types';

export interface GeoAreaBounds {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
}

// FIXME: This is a hack for now. Need to fetch this from server later when
// work on server is completed
export const roleLevels: { [key in ProjectRoleTypeEnum]: number } = {
    PROJECT_OWNER: 100,
    ADMIN: 90,
    MEMBER: 80,
    READER: 70,
    READER_NON_CONFIDENTIAL: 60,
    UNKNOWN: 0,
};
