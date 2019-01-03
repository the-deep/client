import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { shallow } from 'enzyme';
import ProjectAddForm from '../index';

const initialState = {
};


describe('<ProjectAddForm />', () => {
    const mockStore = configureStore();
    const store = mockStore(initialState);
    const wrapper = shallow(
        <Provider
            store={store}
        >
            <ProjectAddForm />
        </Provider>,
    );

    it('renders properly along with form', () => {
        expect(wrapper.length).toEqual(1);
    });
});
