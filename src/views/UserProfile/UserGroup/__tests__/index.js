import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { shallow } from 'enzyme';
import UserGroup from '../index';

import Modal from '#rscv/Modal';
import ModalBody from '#rscv/Modal/Body';
import ModalHeader from '#rscv/Modal/Header';
import Table from '#rscv/Table';

const initialState = {
};

describe('<UserGroup />', () => {
    const mockStore = configureStore();
    const store = mockStore(initialState);
    const data = [];
    const headers = [];
    const wrapper = shallow(
        <Provider
            store={store}
        >
            <UserGroup>
                <Table
                    data={data}
                    headers={headers}
                    keySelector={() => {}}
                />
                <Modal
                    closeOnEscape
                    onClose={() => {}}
                >
                    <ModalHeader
                        title="Header"
                    />
                    <ModalBody />
                </Modal>
            </UserGroup>
        </Provider>,
    );

    it('renders properly with Table and Modal', () => {
        expect(wrapper.length).toEqual(1);
    });
});
