import { createContact, getCompany, getContact, getContactInfo, putCallInfo } from '@/services/home';
import { get } from 'lodash';
import { Effect, Reducer } from 'umi';

export interface HomeModelState {
}

export interface HomeModelType {
    namespace: string
    state: HomeModelState
    effects: {
        getContact: Effect
        putCallInfo: Effect
        createNewContact: Effect
    }
    reducers: {
        save: Reducer<HomeModelState>
    }
}

const HomeModal: HomeModelType = {
    namespace: 'home',
    state: {},

    effects: {
        * getContact({ payload }, { call, put }): any {
            let res = yield call(getContact, payload);
            // 异常判断
            let connectState = res?.code || 'SUCCESS';
            yield put({
                type: 'global/save',
                payload: {
                    connectState,
                }
            })
            let contactInfo = get(res, [0]) || {};
            if (contactInfo.id) {
                contactInfo = yield call(getContactInfo, { ...payload, id: contactInfo.id });
                if (contactInfo.company_id) {
                    const companyInfo = yield call(getCompany, { ...payload, companyId: contactInfo.company_id });
                    contactInfo.company = companyInfo;
                }
            }
            contactInfo.displayNotification = connectState === 'SUCCESS';
            contactInfo.companyName = get(contactInfo, ['company', 'name']);
            return contactInfo;
        },

        * putCallInfo({ payload }, { call, put }): any {
            let res = yield call(putCallInfo, payload);
            let connectState = res?.code || 'SUCCESS';
            yield put({
                type: 'global/save', payload: { connectState, }
            })
            return res;
        },

        * createNewContact({ payload }, { call, put }): any {
            let res = yield call(createContact, payload);
            let connectState = res?.code || 'SUCCESS';
            yield put({
                type: 'global/save', payload: { connectState }
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
