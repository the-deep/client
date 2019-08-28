import PropTypes from 'prop-types';
import {
    _cs,
    isDefined,
    isNotDefined,
    listToGroupList,
} from '@togglecorp/fujs';
import React from 'react';

import FloatingContainer from '#rscv/FloatingContainer';
import {
    calcFloatPositionInMainWindow,
    defaultOffset,
    defaultLimit,
} from '#rsu/bounds';
import {
    RequestCoordinator,
    RequestClient,
    requestMethods,
} from '#request';

import Thread from './Thread';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    closeModal: PropTypes.func,
};

const defaultProps = {
    className: undefined,
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
        onSuccess: ({ response }) => {
            console.warn(response);
        },
    },
};

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
            closeModal,
            entryCommentsGet: {
                response: {
                    results: allComments = [],
                } = {},
                pending,
            },
        } = this.props;

        if (pending) {
            return null;
        }

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
                <Thread comments={comments} />
            </FloatingContainer>
        );
    }
}
