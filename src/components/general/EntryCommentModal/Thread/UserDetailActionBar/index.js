import React from 'react';
import PropTypes from 'prop-types';
import { _cs } from '@togglecorp/fujs';

import DisplayPicture from '#components/viewer/DisplayPicture';
import FormattedDate from '#rscv/FormattedDate';
import Button from '#rsca/Button';
import DropdownMenu from '#rsca/DropdownMenu';
import {
    RequestClient,
} from '#request';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    userDetails: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    className: PropTypes.string,
    onEditClick: PropTypes.func.isRequired,
    onDeleteClick: PropTypes.func.isRequired,
    onResolveClick: PropTypes.func.isRequired,
    textHistory: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    isParent: PropTypes.bool,
};

const defaultProps = {
    className: undefined,
    isParent: false,
    userDetails: {},
};

const requests = {
};

@RequestClient(requests)
export default class UserDetailActionBar extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className,
            userDetails: {
                displayPicture,
                modifiedAt = new Date(),
                name,
            },
            onEditClick,
            onDeleteClick,
            onResolveClick,
            textHistory,
            isParent,
        } = this.props;

        const isModified = textHistory.length > 1;

        return (
            <div className={styles.userDetailActionBar}>
                <div className={styles.leftContainer}>
                    <DisplayPicture
                        className={_cs(styles.displayPicture, className)}
                        url={displayPicture}
                    />
                </div>
                <div className={styles.midContainer}>
                    <div className={styles.userName}>
                        {name}
                    </div>
                    <div className={styles.midBottomContainer}>
                        <FormattedDate
                            className={styles.date}
                            value={modifiedAt}
                            mode="dd-MM-yyyy hh:mm aaa"
                        />
                        {isModified && (
                            <Button className={styles.editedButton}>
                                {_ts('entryComments', 'editedFlagLabel')}
                            </Button>
                        )}
                    </div>
                </div>
                <div className={styles.rightContainer}>
                    <DropdownMenu
                        className={styles.dropdown}
                        dropdownIcon="menuDots"
                        dropdownClassName={styles.dropdownContainer}
                        dropdownIconClassName={styles.icon}
                        closeOnClick
                    >
                        {isParent && (
                            <Button
                                className={styles.button}
                                onClick={onResolveClick}
                            >
                                {_ts('entryComments', 'resolveLabel')}
                            </Button>
                        )}
                        <Button
                            className={styles.button}
                            onClick={onEditClick}
                        >
                            {_ts('entryComments', 'editLabel')}
                        </Button>
                        <Button
                            className={styles.button}
                            onClick={onDeleteClick}
                        >
                            {_ts('entryComments', 'deleteLabel')}
                        </Button>
                    </DropdownMenu>
                </div>
            </div>
        );
    }
}
