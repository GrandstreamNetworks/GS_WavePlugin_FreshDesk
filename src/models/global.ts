import { Effect, Reducer, history } from "umi";
import { getUser } from '@/services/global';

export interface GlobalModelState {
    userConfig: LooseObject
    user: LooseObject
    connectState: string
    uploadCall: boolean,
    showConfig: LooseObject,
    domain: string,
    callState: Map<string, boolean>
}

export interface GlobalModelType {
    namespace: string
    state: GlobalModelState
    effects: {
        getUser: Effect
        saveUserConfig: Effect
        logout: Effect
        uploadCallChange: Effect
        saveShowConfig: Effect
    }
    reducers: {
        save: Reducer<GlobalModelState>
    }
}

const GlobalModal: GlobalModelType = {
    namespace: 'global',
    state: {
        user: {},
        userConfig: {},
        connectState: 'SUCCESS',
        uploadCall: true,
        showConfig: {},
        domain: '',
        callState: new Map(),
    },

    effects: {
        * getUser({ payload }, { call, put }) {
            const res = yield call(getUser, payload);
            const connectState = res?.code || 'SUCCESS';
            if (res.organisation_id || res.account_id) {
                yield put({
                    type: 'save',
                    payload: {
                        user: res,
                        connectState,
                    }
                })
            } else {
                yield put({
                    type: 'save',
                    payload: {
                        connectState,
                    }
                })
            }

            return res;
        },

        * logout(_, { put, select }) {
            const { userConfig } = yield select((state: any) => state.global);
            userConfig.autoLogin = false;
            userConfig.apiKey = undefined;
            yield put({
                type: 'saveUserConfig',
                payload: userConfig
            });
            history.replace({ pathname: 'login' })
        },

        * uploadCallChange({ payload }, { put, select }) {
            const { userConfig } = yield select((state: any) => state.global);
            userConfig.uploadCall = payload;
            yield put({
                type: 'saveUserConfig',
                payload: userConfig,
            })
            yield put({
                type: 'save',
                payload: {
                    uploadCall: payload,
                }
            })
        },

        * saveShowConfig({ payload }, { put, select }) {
            const { userConfig } = yield select((state: any) => state.global);
            console.log(userConfig);
            userConfig.showConfig = payload;
            yield put({
                type: 'saveUserConfig',
                payload: userConfig,
            })
            yield put({
                type: 'save',
                payload: {
                    showConfig: payload,
                }
            })
        },


        * saveUserConfig({ payload }, { put }) {
            console.log(payload);
            // @ts-ignore
            pluginSDK.userConfig.addUserConfig({ userConfig: JSON.stringify(payload) }, function ({ errorCode }) {
                console.log(errorCode);
            })
            yield put({
                type: 'save', payload: {
                    userConfig: payload
                },
            })
        }
    },

    reducers: {
        save(state, action) {
            return { ...state, ...action.payload };
        },
    },
};

export default GlobalModal;
