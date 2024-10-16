export enum Gender {
    Männlich = "Männlich",
    Weiblich = "Weiblich",
    Divers = "Divers",
    KeineAngabe = "Keine Angabe"
  }

export type PflegerResource = {
    id?: string
    name: string
    admin: boolean
    password?: string
    gender: Gender;
    birth: string;
    adress: string;
    position: string;
}

export type ProtokollResource = {
    id?: string
    patient: string
    datum: string
    public?: boolean
    closed?: boolean
    ersteller: string
    erstellerName?: string
    updatedAt?: string
    gesamtMenge?: number
}

export type EintragResource = {
    id?: string
    getraenk: string
    menge: number
    kommentar?: string
    ersteller: string
    erstellerName?: string
    createdAt?: string
    protokoll: string
}

export type LoginResource = {
    id: string
    role: "a"|"u"
    /** Expiration time in seconds since 1.1.1970 */
    exp: number
}