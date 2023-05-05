import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { log } from "firebase-functions/logger";

// Inicializa o firebase-admin app
const app = admin.initializeApp();

// Inicializa o Firestore Database
const db = app.firestore();

// Salva acesso a coleção "profissionais" no Firestore Database
const colProfissionais = db.collection("profissionais");
// const colEmergencia = db.collection("emergencia");
const colRespostas = db.collection("respostas");

type Profissional = {
  nome: string;
  email: string;
  telefone: string;
  endereco1: string;
  curriculo: string;
  fcmToken: string | undefined;
  uid: string;
};

type CustomResponse = {
  status: string | unknown;
  message: string | unknown;
  payload: unknown;
};

function hasAccountData(data: Profissional) {
  if (
    data.nome != undefined &&
    data.email != undefined &&
    data.telefone != undefined &&
    data.endereco1 != undefined &&
    data.curriculo != undefined &&
    data.uid != undefined &&
    data.fcmToken != undefined
  ) {
    return true;
  } else {
    return false;
  }
}

// * Salvar dados pessoais do profissional ao criar sua conta
export const salvarDadosPessoais = functions

  // Seleção da região que a função irá ficar
  .region("southamerica-east1")

  // Habilitar a checagem de aplicativo ou não
  .runWith({ enforceAppCheck: false })

  // Seleçõa do tipo de chamda da função
  .https.onCall(async (data) => {
    const cResponse: CustomResponse = {
      status: "ERROR",
      message: "Dados não fornecidos",
      payload: undefined,
    };

    // Tentativa de adição de dados no banco de dados Firebase Firestore
    const profissional = data as Profissional;
    if (hasAccountData(profissional)) {
      try {
        const doc = await colProfissionais.add(data);
        if (doc.id != undefined) {
          cResponse.status = "SUCCESS";
          cResponse.message = "Perfil de profissional inserido";
          cResponse.payload = JSON.stringify({ docId: doc.id });
        } else {
          cResponse.status = "ERROR";
          cResponse.message =
            "Não foi possível inserir o perfil do profissional";
          cResponse.payload = JSON.stringify({ errorDetail: "doc.id" });
        }
      } catch (e) {
        let exMessage;
        if (e instanceof Error) {
          exMessage = e.message;
        }
        functions.logger.error("Erro ao incluir perfil:", profissional.email);
        functions.logger.error("Exception: ", exMessage);
        cResponse.status = "ERROR";
        cResponse.message = "Erro ao incluir profissional - Verificar Logs";
        cResponse.payload = null;
      }
    }

    // Mensagem com informações sobre o resultado da função
    return JSON.stringify(cResponse);
  });

export const NotifyNewEmergency = functions
  .region("southamerica-east1")
  .firestore.document("emergencias/{userId}")
  .onCreate(async (snap) => {
    const newValue = snap.data();

    // Log para ver os dados da Emergencia
    console.log(newValue);

    const onProfissionais = await colProfissionais
      .where("status", "==", true)
      .get();

    // Pegar os dados de todos os Profissionais onlines
    onProfissionais.docs.forEach(async (doc) => {
      const fcmToken = doc.data().fcmToken;

      // Log para ver o fcmToken do Profissional
      console.log(fcmToken);
      if (fcmToken != undefined) {
        try {
          const message = {
            data: {
              nome: newValue.nome,
              telefone: newValue.telefone,
              fotos: newValue.fotos,
              status: "NOVA",
              descricao: newValue.descricao,
              dataHora: newValue.dataHora,
              id: snap.id,
            },
            token: fcmToken,
          };
          // Log para ver a montagem da mensagem
          console.log(message);
          const messageId = await app.messaging().send(message);

          // Log para ver o Id da mensagem enviada
          console.log(messageId);
        } catch (e) {
          log(e);
        }
      }
    });
  });

// TODO: Utilizar multicast na funcao acima
// exports.OnCreateEmergence = functions.firestore
//   .document("energencias/{userId}")
//   .onCreate(async (snap, context) => {
//     const newValue = snap.data();

//     const res = await colProfissionais.where("status", "==", true).get();
//     const tokens = res.docs.map((doc) => doc.data().fcmToken);
//     console.log(tokens);
//     const message = {
//       data: {
//         text: "Nova Emergencia",
//       },
//       tokens: tokens,
//       newValue,
//     };
//     try {
//       await app.messaging().sendMulticast(message);
//     } catch (e) {
//       console.log("Erro", e);
//     }
//   });

export const responderChamado = functions

  // Seleção da região que a função irá ficar
  .region("southamerica-east1")

  // Habilitar a checagem de aplicativo ou não
  .runWith({ enforceAppCheck: false })

  // Seleçõa do tipo de chamda da função
  .https.onCall(async (data) => {
    const cResponse: CustomResponse = {
      status: "ERROR",
      message: "Dados não fornecidos",
      payload: undefined,
    };

    // Tentativa de adição de dados no banco de dados Firebase Firestore
    try {
      const doc = await colRespostas.add(data);
      if (doc.id != undefined) {
        cResponse.status = "SUCCESS";
        cResponse.message = "Resposta inserida";
        cResponse.payload = JSON.stringify({ docId: doc.id });
      } else {
        cResponse.status = "ERROR";
        cResponse.message = "Não foi possível inserir a resposta da emergencia";
        cResponse.payload = JSON.stringify({ errorDetail: "doc.id" });
      }
    } catch (e) {
      let exMessage;
      if (e instanceof Error) {
        exMessage = e.message;
      }
      functions.logger.error("Erro ao incluir resposta:", data.email);
      functions.logger.error("Exception: ", exMessage);
      cResponse.status = "ERROR";
      cResponse.message = "Erro ao incluir resposta - Verificar Logs";
      cResponse.payload = null;
    }

    // Mensagem com informações sobre o resultado da função
    return JSON.stringify(cResponse);
  });
