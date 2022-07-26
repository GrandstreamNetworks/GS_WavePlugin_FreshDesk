import request from '@/utils/request';

/**
 * 获取联系人列表
 * @returns
 */
export function getUser(params: any) {
    return request(`https://${params.domain}.freshdesk.com/api/v2/account`);
}
