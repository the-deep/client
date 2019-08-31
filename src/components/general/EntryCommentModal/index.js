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
    entryServerId: PropTypes.number,
    entryCommentsGet: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    projectMembersGet: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: undefined,
    projectId: undefined,
    entryServerId: undefined,
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
        onSuccess: ({ params: { onCommentsGet }, response }) => {
            onCommentsGet(response.results);
        },
        onPropsChanged: ['entryServerId'],
        schemaName: 'entryComments',
    },
    projectMembersGet: {
        url: ({ props: { projectId } }) => `/projects/${projectId}/members/`,
        method: requestMethods.GET,
        query: {
            fields: ['id', 'display_name'],
        },
        onMount: true,
        onPropsChanged: ['project'],
        schemaName: 'projectMembers',
    },
};

@connect(mapStateToProps)
@RequestCoordinator
@RequestClient(requests)
export default class EntryCommentModal extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const {
            entryCommentsGet,
        } = this.props;

        entryCommentsGet.setDefaultParams({
            onCommentsGet: this.handleCommentsGet,
        });

        this.state = {
            comments: [],
        };
    }

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

    handleCommentsGet = (comments) => {
        this.setState({ comments });
    }

    handleEditComment = (commentId, values, isParent) => {
        const { comments } = this.state;
        const newComments = comments.filter(c => c.id !== commentId);
        newComments.push(values);
        this.setState({ comments: newComments });
    }

    handleDeleteComment = (commentId, isParent) => {
        const { comments } = this.state;
        const newComments = comments.filter(c => c.id !== commentId);
        this.setState({ comments: newComments });
    }

    handleCommentAdd = (comment) => {
        const { comments } = this.state;

        const newComments = [
            ...comments,
            comment,
        ];

        this.setState({ comments: newComments });
    }

    render() {
        const {
            className,
            entryServerId,
            closeModal,
            entryCommentsGet: {
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
        const {
            comments: allComments,
        } = this.state;

        const comments = this.getCommentsByThreads(allComments)[0];

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
                    members={members}
                    onAdd={this.handleCommentAdd}
                    onEdit={this.handleEditComment}
                    onDelete={this.handleDeleteComment}
                />
            </FloatingContainer>
        );
    }
}
