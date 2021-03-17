import useRequest from '#utils/request';
import { notifyError } from '#utils/requestNotify';
import {
    MultiResponse,
    DatabaseEntityBase,
} from '#typings';
import _ts from '#ts';

const memberFieldQuery = {
    fields: ['id', 'displayName'],
};

export interface Member {
    id: number;
    displayName: string;
}

export const memberKeySelector = (d: Member) => d.id;
export const memberNameSelector = (d: Member) => d.displayName;

function useProjectmemberListQuery(projectId: DatabaseEntityBase['id']): [
    boolean,
    MultiResponse<Member> | undefined
] {
    const [
        pending,
        response,
    ] = useRequest<MultiResponse<Member>>({
        url: `server://v2/projects/${projectId}/members/`,
        method: 'GET',
        query: memberFieldQuery,
        autoTrigger: true,
        onFailure: notifyError(_ts('entryReview', 'reviewHeading')),
    });

    return [
        pending,
        response,
    ];
}

export default useProjectmemberListQuery;
