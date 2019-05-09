import PropTypes from 'prop-types';
import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { connect } from 'react-redux';

import {
    themes,
    setTheme,
} from '#theme';
import _ts from '#ts';

import Button from '#rsca/Button';
import DropdownMenu from '#rsca/DropdownMenu';
import List from '#rscv/List';
import Icon from '#rscg/Icon';

import {
    currentThemeIdSelector,
    setCurrentThemeAction,
} from '#redux';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

const mapStateToProps = state => ({
    currentThemeId: currentThemeIdSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setCurrentTheme: params => dispatch(setCurrentThemeAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class ThemeMenu extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getRendererParams = themeKey => ({
        onClickParams: {
            themeKey,
        },
        children: themes[themeKey].title,
        onClick: this.handleThemeButtonClick,
        className: _cs(
            styles.item,
            this.props.currentThemeId === themeKey && styles.active,
        ),
        transparent: true,
    })

    handleThemeButtonClick = ({ params }) => {
        const { setCurrentTheme } = this.props;

        setCurrentTheme(params.themeKey);
        // setTheme(params.themeKey);
    }

    render() {
        const { className } = this.props;
        const themeKeys = Object.keys(themes);

        return (
            <DropdownMenu
                className={className}
                dropdownClassName={styles.themeSelectionDropdown}
                dropdownIcon="colorPallete"
                dropdownIconClassName={styles.icon}
            >
                <List
                    data={themeKeys}
                    renderer={Button}
                    rendererParams={this.getRendererParams}
                />
            </DropdownMenu>
        );
    }
}
