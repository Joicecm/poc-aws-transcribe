import { S3Event } from "aws-lambda";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client({ region: "us-east-1" });

export const handler = async (event: S3Event): Promise<void> => {
  try {
    //Extrai informações do arquivo de áudio enviado ao s3
    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(
      event.Records[0].s3.object.key.replace(/\+/g, " ")
    );

    //busca o arquivo JSON do s3
    const getObjectCommand = new GetObjectCommand({ Bucket: bucket, Key: key });

    const response = await s3Client.send(getObjectCommand);

    const result = await response.Body?.transformToString();

    if (result) {
      const transcript = JSON.parse(result).results.transcripts[0].transcript;
      console.log("transcrição concluída:", transcript);
    }
  } catch (error) {
    console.error("erro ao processar resultado", error);
    throw error;
  }
};
