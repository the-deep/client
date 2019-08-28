import React from 'react';
import PropTypes from 'prop-types';
import { _cs } from '@togglecorp/fujs';

import DisplayPicture from '#components/viewer/DisplayPicture';
import {
    RequestCoordinator,
    RequestClient,
    requestMethods,
} from '#request';

import styles from './styles.scss';


const propTypes = {
    comments: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    className: PropTypes.string,
};

const defaultProps = {
    className: undefined,
    comments: {},
};

const requests = {
};

@RequestClient(requests)
export default class EntryCommentThread extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className,
            comments: {
                parent,
                children,
            },
        } = this.props;
        console.warn('comments from thread', this.props.comments);

        return (
            <div className={_cs(className, styles.thread)}>
                <div className={styles.parent}>
                    <DisplayPicture
                        className={styles.displayPicture}
                        url={parent.createdByDetail.displayPicture}
                    />
                </div>
            </div>
        );
    }
}
