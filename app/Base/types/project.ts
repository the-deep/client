import {
    CurrentProjectQuery,
} from '#generated/types';

export type Project = Omit<NonNullable<CurrentProjectQuery['project']>, '__typename'>;
