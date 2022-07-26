import React, { useCallback } from "react";
import { connect, Dispatch, GlobalModelState, useIntl } from "umi";
import moment from "moment";
import { getNotificationBody, getValueByConfig } from "@/utils/utils";
import { CallAction, ConfigBlock, ConnectError, ConnectState, Footer } from "@/components";
import { WAVE_CALL_TYPE } from "@/constant";
import styles from "./index.less";

interface HomeProps {
    getContact: (obj: LooseObject) => Promise<LooseObject>;
    putCallInfo: (obj: LooseObject) => Promise<LooseObject>;
    saveUserConfig: (obj: LooseObject) => void;
    showConfig: LooseObject;
    user: LooseObject
    domain: string
    uploadCall: boolean
    callState: Map<string, boolean>
}

const HomePage: React.FC<HomeProps> = (props) => {
    const {
        getContact,
        putCallInfo,
        showConfig,
        user,
        domain,
        uploadCall,
        callState
    } = props;
    const { formatMessage } = useIntl();

    /**
     * 上报通话
     */
    const uploadCallInfo = useCallback((callNum: string, callStartTimeStamp: number, callEndTimeStamp: number, callDirection: string) => {
        if (!uploadCall) {
            return;
        }
        callNum = callNum.replace(/\b(0+)/gi, "");
        getContact({ callNum, domain }).then(contactInfo => {
            if (!contactInfo?.id) {
                return;
            }
            const duration = callEndTimeStamp - callStartTimeStamp;
            const duration_hours = moment.duration(duration).hours();
            const duration_minutes = moment.duration(duration).minutes();
            const duration_seconds = moment.duration(duration).seconds();
            const call_from = callDirection !== WAVE_CALL_TYPE.out ? `${contactInfo.name} ${callNum}` : `${user.contact_person?.firstname ?? ''} ${user.contact_person?.lastname ?? ''}`;
            const call_to = callDirection !== WAVE_CALL_TYPE.out ? `${user.contact_person?.firstname ?? ''} ${user.contact_person?.lastname ?? ''}` : `${contactInfo.name} ${callNum}`;
            const callInfo = {
                subject: `${contactInfo.name || callNum} 's call`,
                requester_id: contactInfo.id,
                priority: 1,
                source: 3,
                status: 5,
                description: `Start Date & Time: ${moment(callStartTimeStamp || undefined).format()}</br>
                          End Date & Time: ${moment(callEndTimeStamp || undefined).format()}</br>
                          Duration: ${duration_hours}h ${duration_minutes}m ${duration_seconds}s</br>
                          Created ${callDirection} Call from ${call_from} to ${call_to}`,
            };

            const params = {
                domain,
                callInfo
            }
            putCallInfo(params).then(res => {
                console.log("putCallInfo:", params, res);
            });
        });
    }, [domain, uploadCall])

    const getUrl = (contact: LooseObject) => {
        return contact?.id
            ? `https://${domain}.freshdesk.com/a/contacts/${contact.id}`
            : `https://${domain}.freshdesk.com`;
    };

    const initCallInfo = useCallback((callNum: string) => {
        // callNum 去除前面的0
        callNum = callNum.replace(/\b(0+)/gi, "");
        getContact({ callNum, domain }).then(contact => {
            console.log("callState", callState);
            if (!contact?.displayNotification || !callState.get(callNum)) {
                return;
            }
            const url = getUrl(contact);
            const pluginPath = sessionStorage.getItem("pluginPath");

            // body对象，
            const body: LooseObject = {
                logo: `<div style="margin-bottom: 12px"><img src="${pluginPath}/logo.svg" alt=""/> Freshdesk</div>`,
            }
            if (contact?.id) {
                // 将showConfig重复的删除
                const configList = [...new Set<string>(Object.values(showConfig))]
                console.log(configList);
                for (const key in configList) {
                    console.log(configList[key])
                    if (!configList[key]) {
                        continue;
                    }

                    // 取出联系人的信息用于展示
                    const configValue = getValueByConfig(contact, configList[key]);
                    console.log(configValue);
                    if (configList[key] === 'Phone') {
                        body[`config_${key}`] = `<div style="font-weight: bold">${callNum}</div>`
                    }
                    else if (configValue) {
                        body[`config_${key}`] = `<div style="font-weight: bold; display: -webkit-box;-webkit-box-orient: vertical;-webkit-line-clamp: 5;overflow: hidden;word-break: break-all;text-overflow: ellipsis;">${configValue}</div>`
                    }
                }
            }
            else {
                body.phone = `<div style="font-weight: bold;">${callNum}</div>`
            }
            body.action = `<div style="margin-top: 10px;display: flex;justify-content: flex-end;"><button style="background: none; border: none;">
                     <a href=${url} target="_blank" style="color: #62B0FF">
                         ${contact?.id ? formatMessage({ id: 'home.detail' }) : formatMessage({ id: 'home.edit' })}
                     </a>
                 </button></div>`;
            console.log("displayNotification");
            // @ts-ignore
            pluginSDK.displayNotification({
                notificationBody: getNotificationBody(body)
            });
        });
    }, [domain, showConfig, callState])

    return (
        <>
            <CallAction initCallInfo={initCallInfo} uploadCallInfo={uploadCallInfo} />
            <ConnectError />
            <div className={styles.homePage}>
                <ConnectState />
                <ConfigBlock />
            </div>
            <Footer url={`https://${domain}.freshdesk.com`} message={formatMessage({ id: "home.toCRM" })} />
        </>
    );
};

export default connect(
    ({ global }: { global: GlobalModelState }) => ({
        domain: global.domain,
        user: global.user,
        showConfig: global.showConfig,
        uploadCall: global.uploadCall,
        callState: global.callState,
    }),
    (dispatch: Dispatch) => ({
        getContact: (payload: LooseObject) =>
            dispatch({
                type: "home/getContact",
                payload
            }),
        putCallInfo: (payload: LooseObject) =>
            dispatch({
                type: "home/putCallInfo",
                payload
            })
    })
)(HomePage);
