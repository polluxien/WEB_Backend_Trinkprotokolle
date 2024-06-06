import { Schema, Types, model } from "mongoose"

export interface IProtokoll{
    ersteller: Types.ObjectId
    patient: string
    datum: Date
    public?: boolean
    closed?: boolean
    updatedAt?: Date
}

const protokollSchema = new Schema<IProtokoll>({
    ersteller: {type: Schema.Types.ObjectId, ref: "Pfleger", required: true},
    patient: {type: String, required: true},
    datum: {type: Date, required: true},
    public: {type: Boolean, default: false},
    closed: {type: Boolean, default: false},
    updatedAt: {type: Date}
},{
    timestamps: true
});

export const Protokoll = model<IProtokoll>("Protokoll", protokollSchema);