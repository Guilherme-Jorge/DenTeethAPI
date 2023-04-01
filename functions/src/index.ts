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
    // ? Checagem pode ser redundante, podendo ser feita diretamente no app
    // * COMEÇO DA CHECAGEM DE PARÂMETROS
    // Checagem para ver se o parâmetro nome está vazio ou não
    if (!(typeof data.nome === "string") || data.nome.length === 0) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "A função deve ser chamada com " +
          "um argumento 'nome' contendo o nome do profissional a ser adcionado"
      );
    }

    // Checagem para ver se o parâmetro nome está vazio ou não
    if (!(typeof data.telefone === "string") || data.telefone.length === 0) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "A função deve ser chamada com " +
          "um argumento 'telefone' contendo " +
          "o telefone do profissional a ser adcionado"
      );
    }

    // Checagem para ver se o parâmetro nome está vazio ou não
    if (!(typeof data.email === "string") || data.email.length === 0) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "A função deve ser chamada com " +
          "um argumento 'email' contendo " +
          "o email do profissional a ser adcionado"
      );
    }

    // Checagem para ver se o parâmetro nome está vazio ou não
    if (!(typeof data.endereco1 === "string") || data.endereco1.length === 0) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "A função deve ser chamada com " +
          "um argumento 'endereco1' contendo " +
          "o endereço principal do profissional a ser adcionado"
      );
    }

    // Checagem para ver se o parâmetro nome está vazio ou não
    if (!(typeof data.curriculo === "string") || data.curriculo.length === 0) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "A função deve ser chamada com " +
          "um argumento 'curriculo' contendo " +
          "o currículo principal do profissional a ser adcionado"
      );
    }
    // * FIM DA CHECAGEM DE PARÂMETROS

    // Tentativa de adição de dados no banco de dados Firebase Firestore
    try {
      await colProfissionais.doc().set(data);
      return { text: "Profissional inserido!" };
    } catch (e) {
      functions.logger.error("Erro ao inserir profissional. Error: " + e);
      return { text: "Erro ao inserir profissional" };
    }
  });
