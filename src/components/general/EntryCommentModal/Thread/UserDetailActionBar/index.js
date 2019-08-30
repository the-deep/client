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

import styles from './styles.scss';

const propTypes = {
    userDetails: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    className: PropTypes.string,
};

const defaultProps = {
    className: undefined,
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
            textHistory,
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
                    <div className={styles.rightBottomContainer}>
                        <FormattedDate
                            value={modifiedAt}
                            mode="dd-MM-yyyy hh:mm aaa"
                        />
                        {isModified && (
                            <Button className={styles.editedButton}>
                                (edited)
                            </Button>
                        )}
                    </div>
                </div>
                <div className={styles.rightContainer}>
                    <DropdownMenu
                        className={className}
                        dropdownIcon="menuDots"
                        dropdownIconClassName={styles.icon}
                        closeOnClick
                    >
                        <Button
                            onClick={onEditClick}
                        >
                            Edit
                        </Button>
                    </DropdownMenu>
                </div>
            </div>
        );
    }
}
