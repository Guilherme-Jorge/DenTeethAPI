import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

// Inicializa o firebase-admin app
const app = admin.initializeApp();

// Inicializa o Firestore Database
const db = app.firestore();

// Salva acesso às coleções no Firestore Database
const colProfissionais = db.collection("profissionais");

const colEmergencias = db.collection("emergencias");

const colAvaliacao = db.collection("avaliacao");

const colRespostas = db.collection("respostas");

type Profissional = {
  nome: string;
  email: string;
  telefone: string;
  endereco1: string;
  endereco2: string | undefined;
  endereco3: string | undefined;
  curriculo: string;
  perfil: string | undefined;
  status: string;
  criado: string | undefined;
  fcmToken: string | undefined;
  uid: string;
};

type Emergencia = {
  nome: string;
  telefone: string;
  fotos: [string, string, string];
  descricao: string;
  status: string;
  dataHora: Timestamp;
  fcmToken: string | undefined;
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

function hasEmergenciaData(data: Emergencia) {
  if (
    data.nome != undefined &&
    data.telefone != undefined &&
    data.fotos != undefined &&
    data.descricao != undefined &&
    data.status != undefined &&
    data.dataHora != undefined &&
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

export const adcionarFotoPerfil = functions

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

    const profissional = await colProfissionais
      .where("uid", "==", data.uid)
      .get();

    // Tentativa de adição de dados no banco de dados Firebase Firestore
    try {
      const doc = await colProfissionais
        .doc(profissional.docs[0].id)
        .set({ perfil: data.uri }, { merge: true });
      if (doc != undefined) {
        cResponse.status = "SUCCESS";
        cResponse.message = "Perfil de profissional editado com sucesso";
        cResponse.payload = JSON.stringify({ docId: doc.writeTime });
      } else {
        cResponse.status = "ERROR";
        cResponse.message = "Não foi possível editar o perfil do profissional";
        cResponse.payload = JSON.stringify({
          errorDetail: profissional.docs[0].id,
        });
      }
    } catch (e) {
      let exMessage;
      if (e instanceof Error) {
        exMessage = e.message;
      }
      functions.logger.error("Erro ao editar perfil:", profissional);
      functions.logger.error("Exception: ", exMessage);
      cResponse.status = "ERROR";
      cResponse.message =
        "Erro ao editar perfil do profissional - Verificar Logs";
      cResponse.payload = null;
    }

    // Mensagem com informações sobre o resultado da função
    return JSON.stringify(cResponse);
  });

export const finalizarCriarConta = functions

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

    const profissional = await colProfissionais
      .where("uid", "==", data.uid)
      .get();

    // Tentativa de adição de dados no banco de dados Firebase Firestore
    try {
      const doc = await colProfissionais
        .doc(profissional.docs[0].id)
        .set({ criado: data.criado }, { merge: true });
      if (doc != undefined) {
        cResponse.status = "SUCCESS";
        cResponse.message = "Perfil de profissional editado com sucesso";
        cResponse.payload = JSON.stringify({ docId: doc.writeTime });
      } else {
        cResponse.status = "ERROR";
        cResponse.message = "Não foi possível editar o perfil do profissional";
        cResponse.payload = JSON.stringify({
          errorDetail: profissional.docs[0].id,
        });
      }
    } catch (e) {
      let exMessage;
      if (e instanceof Error) {
        exMessage = e.message;
      }
      functions.logger.error("Erro ao editar perfil:", profissional);
      functions.logger.error("Exception: ", exMessage);
      cResponse.status = "ERROR";
      cResponse.message =
        "Erro ao editar perfil do profissional - Verificar Logs";
      cResponse.payload = null;
    }

    // Mensagem com informações sobre o resultado da função
    return JSON.stringify(cResponse);
  });

