import { Pfleger } from "../model/PflegerModel";

/**
 * Prüft Name und Passwort, bei Erfolg ist `success` true
 * und es wird die `id` und `role` ("u" oder "a") des Pflegers zurückgegeben
 *
 * Falls kein Pfleger mit gegebener Name existiert oder das Passwort falsch ist, wird nur
 * `false` zurückgegeben. Aus Sicherheitsgründen wird kein weiterer Hinweis gegeben.
 */
export async function login(
  name: string,
  password: string
): Promise<{ id: string; role: "a" | "u" } | false> {
  const pfle = await Pfleger.findOne({ name: name }).exec();
  if (!pfle) return false;
  const isMatch = await pfle.isCorrectPassword(password);
  if (!isMatch) return false;
  return { id: pfle.id, role: pfle.admin ? "a" : "u" };
}
