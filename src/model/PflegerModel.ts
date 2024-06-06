import { Model, Schema, model } from "mongoose";
import bcrypt from "bcryptjs";

export interface IPflegerMethods{
  isCorrectPassword(pass: string): Promise<Boolean>;
}

export interface IPfleger {
  name: string;
  password: string;
  admin?: boolean;
}

type pflegerModell = Model<IPfleger, {}, IPflegerMethods>;

const pflegerSchema = new Schema<IPfleger, pflegerModell>({
  name: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  admin: { type: Boolean, required: false, default: false },
});

pflegerSchema.pre("save", async function () {
  if (this.isModified("password")) {
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
  }
});

//Hook updateOne
/*
pflegerSchema.pre("updateOne", async function (newPassword) {
  const update = this.getUpdate();
  //hier weiter implementieren
});
*/

pflegerSchema.method(
  "isCorrectPassword",
  async function (pass: string): Promise<Boolean> {
    if (this.isModified()) {
      throw Error();
    }
    return await bcrypt.compare(pass, this.password);
  }
);

export const Pfleger = model<IPfleger, pflegerModell>("Pfleger", pflegerSchema);
