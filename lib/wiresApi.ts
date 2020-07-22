import { get } from 'lodash'
import axios from 'axios'

import { getAPIHostname } from './apiTarget'

export interface CreateWireAccountPayload {
  idempotencyKey: string
  beneficiaryName: string | undefined
  accountNumber: string | undefined
  routingNumber: string | undefined
  iban: string | undefined
  billingDetails: {
    name: string
    city: string
    country: string
    line1: string
    line2: string
    district: string
    postalCode: string
  }
  bankAddress: {
    bankName: string | undefined
    city: string
    country: string
    line1: string
    line2: string
    district: string
    postalCode: string
  }
}

const instance = axios.create({
  baseURL: getAPIHostname(),
})

/**
 * Global error handler:
 * Intercepts all axios reponses and maps
 * to errorHandler object
 */
instance.interceptors.response.use(
  function (response) {
    if (get(response, 'data.data')) {
      return response.data.data
    }
    return response
  },
  function (error) {
    let response = get(error, 'response')
    if (!response) {
      response = error.toJSON()
    }
    return Promise.reject(response)
  }
)

/** Returns the axios instance */
function getInstance() {
  return instance
}

const nullIfEmpty = (prop: string | undefined) => {
  if (prop !== undefined && prop.trim() === '') {
    return undefined
  }
  return prop
}

/**
 * Create Wire Account
 * @param {*} payload (contains form data)
 */
function createWireAccount(payload: CreateWireAccountPayload) {
  const url = '/v1/banks/wires'
  payload.beneficiaryName = nullIfEmpty(payload.beneficiaryName)
  payload.accountNumber = nullIfEmpty(payload.accountNumber)
  payload.routingNumber = nullIfEmpty(payload.routingNumber)
  payload.iban = nullIfEmpty(payload.iban)
  return instance.post(url, payload)
}

/**
 * Get Wire Account By Id
 * @param {String} accountId
 */
function getWireAccountById(accountId: string) {
  const url = `/v1/banks/wires/${accountId}`

  return instance.get(url)
}

export default {
  getInstance,
  createWireAccount,
  getWireAccountById,
}
