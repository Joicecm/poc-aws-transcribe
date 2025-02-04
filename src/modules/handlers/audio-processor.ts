import AWS from "aws-sdk";
import { S3Event } from "aws-lambda";

// configuração do cliente Transcribe e S3
const transcribeService = new AWS.TranscribeService({ region: "us-east-1" });

export const handler = async (event: S3Event): Promise<void> => {
  try {
    // Extrai informações do arquivo de áudio enviado ao S3
    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(
      event.Records[0].s3.object.key.replace(/\+/g, " ")
    );

    // Nome do job de transcrição (único)
    const jobName = `transcribe-job-${Date.now()}`;

    // Configuração do job (inclua custom vocabulary se necessário)
    const params = {
      TranscriptionJobName: jobName,
      MediaFormat: "m4a",
      LanguageCode: "pt-BR",
      Media: {
        MediaFileUri: `s3://${bucket}/${key}`,
      },
      OutputBucketName: "poc-aws-transcribe-test", // bucket de saída
      OutputKey: "transcriptions/", // pasta de saída

      // Para adicionar custom vocabulary
      Settings: { VocabularyName: "custom-vocabulary" },
    };

    // Inicia o job de transcrição
    const data = await transcribeService
      .startTranscriptionJob(params)
      .promise();
    console.log("Trabalho de transcrição iniciado com sucesso:", data);
  } catch (error) {
    console.error("Erro ao processar áudio", error);
  }
};
