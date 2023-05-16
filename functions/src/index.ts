import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Inicializa o firebase-admin app
const app = admin.initializeApp();

// Inicializa o Firestore Database
const db = app.firestore();

// Salva acesso às coleções no Firestore Database
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

// * Salvar dados do profissional ao criar sua conta
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
          cResponse.payload = JSON.stringify({ errorDetail: doc.id });
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

// * Mandar notificação de nova emergência
export const NotifyNewEmergency = functions

  // Seleção da região que a função irá ficar
  .region("southamerica-east1")

  // Seleçõa do tipo de chamda da função
  .firestore.document("emergencias/{userId}")
  .onCreate(async (snap) => {
    const cResponse: CustomResponse = {
      status: "ERROR",
      message: "Dados não fornecidos",
      payload: undefined,
    };

    // Documento que foi adcionado agora
    const newValue = snap.data();

    // Seleção de profissionais com o status disponível
    const onProfissionais = await colProfissionais
      .where("status", "==", true)
      .get();

    // Agrupamento dos FCMTokens dos profissionais
    const tokens = onProfissionais.docs.map((doc) => doc.data().fcmToken);

    // Dados que serão mandados aos profissionais
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
      tokens: tokens,
    };

    // Tentativa de mandar a notificação
    try {
      const messageId = await app.messaging().sendMulticast(message);
      if (messageId != undefined) {
        cResponse.status = "SUCCESS";
        cResponse.message = "Emergência notificada aos profissionais";
        cResponse.payload = JSON.stringify({
          messageSuccess: messageId.successCount,
          messageFailure: messageId.failureCount,
          messageResponses: messageId.responses,
        });
      } else {
        cResponse.status = "ERROR";
        cResponse.message = "Não foi possível notificar os profissionais";
        cResponse.payload = JSON.stringify({ errorDetail: messageId });
      }
    } catch (e) {
      let exMessage;
      if (e instanceof Error) {
        exMessage = e.message;
      }
      functions.logger.error("Erro ao notificar profissionais:", exMessage);
      cResponse.status = "ERROR";
      cResponse.message = "Erro ao notificar usuários - Verificar Logs";
      cResponse.payload = null;
    }

    // Mensagem com informações sobre o resultado da função
    return JSON.stringify(cResponse);
  });

// * Adcionar a resposta do chamado de emergência
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
