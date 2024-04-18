import request from "@/utils/request";

export function getContact(params: LooseObject) {
    return request(`https://${params.domain}.freshdesk.com/api/v2/contacts/autocomplete?term=${params.callNum}`)
}

export function getContactInfo(params: LooseObject) {
    return request(`https://${params.domain}.freshdesk.com/api/v2/contacts/${params.id}`)
}

export function getCompany(params: LooseObject) {
    return request(`https://${params.domain}.freshdesk.com/api/v2/companies/${params.companyId}`)
}

export function putCallInfo(params: LooseObject) {
    return request(`https://${params.domain}.freshdesk.com/api/v2/tickets`, {
        method: 'POST',
        body: JSON.stringify(params.callInfo)
    })
}

export function createContact(params: LooseObject) {
    return request(`https://${params.domain}.freshdesk.com/api/v2/contacts`, {
        method: 'POST',
        body: JSON.stringify(params.contactInfo)
    })
}