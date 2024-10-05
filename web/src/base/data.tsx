export interface LoginUserDTO {
    name: string
    hasPassword: boolean,
    id: number
}

export interface EventInfoDTO {
    name: string
    info: string
}

export interface ParticipantDTO {
    id: number,

    name: string

    whois?: string

    admin?: boolean
}

export interface NewTransactionDTO {
    author: number
    amount: number
}

export interface MoneyTransactionDTO {
    id: number
    creationTime: string,

    author: ParticipantDTO,
    amount: number
}

export interface GoodRequestDTO {
    id: number
    name: string
    count: number
    cost: number
    importancy: number
    author: ParticipantDTO
}


export interface CreateGoodRequestDTO {
    name: string
    count: number
    cost: number
    importancy: number
}

export interface PatchGoodRequestDTO {
    id: number,
    info: CreateGoodRequestDTO
}

export interface GoodLogDTO {
    id: number
    creationTime: number
    author: ParticipantDTO
    message: string
    target: GoodRequestDTO
}
