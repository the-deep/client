import {
    CurrentFrameworkQuery,
} from '#generated/types';

export type Framework = Omit<NonNullable<CurrentFrameworkQuery['analysisFramework']>, '__typename'>;
