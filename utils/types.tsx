import { QueryCompositeFilterConstraint, QueryConstraint, QueryDocumentSnapshot, QueryFilterConstraint, WhereFilterOp } from "firebase/firestore"


export type ProjectType = {
    id: string,
    title: string,
    scope: string,
    token: 'USDC' | 'ETH' | 'SOL' | 'BTC',
    wallet: 'Phantom' | 'MetaMask',
    address: string,
    amount: number,
    deliverable: string,
    deadline: string,
    status: 'Complete' | 'In escrow' | 'Accepted' | 'Rejected' | 'Failed' | undefined,
    payer: string | undefined,
    payee: string | undefined,
    signature: string | undefined,
    createdAt: string | undefined,
    updatedAt: string | undefined
}

export interface ContextValue {
    user?: User,
    setUser?: Function,
    checkIfAuthenticated?: Function
};

export type User = {
    id: string,
    firstName?: string,
    lastName?: string,
    address: string,
    signature: string,
    email?: string
}

export type OrderAction = {
    fieldName: string,
    direct: 'desc' | 'asc'
}

export type WhereAction = {
    fieldName: string,
    operator: WhereFilterOp,
    value: string | string[] | number | boolean
}

export type Filter = {
    orderBy?: OrderAction,
    limit?: number,
    endBefore?: QueryDocumentSnapshot,
    startAfter?: QueryDocumentSnapshot,
    where?: WhereAction[],
    orWhere?: WhereAction[]
}

export type WalletSignResult = {
    address: string,
    signature: string
}