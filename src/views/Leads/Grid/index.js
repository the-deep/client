import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Masonry } from '@timilsinabishal/react-components';
import Button from '#rsca/Button';
import LoadingAnimation from '#rscv/LoadingAnimation';
import { isListEqual } from '#rsu/common';
import Modal from '#rscv/Modal';
import LeadPreview from '#components/leftpanel/LeadPreview';
import { iconNames } from '#constants';
import {
    leadsForProjectGridViewSelector,
} from '#redux';
import LeadItem from '../GridItem';
import styles from './styles.scss';

const propTypes = {
    loading: PropTypes.bool,
    onEndReached: PropTypes.func.isRequired,
    leads: PropTypes.arrayOf(PropTypes.object),
    view: PropTypes.string.isRequired,
    activeProject: PropTypes.number.isRequired,
    onSearchSimilarLead: PropTypes.func.isRequired,
    onRemoveLead: PropTypes.func.isRequired,
    onMarkProcessed: PropTypes.func.isRequired,
    onMarkPending: PropTypes.func.isRequired,
    setLeadPageActivePage: PropTypes.func.isRequired,
    emptyComponent: PropTypes.func.isRequired,
};

const defaultProps = {
    loading: false,
    leads: [],
};

const mapStateToProps = state => ({
    leads: leadsForProjectGridViewSelector(state),
});

const columnWidth = 300;
const columnGutter = 40;

@connect(mapStateToProps)
export default class LeadGrid extends React.Component {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    // simple comparision using id and their position to
    // check if we should recompute the layout
    static isItemsChanged = (a, b) => {
        const aKeys = a.map(r => r.id);
        const bKeys = b.map(r => r.id);

        return !isListEqual(aKeys, bKeys);
    };

    constructor(props) {
        super(props);

        this.state = {
            showPreview: false,
            activeLeadIndex: 0,
        };

        this.itemState = {
            width: columnWidth,
            minHeight: 295,
        };

        this.masonryRef = React.createRef();
    }

    componentDidMount() {
        // Rest grid when loading first time
        this.props.setLeadPageActivePage({ activePage: 1 });
    }

    // The lead data for grid may change when the user is in
    // table tab and changes the project, which will lead to
    // unnecessary recompute in Masonry while it is not displayed
    shouldComponentUpdate() {
        return this.props.view === 'grid';
    }

    handleLeadClick = (leadIndex) => {
        this.setState({
            showPreview: true,
            activeLeadIndex: leadIndex,
        });
    }

    hideLeadDetailPreview = () => {
        this.setState({
            showPreview: false,
        });
    }

    renderItem = ({ key, style, item, itemIndex }) => (
        <LeadItem
            key={key}
            activeProject={this.props.activeProject}
            style={style}
            lead={item}
            itemIndex={itemIndex}
            onRemoveLead={this.props.onRemoveLead}
            onSearchSimilarLead={this.props.onSearchSimilarLead}
            onMarkPending={this.props.onMarkPending}
            onMarkProcessed={this.props.onMarkProcessed}
            onLeadClick={this.handleLeadClick}
        />
    );

    render() {
        const { loading, onEndReached, leads, emptyComponent: EmptyComponent } = this.props;

        const previewLead = leads[this.state.activeLeadIndex];

        if (leads.length > 0) {
            return (
                <React.Fragment>
                    <div className={styles.leadGrids}>
                        <Masonry
                            ref={this.masonryRef}
                            items={leads}
                            renderItem={this.renderItem}
                            getItemHeight={LeadItem.getItemHeight}
                            containerClassName={styles.masonry}
                            alignCenter
                            loadingElement={
                                <LoadingAnimation large />
                            }
                            scrollAnchor={this.masonryRef}
                            columnWidth={columnWidth}
                            columnGutter={columnGutter}
                            isItemsChanged={LeadGrid.isItemsChanged}
                            isLoading={loading}
                            onInfiniteLoad={onEndReached}
                            state={this.itemState}
                            hasMore
                        />
                    </div>
                    {
                        this.state.showPreview &&
                        <Modal
                            className={styles.modal}
                            onClose={this.hideLeadDetailPreview}
                            closeOnOutsideClick
                            closeOnEscape
                        >
                            <LeadPreview
                                lead={previewLead}
                                showScreenshot={false}
                            />
                            <Button
                                className={styles.buttonClose}
                                onClick={this.hideLeadDetailPreview}
                                tabIndex="-1"
                                transparent
                                iconName={iconNames.close}
                            />
                        </Modal>
                    }
                </React.Fragment>
            );
        }
        return <EmptyComponent />;
    }
}
