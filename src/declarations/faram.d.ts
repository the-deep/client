declare module '@togglecorp/faram' {
    import * as React from 'react';

    interface Props {
        className?: string;
        schema: {
            fields: {
                [key: string]: any[];
            };
        };
        value: any;
        error: any;
        onChange: (faramValues: any, faramErrors: any) => void;
        onValidationSuccess?: (faramValues: any) => void;
        onValidationFailure?: (faramErrors: any) => void;
        disabled?: boolean;
    }

    export default class Faram extends React.PureComponent<Props> {
    }


    // NOTE: you need to explicitly pass faramElementName with this typing
    function FaramInputElement<T>(component: React.ComponentType<T>):
        React.ComponentType<Omit<T, 'value' | 'onChange'> & { faramElementName: string; faramInfo?: any }>

    // NOTE: you need to explicitly pass faramElementName with this typing
    function FaramOutputElement<T>(component: React.ComponentType<T>):
        React.ComponentType<Omit<T, 'value'> & { faramElementName: string }>

    // NOTE: you need to explicitly pass faramElementName with this typing
    function FaramErrorMessageElement<T>(component: React.ComponentType<T>):
        React.ComponentType<Omit<T, 'errors'> & { faramElement: boolean }>

    // NOTE: you need to explicitly pass faramElementName with this typing
    function FaramErrorIndicatorElement<T>(component: React.ComponentType<T>):
        React.ComponentType<Omit<T, 'hasError' | 'errors'> & { faramElementName: string }>

    // NOTE: you need to explicitly pass faramElementName with this typing
    function FaramActionElement<T>(component: React.ComponentType<T>):
        React.ComponentType<Omit<T, 'disabled' | 'changeDelay' | 'onClick'> & { faramElementName: string; faramAction: any }>

    // NOTE: you need to explicitly pass faramElementName with this typing
    function FaramListElement<T>(component: React.ComponentType<T>):
        React.ComponentType<Omit<T, 'data' | 'keySelector'> & { faramElement: boolean }>

    // NOTE: you need to explicitly pass faramElementName with this typing
    function FaramSortableListElement<T>(component: React.ComponentType<T>):
        React.ComponentType<Omit<T, 'data' | 'onChange' | 'keySelector'> & { faramElement: boolean }>
}
