import PropTypes from 'prop-types';
import {
    _cs,
    isDefined,
    isNotDefined,
    listToGroupList,
} from '@togglecorp/fujs';
import { connect } from 'react-redux';
import React from 'react';

import FloatingContainer from '#rscv/FloatingContainer';
import {
    calcFloatPositionInMainWindow,
    defaultOffset,
    defaultLimit,
} from '#rsu/bounds';
import {
    projectIdFromRouteSelector,
} from '#redux';
import {
    RequestCoordinator,
    RequestClient,
    requestMethods,
} from '#request';

import Thread from './Thread';

import styles from './styles.scss';

const mapStateToProps = state => ({
    projectId: projectIdFromRouteSelector(state),
});

const propTypes = {
    className: PropTypes.string,
    closeModal: PropTypes.func,
    projectId: PropTypes.number, // eslint-disable-line react/no-unused-prop-types
};

const defaultProps = {
    className: undefined,
    projectId: undefined,
    closeModal: () => {},
};

const requests = {
    entryCommentsGet: {
        url: '/entry-comments/',
        method: requestMethods.GET,
        query: ({ props: { entryServerId } }) => ({
            entry: entryServerId,
        }),
        onMount: true,
        onPropsChanged: ['entryServerId'],
    },
    projectMembersGet: {
        url: '/project-memberships/',
        method: requestMethods.GET,
        query: ({ props: { projectId } }) => ({
            project: projectId,
            fields: ['member_name', 'member'],
        }),
        onMount: true,
        onPropsChanged: ['project'],
        onSuccess: ({ response }) => {
            console.warn(response);
        },
    },
};

@connect(mapStateToProps)
@RequestCoordinator
@RequestClient(requests)
export default class EntryCommentModal extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getCommentsByThreads = (allComments) => {
        const parentList = allComments.filter(c => isNotDefined(c.parent));
        const childrenList = allComments.filter(c => isDefined(c.parent));

        const childrenGroup = listToGroupList(
            childrenList,
            d => d.parent,
        );

        const threads = parentList.map(p => ({
            parent: p,
            children: childrenGroup[p.id],
        }));
        return threads;
    }

    handleInvalidate = (container) => {
        // Note: pass through prop
        // eslint-disable-next-line react/prop-types
        const { parentBCR } = this.props;

        const contentRect = container.getBoundingClientRect();

        const optionsContainerPosition = (
            calcFloatPositionInMainWindow({
                parentRect: parentBCR,
                contentRect,
                defaultOffset,
                limit: {
                    ...defaultLimit,
                    minW: 240,
                    maxW: 360,
                },
            })
        );

        return optionsContainerPosition;
    }

    render() {
        const {
            className,
            entryServerId,
            closeModal,
            entryCommentsGet: {
                response: {
                    results: allComments = [],
                } = {},
                pending: commentsPending,
            },
            projectMembersGet: {
                response: {
                    results: members = [],
                } = {},
                pending: membersPending,
            },
        } = this.props;

        if (commentsPending || membersPending) {
            return null;
        }

        const comments = this.getCommentsByThreads(allComments)[0];
        const membersMap = members.map(m => ({
            key: m.member,
            name: m.memberName,
        }));

        return (
            <FloatingContainer
                className={_cs(className, styles.container)}
                onInvalidate={this.handleInvalidate}
                closeOnEscape
                onClose={closeModal}
                focusTrap
                showHaze
            >
                <Thread
                    comments={comments}
                    entryId={entryServerId}
                    members={membersMap}
                />
            </FloatingContainer>
        );
    }
}
