import PropTypes from 'prop-types';
import React from 'react';

import ModalHeader from '#rscv/Modal/Header';
import Wizard from '#rscv/Wizard';

import _ts from '#ts';
import _cs from '#cs';

import FileTypeSelectionPage from './FileTypeSelectionPage';
import AttributesPage from './AttributesPage';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    mimeType: PropTypes.string,
    lead: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setTabularBook: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
    onCancel: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    mimeType: '',
};


// TODO: It might be better to delete the temporary book
// from server when cancelled.
export default class LeadTabular extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    state = { bookId: undefined, fileType: undefined }

    handleBookIdChange = (bookId, fileType, callback) => {
        this.setState({ bookId, fileType }, callback);
    }

    handleComplete = () => {
        const { onCancel, setTabularBook } = this.props;
        const { bookId } = this.state;

        if (!bookId) {
            onCancel();
        } else {
            setTabularBook(bookId);
        }
    }

    render() {
        const {
            className,
            mimeType,
            onCancel,
            lead,
        } = this.props;

        const { bookId, fileType } = this.state;

        return (
            <div className={_cs(className, styles.leadTabular)}>
                <ModalHeader title={_ts('addLeads.tabular', 'title')} />
                <Wizard className={styles.wizard}>
                    <FileTypeSelectionPage
                        lead={lead}
                        mimeType={mimeType}
                        onComplete={this.handleBookIdChange}
                        onCancel={onCancel}
                    />
                    <AttributesPage
                        bookId={bookId}
                        onComplete={this.handleComplete}
                        defaultFileType={fileType}
                        onCancel={onCancel}
                    />
                </Wizard>
            </div>
        );
    }
}
