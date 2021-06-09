import PropTypes from 'prop-types';
import React from 'react';
import {
    withRouter,
    NavLink,
} from 'react-router-dom';

import {
    reverseRoute,
    _cs,
} from '@togglecorp/fujs';

import List from '#rscv/List';
import DropdownMenu from '#rsca/DropdownMenu';
import Responsive from '#rscg/Responsive';

import { pathNames } from '#constants';
import _ts from '#ts';

import Cloak from '../../Cloak';
import styles from './styles.scss';

const NavItem = ({ itemKey, className, disabled, ...otherProps }) => (
    <NavLink
        activeClassName={styles.active}
        to={reverseRoute(pathNames[itemKey], otherProps)}
        className={`${className} ${disabled ? styles.disabled : ''}`}
        disabled={disabled}
        exact
    >
        { _ts('pageTitle', itemKey) }
    </NavLink>
);
NavItem.propTypes = {
    itemKey: PropTypes.string.isRequired,
    className: PropTypes.string,
    disabled: PropTypes.bool,
};
NavItem.defaultProps = {
    className: '',
    disabled: false,
};


const propTypes = {
    links: PropTypes.arrayOf(
        PropTypes.object,
    ),
    projectId: PropTypes.number,
    countryId: PropTypes.number,
    className: PropTypes.string,
    boundingClientRect: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: '',
    projectId: undefined,
    countryId: undefined,
    links: [],
    boundingClientRect: undefined,
};

class NavMenu extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keySelector = d => d.key

    static computeSize = (navLinks, menu, projectId, countryId) => {
        if (!menu) {
            return [];
        }

        const overflowMenuLinks = [];

        const cr = menu.getBoundingClientRect();
        const links = menu.getElementsByTagName('a');
        const overflow = menu.getElementsByTagName('div')[0];

        const linkWidths = [];
        const linkHrefs = {};
        let totalWidth = 0;

        for (let i = 0; i < links.length; i += 1) {
            links[i].style.display = 'inline-flex';
            const { width } = links[i].getBoundingClientRect();
            linkWidths.push(width);
            totalWidth += width;
            linkHrefs[links[i].getAttribute('href')] = true;
        }

        const visibleNavLinks = navLinks.filter((nl) => {
            const url = reverseRoute(pathNames[nl.key], { countryId, projectId });
            return linkHrefs[url];
        });

        if (menu.scrollWidth > Math.ceil(cr.width)) {
            totalWidth += overflow.getBoundingClientRect().width;

            linkWidths.reverse();

            let lastVisibleLinkIndex = links.length - 1;
            while (totalWidth > cr.width) {
                overflowMenuLinks.unshift(visibleNavLinks[lastVisibleLinkIndex]);

                totalWidth -= linkWidths[0];
                linkWidths.shift();

                links[lastVisibleLinkIndex].style.display = 'none';
                overflow.style.display = 'inline-flex';
                lastVisibleLinkIndex -= 1;

                if (lastVisibleLinkIndex < 0) {
                    break;
                }
            }
        } else {
            overflow.style.display = 'none';

            for (let i = 0; i < links.length; i += 1) {
                links[i].style.display = 'inline-flex';
            }
        }

        return overflowMenuLinks;
    }

    constructor(props) {
        super(props);

        const overflowMenuLinks = [];

        this.state = {
            navLinks: props.links,
            overflowMenuLinks,
        };
    }

    componentWillMount() {
        const overflowMenuLinks = NavMenu.computeSize(
            this.state.navLinks,
            this.menu,
            this.props.projectId,
            this.props.countryId,
        );
        this.setState({ overflowMenuLinks });
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.boundingClientRect !== nextProps.boundingClientRect) {
            const overflowMenuLinks = NavMenu.computeSize(
                nextProps.links,
                this.menu,
                nextProps.projectId,
                nextProps.countryId,
            );

            this.setState({
                navLinks: nextProps.links,
                overflowMenuLinks,
            });
        }
    }

    /*
    handleWindowResize = () => {
        const overflowMenuLinks = NavMenu.computeSize(this.state.navLinks, this.menu);
        this.setState({ overflowMenuLinks });
    }
    */

    renderNavItem = (key, item, className) => {
        const {
            projectId,
            countryId,
        } = this.props;

        return (
            <Cloak
                {...item}
                key={key}
                render={
                    <NavItem
                        itemKey={key}
                        className={className}
                        projectId={projectId}
                        countryId={countryId}
                    />
                }
            />
        );
    }

    renderNavbarItem = (key, item) => (
        this.renderNavItem(key, item, styles.menuItem)
    )

    renderOverflowMenuItem = (key, item) => (
        this.renderNavItem(key, item, styles.overflowMenuItem)
    )

    render() {
        const { className } = this.props;
        const {
            navLinks,
            overflowMenuLinks,
        } = this.state;

        return (
            <div
                ref={(el) => { this.menu = el; }}
                className={_cs(styles.navMenu, className)}
            >
                <List
                    data={navLinks}
                    modifier={this.renderNavbarItem}
                    keySelector={NavMenu.keySelector}
                />
                <DropdownMenu
                    iconName="overflowHorizontal"
                    className={styles.overflowMenu}
                    dropdownClassName={styles.navbarOverflowDropdown}
                    hideDropdownIcon
                    closeOnClick
                >
                    <List
                        data={overflowMenuLinks}
                        modifier={this.renderOverflowMenuItem}
                        keySelector={NavMenu.keySelector}
                    />
                </DropdownMenu>
            </div>
        );
    }
}

export default withRouter(Responsive(NavMenu));
