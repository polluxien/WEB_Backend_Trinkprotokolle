import { IPfleger, Pfleger} from "../../src/model/PflegerModel"
import bcrypt from 'bcryptjs';

test("Pfleger überprüfen", async () => {
    let pflegerMartin = await Pfleger.create({name: "LeMartin", password: "123456789"});
    const leM = await pflegerMartin.save();
    
    expect(leM).toBeDefined();
    expect(leM.name).toBe("LeMartin");
    expect(leM.admin).toBeFalsy();
})

test("Pfleger Update", async () => {
    let pflegerMartin = await Pfleger.create({name: "LeMartin", password: "123456789"});
    await pflegerMartin.save();

    //
    const plegerDochThomas = await Pfleger.updateOne({name: "LeMartin"}, {name: "LeThomas", password: "987654321"})
    expect(plegerDochThomas.matchedCount).toBe(1);
    expect(plegerDochThomas.modifiedCount).toBe(1);
    expect(plegerDochThomas.acknowledged).toBeTruthy();

    //exestiert alter Pfleger noch im System
    const t1 = await Pfleger.findOne({name: "LeMartin"}).exec();
    expect(t1).toBeFalsy();

    //neuer Pfleger auffinbar
    const t2 = await Pfleger.findOne({name: "LeThomas"}).exec();
    expect(t2).toBeTruthy();
})

//----- Übung 2
test("Pfleger Passwort überprüfen mit hash", async () => {
    let password: string = "123456789";
    let pflegerMartin = await Pfleger.create({name: "LeMartin", password: password});
    const leM = await pflegerMartin.save();
    
    let hashedpassword = leM.password;
    try{
        const isMatch = await bcrypt.compare(password, hashedpassword);
        expect(isMatch).toBeTruthy();
    } catch(error) {
    
    }
});
