import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Inicializa o firebase-admin app
const app = admin.initializeApp();

// Inicializa o Firestore Database
const db = app.firestore();

// Salva acesso a coleção "profissionais" no Firestore Database
const colProfissionais = db.collection("profissionais");


// * Salvar dados pessoais do profissional ao criar sua conta
export const salvarDadosPessoais = functions

  // Seleção da região que a função irá ficar
  .region("southamerica-east1")

  // Seleçõa do tipo de chamda da função
  .https.onCall(async (data) => {
    // Tentativa de adição de dados no banco de dados Firebase Firestore
    try {
      await colProfissionais.doc().set(data);
      return { text: "Profissional inserido!" };
    } catch (e) {
      functions.logger.error("Erro ao inserir profissional. Error: " + e);
      return { text: "Erro ao inserir profissional" };
    }
  });
