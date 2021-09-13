declare module 'react-org-tree' {
    export interface Data {
        id: string;
        label: string;
        children: this[];
    }

    interface Props<T extends Data> {
        data: T;
        vertical?: boolean;
        horizontal?: boolean;
        expandAll?: boolean;
       renderContent?: (data: T) => JSX.Element;
        labelClassName?: string;
        labelWidth?: number;
        collapsable?: boolean;
        onClick?: (e: Event, data: T) => void;
    }
    // eslint-disable-next-line
    export default class OrgTree<T> extends React.Component<Props<T>> {}
}
