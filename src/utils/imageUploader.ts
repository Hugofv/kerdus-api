import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

export async function downloadAndUploadImage(
  url: string,
  bucketFolder: string,
  fileName: string
): Promise<string> {
  try {
    const res = await axios.get(url, {
      responseType: 'arraybuffer',
      validateStatus: (status) => status === 200,
    });
    const fullPath = `${bucketFolder}/${fileName}`;

    const { error } = await supabase.storage
      .from('logos')
      .upload(fullPath, res.data, {
        contentType: 'image/png',
        upsert: true,
      });

    console.log(`Imagem ${fileName} salva com sucesso!`);
    if (error) throw error;

    return `${process.env.SUPABASE_URL}/storage/v1/object/public/logos/${fullPath}`;
  } catch (err: any) {
    console.error(`Erro ao salvar imagem ${fileName}:`, err.message);
    return url; // fallback para URL original se falhar
  }
}