// * Mandar notificação de nova emergência
export const notifyNovaEmergencia = functions

  // Seleção da região que a função irá ficar
  .region("southamerica-east1")

  // Seleçõa do tipo de chamda da função
  .firestore.document("emergencias/{userId}")
  .onCreate(async (snap, context) => {
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
        type: "novaEmergencia",
        nome: newValue.nome,
        telefone: newValue.telefone,
        fotos1: newValue.fotos[0],
        fotos2: newValue.fotos[1],
        fotos3: newValue.fotos[2],
        status: newValue.status,
        descricao: newValue.descricao,
        fcmToken: newValue.fcmToken,
        id: context.params.userId,
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

    const dataProfissional = await colProfissionais
      .where("uid", "==", data.profissional)
      .get();

    const resposta = {
      dataHora: admin.firestore.Timestamp.now(),
      emergencia: data.emergencia,
      profissional: data.profissional,
      status: data.status,
      nome: dataProfissional.docs[0].data().nome,
      telefone: dataProfissional.docs[0].data().telefone,
      perfil: dataProfissional.docs[0].data().perfil,
    };

    // Tentativa de adição de dados no banco de dados Firebase Firestore
    try {
      const doc = await colRespostas.add(resposta);
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

export const enviarEmergencia = functions
  .region("southamerica-east1")
  .https.onCall(async (data) => {
    const cResponse: CustomResponse = {
      status: "ERROR",
      message: "Dados não fornecidos",
      payload: undefined,
    };

    // Tentativa de adição de dados no banco de dados Firebase Firestore
    const emergencia: Emergencia = {
      nome: data.nome,
      telefone: data.telefone,
      fotos: data.fotos,
      descricao: data.descricao,
      status: "NOVA",
      dataHora: admin.firestore.Timestamp.now(),
      fcmToken: data.fcmToken,
    };

    if (hasEmergenciaData(emergencia)) {
      try {
        const doc = await colEmergencias.add(emergencia);

        if (doc.id != undefined) {
          cResponse.status = "SUCCESS";
          cResponse.message = "Emergência inserida com sucesso";
          cResponse.payload = JSON.stringify({ docId: doc.id });
        } else {
          cResponse.status = "ERROR";
          cResponse.message = "Não foi possível inserir a emergência";
          cResponse.payload = JSON.stringify({ errorDetail: doc.parent });
        }
      } catch (e) {
        let exMessage;
        if (e instanceof Error) {
          exMessage = e.message;
        }
        functions.logger.error(
          "Erro ao incluir emergência:",
          emergencia.telefone
        );
        functions.logger.error("Exception: ", exMessage);
        cResponse.status = "ERROR";
        cResponse.message = "Erro ao incluir emergência - Verificar Logs";
        cResponse.payload = null;
      }
    }

    // Mensagem com informações sobre o resultado da função
    return JSON.stringify(cResponse);
  });

export const updateTokenProfissional = functions

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

    const profissional = await colProfissionais
      .where("uid", "==", data.uid)
      .get();

    // Tentativa de adição de dados no banco de dados Firebase Firestore
    try {
      const doc = await colProfissionais
        .doc(profissional.docs[0].id)
        .set({ fcmToken: data.fcmToken }, { merge: true });
      if (doc != undefined) {
        cResponse.status = "SUCCESS";
        cResponse.message = "Perfil de profissional editado com sucesso";
        cResponse.payload = JSON.stringify({ docId: doc.writeTime });
      } else {
        cResponse.status = "ERROR";
        cResponse.message = "Não foi possível editar o perfil do profissional";
        cResponse.payload = JSON.stringify({
          errorDetail: profissional.docs[0].id,
        });
      }
    } catch (e) {
      let exMessage;
      if (e instanceof Error) {
        exMessage = e.message;
      }
      functions.logger.error("Erro ao editar perfil:", profissional);
      functions.logger.error("Exception: ", exMessage);
      cResponse.status = "ERROR";
      cResponse.message =
        "Erro ao editar perfil do profissional - Verificar Logs";
      cResponse.payload = null;
    }

    // Mensagem com informações sobre o resultado da função
    return JSON.stringify(cResponse);
  });

export const notificarProfissional = functions

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

    const dataProfissional = await colProfissionais
      .where("uid", "==", data.profissional)
      .get();

    // Dados que serão mandados aos profissionais
    const message = {
      data: {
        type: "telefone",
        texto: "Mensagem do telefone recebida.",
        telefone: data.telefone,
        fcmToken: data.fcmToken,
      },
      token: dataProfissional.docs[0].data().fcmToken,
    };

    // Tentativa de mandar a notificação
    try {
      const messageId = await app.messaging().send(message);
      if (messageId != undefined) {
        cResponse.status = "SUCCESS";
        cResponse.message = "Emergência notificada aos profissionais";
        cResponse.payload = JSON.stringify({
          messageId: messageId,
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

export const enviarDadosMapa = functions

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

    let dataProfissional;

    if (data.app == "socorrista") {
      dataProfissional = await colProfissionais
        .where("uid", "==", data.profissional).get();
    }

    // Dados que serão mandados aos profissionais
    const message = {
      notification: {
        title: "DenTeeth",
        body: "Você recebeu a localização do atendimento!",
      },
      data: {
        type: "mapa",
        titulo: data.titulo,
        endereco: data.endereco,
        lat: data.lat,
        lng: data.lng,
      },
      token: data.app == "socorrista" ?
        dataProfissional?.docs[0].data().fcmToken : data.fcmToken,
    };

    // Tentativa de mandar a notificação
    try {
      const messageId = await app.messaging().send(message);
      if (messageId != undefined) {
        cResponse.status = "SUCCESS";
        cResponse.message = "Emergência notificada aos profissionais";
        cResponse.payload = JSON.stringify({
          messageId: messageId,
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

export const enviarAvaliacao = functions
  .region("southamerica-east1")
  .https.onCall(async (data) => {
    const cResponse: CustomResponse = {
      status: "ERROR",
      message: "Dados não fornecidos",
      payload: undefined,
    };

    // Tentativa de adição de dados no banco de dados Firebase Firestore
    const avaliacao = {
      notaAvaliacao: data.notaAvaliacao,
      textoAvalicao: data.textoAvaliacao,
      notaApp: data.notaApp,
      textoApp: data.textoApp,
      profissional: data.profissional,
      fcmToken: data.fcmToken,
    };

    try {
      const doc = await colAvaliacao.add(avaliacao);

      if (doc.id != undefined) {
        cResponse.status = "SUCCESS";
        cResponse.message = "Avaliação inserida com sucesso";
        cResponse.payload = JSON.stringify({ docId: doc.id });
      } else {
        cResponse.status = "ERROR";
        cResponse.message = "Não foi possível inserir a avaliação";
        cResponse.payload = JSON.stringify({ errorDetail: doc.parent });
      }
    } catch (e) {
      let exMessage;
      if (e instanceof Error) {
        exMessage = e.message;
      }
      functions.logger.error("Exception: ", exMessage);
      cResponse.status = "ERROR";
      cResponse.message = "Erro ao incluir avaliação - Verificar Logs";
      cResponse.payload = null;
    }

    // Mensagem com informações sobre o resultado da função
    return JSON.stringify(cResponse);
  });

export const alterarStatusProfissional = functions

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

    const profissional = await colProfissionais
      .where("uid", "==", data.uid)
      .get();

    // Tentativa de adição de dados no banco de dados Firebase Firestore
    try {
      const doc = await colProfissionais
        .doc(profissional.docs[0].id)
        .set({ status: data.status }, { merge: true });
      if (doc != undefined) {
        cResponse.status = "SUCCESS";
        cResponse.message = "Perfil de profissional editado com sucesso";
        cResponse.payload = JSON.stringify({ docId: doc.writeTime });
      } else {
        cResponse.status = "ERROR";
        cResponse.message = "Não foi possível editar o perfil do profissional";
        cResponse.payload = JSON.stringify({
          errorDetail: profissional.docs[0].id,
        });
      }
    } catch (e) {
      let exMessage;
      if (e instanceof Error) {
        exMessage = e.message;
      }
      functions.logger.error("Erro ao editar perfil:", profissional);
      functions.logger.error("Exception: ", exMessage);
      cResponse.status = "ERROR";
      cResponse.message =
        "Erro ao editar perfil do profissional - Verificar Logs";
      cResponse.payload = null;
    }

    // Mensagem com informações sobre o resultado da função
    return JSON.stringify(cResponse);
  });

export const notificarAvaliacao = functions

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

    // Dados que serão mandados aos profissionais
    const message = {
      notification: {
        title: "DenTeeth",
        body: "Avalie o atendimento agora!",
      },
      data: {
        type: "avaliacao",
        profissional: data.profissional,
      },
      token: data.fcmToken,
    };

    // Tentativa de mandar a notificação
    try {
      const messageId = await app.messaging().send(message);
      if (messageId != undefined) {
        cResponse.status = "SUCCESS";
        cResponse.message = "Avaliação enviada para o Socorrista";
        cResponse.payload = JSON.stringify({
          messageId: messageId,
        });
      } else {
        cResponse.status = "ERROR";
        cResponse.message = "Não foi possível notificar o Socorrista";
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

