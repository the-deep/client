import PropTypes from 'prop-types';
import React from 'react';

import Faram, { requiredCondition } from '#rscg/Faram';
import ModalFooter from '#rscv/Modal/Footer';
import ModalBody from '#rscv/Modal/Body';
import NonFieldErrors from '#rsci/NonFieldErrors';
import SegmentInput from '#rsci/SegmentInput';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import DangerButton from '#rsca/Button/DangerButton';

import { leadPaneTypeMap, LEAD_PANE_TYPE } from '#entities/lead';
import { RequestClient, requestMethods } from '#request';
import _ts from '#ts';

import styles from './styles.scss';

const noOp = () => {};

const requests = {
    getMetaInfoRequest: {
        method: requestMethods.GET,
        url: ({ params: { fileId, fileType } }) => (
            `/meta-extraction/${fileId}/?file_type=${fileType}`
        ),
        onSuccess: ({ props, response, params: { fileType } }) => {
            props.onMetaGet(response, fileType, props.onNext);
        },
        onFailure: ({ error: { faramErrors }, params: { handleFaramError } }) => {
            handleFaramError(faramErrors);
        },
        onFatal: ({ params: { handleFaramError } }) => {
            handleFaramError({
                $internal: ['SERVER ERROR'],
            });
        },
    },
};

const fileTypes = [
    { key: 'csv', label: 'CSV' },
    { key: 'xlsx', label: 'XLSX' },
];

const getFileTypeFromMimeType = (mimeType) => {
    const leadType = leadPaneTypeMap[mimeType];
    return leadType === LEAD_PANE_TYPE.spreadsheet ? 'xlsx' : 'csv';
};

const propTypes = {
    onComplete: PropTypes.func, // eslint-disable-line react/no-unused-prop-types
    onNext: PropTypes.func, // eslint-disable-line react/no-unused-prop-types
    onCancel: PropTypes.func,

    lead: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    mimeType: PropTypes.string,

    // eslint-disable-next-line react/forbid-prop-types
    getMetaInfoRequest: PropTypes.object.isRequired,
};

const defaultProps = {
    onComplete: noOp,
    onNext: noOp,
    onCancel: noOp,
    mimeType: '',
};

@RequestClient(requests)
export default class FileTypeSelectionPage extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const { mimeType } = this.props;
        this.state = {
            faramValues: {
                fileType: getFileTypeFromMimeType(mimeType),
            },
            faramErrors: {},
        };
        this.schema = {
            fields: {
                fileType: [requiredCondition],
            },
        };
    }

    handleFaramChange = (faramValues, faramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
        });
    }

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({ faramErrors });
    }

    handleFaramValidationSuccess = (faramValues) => {
        const { lead: { faramValues: { attachment } } } = this.props;
        const { fileType } = faramValues;

        this.props.getMetaInfoRequest.do({
            fileId: attachment.id,
            fileType,
            handleFaramError: this.handleFaramValidationFailure,
        });
    }

    render() {
        const {
            faramValues,
            faramErrors,
        } = this.state;
        const {
            getMetaInfoRequest,
            onCancel,
        } = this.props;

        const { pending } = getMetaInfoRequest;

        return (
            <Faram
                className={styles.form}
                onChange={this.handleFaramChange}
                onValidationFailure={this.handleFaramValidationFailure}
                onValidationSuccess={this.handleFaramValidationSuccess}
                schema={this.schema}
                value={faramValues}
                error={faramErrors}
                disabled={pending}
            >
                <ModalBody>
                    <NonFieldErrors faramElement />
                    <SegmentInput
                        name="file-type-selection"
                        faramElementName="fileType"
                        label={_ts('addLeads.tabular', 'fileTypeLabel')}
                        options={fileTypes}
                        showLabel
                        showHintAndError
                        hideClearButton
                    />
                </ModalBody>
                <ModalFooter>
                    <DangerButton onClick={onCancel}>
                        {_ts('addLeads.tabular', 'cancelButtonTitle')}
                    </DangerButton>
                    <PrimaryButton
                        type="submit"
                        pending={pending}
                    >
                        {_ts('addLeads.tabular', 'nextButtonTitle')}
                    </PrimaryButton>
                </ModalFooter>
            </Faram>
        );
    }
}
