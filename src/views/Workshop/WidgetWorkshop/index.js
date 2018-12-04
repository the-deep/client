import React from 'react';

import PrimaryButton from '#rsca/Button/PrimaryButton';
import NonFieldErrors from '#rsci/NonFieldErrors';
import SegmentInput from '#rsci/SegmentInput';


import Faram, {
    integerCondition,
    requiredCondition,
    lengthGreaterThanCondition,
    greaterThanCondition,
} from '#rscg/Faram';
import FaramGroup from '#rscg/FaramGroup';

import ExcerptWidget from '../../../widgets/tagging/Excerpt';
import NumberWidget from '../../../widgets/tagging/Number';
import DateWidget from '../../../widgets/tagging/Date';
import TimeWidget from '../../../widgets/tagging/Time';
import DateRangeWidget from '../../../widgets/tagging/DateRange';
import TimeRangeWidget from '../../../widgets/tagging/TimeRange';
import ScaleWidget from '../../../widgets/tagging/Scale';
import SelectWidget from '../../../widgets/tagging/Select';
import MultiSelectWidget from '../../../widgets/tagging/MultiSelect';

import styles from './styles.scss';

export default class Workshop extends React.PureComponent {
    static keySelector = elem => elem.key;
    static labelSelector = elem => elem.label;

    static schema = {
        fields: {
            search: [],
            username: [
                requiredCondition,
            ],
            password: [
                requiredCondition,
                lengthGreaterThanCondition(4),
            ],
            age: [
                integerCondition,
                greaterThanCondition(0),
            ],
            rainbowAffinity: [],
            fruits: [],
            favoriteColor: [],
            dob: [],
            tob: [],
            hiddenValue: [],
            places: [],
            goodPlaces: [],
            badPlaces: [],
            worstPlace: [],
            nicePlace: [],
            bestPlace: [],
            polutionIndex: [],
            gender: [],
            friends: [],
            description: [],
        },
        /*
        validation: ({ fromValue, toValue }) => {
            const errors = [];
            if (fromValue && toValue && fromValue > toValue) {
                errors.push('From value must be less than To value');
            }
            return errors;
        },
        */
    };

    constructor(props) {
        super(props);

        this.state = {
            options: {
                select: {
                    properties: {
                        data: {
                            options: [
                                { key: 'pokhara', label: 'The Pokhara' },
                                { key: 'kathmandu', label: 'Dustmandu' },
                                { key: 'chitwan', label: 'Chitwan' },
                                { key: 'illam', label: 'Illam' },
                            ],
                        },
                    },
                },
                scale: {
                    properties: {
                        data: {
                            scaleUnits: [
                                { key: 'pokhara', label: 'The Pokhara' },
                                { key: 'kathmandu', label: 'Dustmandu' },
                                { key: 'chitwan', label: 'Chitwan' },
                                { key: 'illam', label: 'Illam' },
                            ],
                        },
                    },
                },
            },
            faramErrors: {},
            faramValues: {
                search: 'Looking',
                username: 'thenav56',
                password: 'noobnoob',
                rainbowAffinity: false,
                fruits: ['apple'],
                favoriteColor: '#ff0000',
                dob: '2012-10-1',
                tob: '10:10:00',
                hiddenValue: '3783947897982342',
            },
            faramState: 'normal',
            // disabled: false,
            // readOnly: false,
            pending: false,
        };
    }

    componentWillUnmount() {
        clearTimeout(this.clearPendingTimeout);
    }

    handleFaramStateChange = (val) => {
        this.setState({ faramState: val });
    }

    handleFaramChange = (values, errors) => {
        this.setState({ faramValues: values, faramErrors: errors });
    }

    handleFaramValidationFailure = (errors) => {
        this.setState({ faramErrors: errors });
    }

    handleFaramValidationSuccess = (values) => {
        console.warn(values);
        this.setState({ pending: true });
        this.clearPendingTimeout = setTimeout(() => this.setState({ pending: false }), 4000);
    }

    render() {
        const {
            faramErrors,
            faramValues,
            faramState,
            // disabled,
            // readOnly,
            pending,
        } = this.state;

        const disabled = faramState === 'disabled';
        const readOnly = faramState === 'readOnly';

        return (
            <div className={styles.workshop}>
                <SegmentInput
                    name="random-name-for-segment-1"
                    labelSelector={Workshop.labelSelector}
                    keySelector={Workshop.keySelector}
                    value={this.state.faramState}
                    onChange={this.handleFaramStateChange}
                    options={[
                        { key: 'normal', label: 'Enabled' },
                        { key: 'disabled', label: 'Disabled' },
                        { key: 'readOnly', label: 'Readonly' },
                    ]}
                />

                <Faram
                    className={styles.faram}
                    onChange={this.handleFaramChange}
                    onValidationFailure={this.handleFaramValidationFailure}
                    onValidationSuccess={this.handleFaramValidationSuccess}
                    schema={Workshop.schema}
                    value={faramValues}
                    error={faramErrors}
                    disabled={disabled || pending}
                    readOnly={readOnly}
                >
                    <NonFieldErrors faramElement />
                    <div className={styles.firstRow} >
                        <div>
                            <div>Excerpt</div>
                            <ExcerptWidget
                                entryType="excerpt"
                                excerpt="I am the walrus."
                            />
                        </div>
                        <div>
                            <div>Excerpt</div>
                            <ExcerptWidget
                                entryType="image"
                                image="https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Placeholder_no_text.svg/600px-Placeholder_no_text.svg.png"
                            />
                        </div>
                    </div>
                    <div className={styles.firstRow} >
                        <div>
                            <FaramGroup faramElementName="number">
                                <div>Number</div>
                                <NumberWidget />
                            </FaramGroup>
                        </div>
                        <div>
                            <FaramGroup faramElementName="date">
                                <div>Date</div>
                                <DateWidget />
                            </FaramGroup>
                        </div>
                        <div>
                            <FaramGroup faramElementName="time">
                                <div>Time</div>
                                <TimeWidget />
                            </FaramGroup>
                        </div>
                        <div>
                            <FaramGroup faramElementName="dateRange">
                                <div>Date Range</div>
                                <DateRangeWidget />
                            </FaramGroup>
                        </div>
                        <div>
                            <FaramGroup faramElementName="timeRange">
                                <div>Time Range</div>
                                <TimeRangeWidget />
                            </FaramGroup>
                        </div>
                    </div>
                    <div className={styles.firstRow} >
                        <div>
                            <FaramGroup faramElementName="select">
                                <div>Select</div>
                                <SelectWidget
                                    widget={this.state.options.select}
                                />
                            </FaramGroup>
                        </div>
                        <div>
                            <FaramGroup faramElementName="multiselect">
                                <div>Multi Select</div>
                                <MultiSelectWidget
                                    widget={this.state.options.select}
                                />
                            </FaramGroup>
                        </div>
                        <div>
                            <FaramGroup faramElementName="scale">
                                <div>Scale</div>
                                <ScaleWidget
                                    widget={this.state.options.scale}
                                />
                            </FaramGroup>
                        </div>
                    </div>
                    <PrimaryButton
                        type="submit"
                        pending={pending}
                    >
                        Submit
                    </PrimaryButton>
                </Faram>
            </div>
        );
    }
}
