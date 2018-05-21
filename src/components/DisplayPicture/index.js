import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import ReactSVG from 'react-svg';

import {
    activeUserSelector,
    currentUserInformationSelector,
} from '../../redux';
import defaultUser from '../../resources/img/default-user.svg';

import { InternalGallery } from '../DeepGallery';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    userInformation: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    activeUser: PropTypes.shape({
        userId: PropTypes.number,
    }),
};

const defaultProps = {
    className: '',
    activeUser: {},
    userInformation: {},
};

const mapStateToProps = state => ({
    activeUser: activeUserSelector(state),
    userInformation: currentUserInformationSelector(state),
});

@connect(mapStateToProps)
export default class DisplayPicture extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className,
            activeUser,
            userInformation,
        } = this.props;

        const displayPicture = (
            userInformation.displayPicture ||
            activeUser.displayPicture
        );

        if (displayPicture) {
            const classNames = `${className} ${styles.displayPicture}`;
            return (
                <InternalGallery
                    className={classNames}
                    galleryId={displayPicture}
                />
            );
        }
        const classNames = `${className} ${styles.defaultUser}`;
        return (
            <ReactSVG
                svgClassName={classNames}
                path={defaultUser}
            />
        );
    }
}
