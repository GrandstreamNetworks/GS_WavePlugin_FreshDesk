import { Effect, Reducer } from 'umi';
import { get } from 'lodash';
import { getCompany, getContact, putCallInfo } from '../services';

export interface HomeModelState {
}

export interface HomeModelType {
    namespace: string
    state: HomeModelState
    effects: {
        getContact: Effect
        putCallInfo: Effect
    }
    reducers: {
        save: Reducer<HomeModelState>
    }
}

const HomeModal: HomeModelType = {
    namespace: 'home',
    state: {},

    effects: {
        * getContact({ payload }, { call, put }) {
            let res = yield call(getContact, payload);
            // 异常判断
            let connectState = res?.code || 'SUCCESS';
            yield put({
                type: 'global/save',
                payload: {
                    connectState,
                }
            })
            const contactInfo = get(res, ['results', 0]) || {};

            contactInfo.displayNotification = connectState === 'SUCCESS';
            contactInfo.companyName = get(contactInfo, ['company', 'name']);
            return contactInfo;
        },

        * putCallInfo({ payload }, { call, put }) {
            let res = yield call(putCallInfo, payload);
            let connectState = res?.code || 'SUCCESS';
            yield put({
                type: 'global/save', payload: { connectState, }
            })
            return res;
        }
    },

    reducers: {
        save(state, action) {
            return { ...state, ...action.payload }
        }
    }
}

export default HomeModal;
