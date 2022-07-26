import request from "@/utils/request";
import { stringify } from "qs";

export function getContact(params: LooseObject) {
    const query = {
        query: `"phone:${params.callNum} OR mobile:${params.callNum}"`
    }
    return request(`https://${params.domain}.freshdesk.com/api/v2/search/contacts?${stringify(query)}`)
}

export function getCompany(params: LooseObject) {
    return request(`https://${params.domain}.freshdesk.com/api/v2/companies/?${params.companyId}`)
}

export function putCallInfo(params: LooseObject) {
    return request(`https://${params.domain}.freshdesk.com/api/v2/tickets`, {
        method: 'POST',
        body: JSON.stringify(params.callInfo)
    })
}