import { useRequest } from '#utils/request';
import { notifyError } from '#utils/requestNotify';
import {
    MultiResponse,
    DatabaseEntityBase,
    Membership,
} from '#typings';
import _ts from '#ts';

const memberFieldQuery = {
    fields: ['member', 'member_name'],
};

export const memberKeySelector = (d: Membership) => d.member;
export const memberNameSelector = (d:Membership) => d.memberName;

function useProjectMemberListQuery(projectId: DatabaseEntityBase['id']): [
    boolean,
    MultiResponse<Membership> | undefined
] {
    const {
        pending,
        response,
    } = useRequest<MultiResponse<Membership>>({
        url: `server://v2/projects/${projectId}/project-memberships/`,
        method: 'GET',
        query: memberFieldQuery,
        onFailure: notifyError(_ts('entryReview', 'projectMemberList')),
    });

    return [
        pending,
        response,
    ];
}

export default useProjectMemberListQuery;
