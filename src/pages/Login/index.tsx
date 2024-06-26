import AccountIcon from '@/asset/login/account-line.svg';
import LockIcon from '@/asset/login/lock-line.svg';
import CloseIcon from '@/asset/login/password-close.svg';
import OpenIcon from '@/asset/login/password-open.svg';
import { Footer } from '@/components';
import { AUTO_CREATE_CONFIG_DEF, LOGIN_KEYS, NOTIFICATION_CONFIG_DEF, REQUEST_CODE, SESSION_STORAGE_KEY, UPLOAD_CALL_CONFIG_DEF } from "@/constant";
import { Button, Checkbox, Form, Image, Input } from 'antd';
import { Base64 } from "js-base64";
import React, { useEffect, useRef, useState } from 'react';
import { Dispatch, Loading, connect, history, useIntl } from 'umi';
import styles from './index.less';

interface LoginProps {
    getUser: (obj: LooseObject) => Promise<LooseObject>
    saveUserConfig: (obj: LooseObject) => void
    loginLoading: boolean | undefined
}

const IndexPage: React.FC<LoginProps> = ({ getUser, saveUserConfig, loginLoading }) => {
    const [errorMessage, setErrorMessage] = useState('');
    const [remember, setRemember] = useState(true);
    const [form] = Form.useForm();
    const { formatMessage } = useIntl();
    const userConfig = useRef<LooseObject>({});

    const onCheckChange = (e: { target: { checked: boolean | ((prevState: boolean) => boolean) } }) => {
        setRemember(e.target.checked);
    };

    const onfocus = () => {
        setErrorMessage('');
    }

    const loginSuccess = (values: LooseObject) => {
        const config = {
            ...values,
            apiKey: remember ? values.apiKey : undefined,
            autoLogin: remember ?? true,
            uploadCall: values.uploadCall ?? true,
            notification: values.notification ?? true,
            autoCreate: values.autoCreate ?? false,
            autoCreateConfig: values.autoCreateConfig ?? AUTO_CREATE_CONFIG_DEF,
            uploadCallConfig: values.uploadCallConfig ?? UPLOAD_CALL_CONFIG_DEF,
            notificationConfig: values.notificationConfig ?? NOTIFICATION_CONFIG_DEF,
        }
        saveUserConfig(config);
        history.replace({ pathname: '/home', });
    }

    const onFinish = (values: LooseObject) => {
        const { apiKey } = values;
        const token = Base64.btoa(apiKey + ':X');
        sessionStorage.setItem(SESSION_STORAGE_KEY.token, token);
        getUser(values).then(res => {
            console.log(res);
            if (res?.status === REQUEST_CODE.noFound || res?.code === REQUEST_CODE.connectError) {
                setErrorMessage("error.host")
                return
            }
            if (res?.status === REQUEST_CODE.noAuthority) {
                setErrorMessage("error.userInfo")
                return
            }
            if (res.organisation_id || res.account_id) {
                loginSuccess({
                    ...userConfig.current,
                    ...values,
                });
            }
        });
    };

    useEffect(() => {
        try {
            // @ts-ignore
            pluginSDK.userConfig.getUserConfig(function ({ errorCode, data }) {
                console.log(errorCode, data);
                if (errorCode === 0 && data) {
                    const userInfo = JSON.parse(data);
                    console.log(userInfo);
                    form.setFieldsValue(userInfo);
                    userConfig.current = userInfo;

                    // 已登录的与预装配置进行对比
                    let sameConfig = true;

                    // 有预装配置 走预装配置
                    const preParamObjectStr = sessionStorage.getItem('preParamObject');
                    if (preParamObjectStr) {
                        const preParamObject = JSON.parse(sessionStorage.getItem('preParamObject') || '');
                        if (preParamObject) {
                            const formParams: any = {};
                            Object.keys(preParamObject).forEach((item) => {
                                LOGIN_KEYS.forEach((element) => {
                                    if (item.toLowerCase() === element.toLowerCase()) {
                                        formParams[element] = preParamObject[item];
                                        if (!sameConfig) {
                                            return;
                                        }
                                        sameConfig = preParamObject[item] === userInfo[element];
                                    }
                                });
                            });
                            form.setFieldsValue({ ...formParams });
                        }
                    }

                    if (userInfo.autoLogin && sameConfig) {
                        onFinish(userInfo);
                    }
                }
                else {
                    // 有预装配置 走预装配置
                    const preParamObjectStr = sessionStorage.getItem('preParamObject');
                    if (!preParamObjectStr) {
                        return;
                    }
                    const preParamObject = JSON.parse(preParamObjectStr);
                    const userInfo: any = { domain: '', apiKey: '' }
                    if (preParamObject) {
                        Object.keys(preParamObject).forEach(item => {
                            Object.keys(userInfo).forEach(element => {
                                if (item.toLowerCase() === element.toLowerCase()) {
                                    userInfo[element] = preParamObject[item]
                                }
                            })
                        })
                        form.setFieldsValue({ ...userInfo })
                    }
                    onFinish(userInfo);
                }
            })
        } catch (e) {
            console.error(e)
        }
    }, [])

    return (
        <>
            {errorMessage && <div className={styles.errorDiv}>
                <div className={styles.errorMessage}>{formatMessage({ id: errorMessage })}</div>
            </div>}
            <div className={styles.homePage}>
                <Form
                    className={styles.form}
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    onFocus={onfocus}
                >
                    <div className={styles.formContent}>
                        <Form.Item
                            name="domain"
                            rules={
                                [{
                                    required: true,
                                    message: formatMessage({ id: 'login.domain.error' })
                                }]
                            }>
                            <Input placeholder={formatMessage({ id: 'login.domain' })}
                                prefix={<Image src={AccountIcon} preview={false} />}
                            />
                        </Form.Item>
                        <Form.Item
                            name="apiKey"
                            rules={
                                [{
                                    required: true,
                                    message: formatMessage({ id: 'login.apiKey.error' })
                                }]
                            }>
                            <Input.Password
                                placeholder={formatMessage({ id: 'login.apiKey' })}
                                prefix={<Image src={LockIcon} preview={false} />}
                                iconRender={(visible) => visible
                                    ? (<Image src={OpenIcon} preview={false} />)
                                    : (<Image src={CloseIcon} preview={false} />)
                                }
                            />
                        </Form.Item>
                    </div>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loginLoading}>
                            {formatMessage({ id: 'login.submit' })}
                        </Button>
                    </Form.Item>
                    <div className={styles.remember}>
                        <Checkbox checked={remember} onChange={onCheckChange}>
                            {formatMessage({ id: 'login.remember' })}
                        </Checkbox>
                    </div>
                </Form>
            </div>
            <Footer url="https://documentation.grandstream.com/knowledge-base/wave-crm-add-ins/#overview"
                message={formatMessage({ id: 'login.user.guide' })} />
        </>
    );
};

export default connect(
    ({ loading }: { loading: Loading }) => ({
        loginLoading: loading.effects['global/getUser']
    }),
    (dispatch: Dispatch) => ({
        getUser: (payload: LooseObject) => dispatch({
            type: 'global/getUser',
            payload
        }),
        saveUserConfig: (payload: LooseObject) => dispatch({
            type: 'global/saveUserConfig',
            payload,
        })
    })
)(IndexPage);
