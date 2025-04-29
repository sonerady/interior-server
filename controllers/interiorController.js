const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { createClient } = require("@supabase/supabase-js");

// Supabase istemcisini oluştur
const supabaseUrl =
  process.env.SUPABASE_URL || "https://egpfenrpripkjpemjxtg.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Kullanıcının gönderdiği kısa stilden detaylı tek cümlelik bir prompt üretmek için Gemini API kullanan yardımcı fonksiyon
async function createPromptWithGemini(userPrompt) {
  try {
    if (!userPrompt) {
      throw new Error("userPrompt boş olamaz");
    }
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY çevre değişkeni bulunamadı");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let promptContent;

    try {
      // Görüntüyle prompt oluşturmayı dene
      const emptyRoomImagePath = path.join(
        __dirname,
        "../assets/empty-interior-room.png"
      );

      // Görüntünün varlığını kontrol et
      if (!fs.existsSync(emptyRoomImagePath)) {
        throw new Error(`Boş oda görüntüsü bulunamadı: ${emptyRoomImagePath}`);
      }

      console.log(
        `Boş oda görüntüsünü base64 formatına dönüştürüyorum: ${emptyRoomImagePath}`
      );

      // Görüntüyü binary olarak oku
      const imageBuffer = fs.readFileSync(emptyRoomImagePath);

      // Binary veriyi base64'e çevir
      const base64Image = imageBuffer.toString("base64");

      console.log(
        `Görüntü base64 formatına dönüştürüldü, boyut: ${base64Image.length} karakter`
      );

      // Görüntüyle içerik isteğini oluştur - inlineData kullanarak
      promptContent = [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        },
        {
          text: `TASK: Analyze the provided room photograph METICULOUSLY and generate an extremely detailed interior design prompt based on the user's desired style: "${userPrompt}".

STRICT RULES & CONSTRAINTS:
1.  **ARCHITECTURAL FIDELITY (CRITICAL RULE):** You MUST strictly adhere to the VISIBLE existing architectural structure shown in the photograph. The position, shape, size, and type of walls, windows, doors, ceilings, floors, and any other fixed structural elements (columns, niches, etc.) MUST NOT be altered. Describe these existing elements accurately within the prompt.
2.  **PROHIBITIONS:** DO NOT add new windows, doors, walls, balconies, or stairs. DO NOT change the size, shape, or location of existing ones. DO NOT alter the ceiling height or type. DO NOT invent or describe exterior views (cityscape, nature, etc.) UNLESS they are CLEARLY VISIBLE through the windows in the original photograph. If the view is not visible or unclear, MAKE NO ASSUMPTIONS and DO NOT ADD a view description. Maintain the room's fundamental geometry and proportions.
3.  **FOCUS:** Your task is SOLELY interior decoration and furnishing. Based on the user's style ("${userPrompt}"), populate the room ONLY with furniture (sofas, tables, chairs), lighting fixtures (chandeliers, lamps), rugs/carpets, window treatments (curtains, blinds), plants, artwork, shelves, accessories, and decorative objects.
4.  **PLACEMENT:** Describe the placement and arrangement of all furniture and objects LOGICALLY and REALISTICALLY within the actual dimensions and layout of the room shown in the photograph. Clearly state the relationships between items (e.g., "a coffee table placed in front of the sofa," "a reading nook positioned by the window").
5.  **DETAIL LEVEL:** Richly describe the color palette, materials (wood types, metal finishes, fabric textures), textures, lighting atmosphere (natural light as visible, artificial sources, shadows), and overall ambiance in a descriptive and fluid manner.
6.  **FORMAT:** Write the entire description as ONE CONTINUOUS SENTENCE. DO NOT use bullet points, numbering, or multiple paragraphs. The sentence MUST begin with "Design a...".
7.  **LENGTH & QUALITY:** The prompt should aim for significant detail (conceptually around 500+ words, focus on richness), be visually descriptive, and flow naturally, as if instructing an artist to recreate the scene precisely.
8.  **NO LUXURY EMPHASIS:** Avoid terms implying excessive luxury, opulence, or extravagance.

Produce ONLY the single-sentence prompt text adhering strictly to all rules above. Output no other introductory or concluding text.`,
        },
      ];
    } catch (imageError) {
      console.warn(
        "Görüntü işleme başarısız, metin tabanlı prompt kullanılacak:",
        imageError.message
      );

      // Sadece metin tabanlı promptu kullan (görüntüsüz)
      promptContent = [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        },
        {
          text: `TASK: Analyze the provided room photograph METICULOUSLY and generate an extremely detailed interior design prompt based on the user's desired style: "${userPrompt}".

STRICT RULES & CONSTRAINTS:
1.  **ARCHITECTURAL FIDELITY (CRITICAL RULE):** You MUST strictly adhere to the VISIBLE existing architectural structure shown in the photograph. The position, shape, size, and type of walls, windows, doors, ceilings, floors, and any other fixed structural elements (columns, niches, etc.) MUST NOT be altered. Describe these existing elements accurately within the prompt.
2.  **PROHIBITIONS:** DO NOT add new windows, doors, walls, balconies, or stairs. DO NOT change the size, shape, or location of existing ones. DO NOT alter the ceiling height or type. DO NOT invent or describe exterior views (cityscape, nature, etc.) UNLESS they are CLEARLY VISIBLE through the windows in the original photograph. If the view is not visible or unclear, MAKE NO ASSUMPTIONS and DO NOT ADD a view description. Maintain the room's fundamental geometry and proportions.
3.  **FOCUS:** Your task is SOLELY interior decoration and furnishing. Based on the user's style ("${userPrompt}"), populate the room ONLY with furniture (sofas, tables, chairs), lighting fixtures (chandeliers, lamps), rugs/carpets, window treatments (curtains, blinds), plants, artwork, shelves, accessories, and decorative objects.
4.  **PLACEMENT:** Describe the placement and arrangement of all furniture and objects LOGICALLY and REALISTICALLY within the actual dimensions and layout of the room shown in the photograph. Clearly state the relationships between items (e.g., "a coffee table placed in front of the sofa," "a reading nook positioned by the window").
5.  **DETAIL LEVEL:** Richly describe the color palette, materials (wood types, metal finishes, fabric textures), textures, lighting atmosphere (natural light as visible, artificial sources, shadows), and overall ambiance in a descriptive and fluid manner.
6.  **FORMAT:** Write the entire description as ONE CONTINUOUS SENTENCE. DO NOT use bullet points, numbering, or multiple paragraphs. The sentence MUST begin with "Design a...".
7.  **LENGTH & QUALITY:** The prompt should aim for significant detail (conceptually around 500+ words, focus on richness), be visually descriptive, and flow naturally, as if instructing an artist to recreate the scene precisely.
8.  **NO LUXURY EMPHASIS:** Avoid terms implying excessive luxury, opulence, or extravagance.

Produce ONLY the single-sentence prompt text adhering strictly to all rules above. Output no other introductory or concluding text.`,
        },
      ];
    }

    console.log("Gemini 1.5 Flash'e istek gönderiliyor...");

    // İsteği Gemini'ye gönder
    const promptResponse = await model.generateContent(promptContent);
    let generatedPrompt = promptResponse.response.text();

    // Gereksiz giriş kısımlarını temizle
    generatedPrompt = generatedPrompt
      .replace(
        /^(certainly|here is|here's|sure|of course|elbette)(!|,|:|\.)\s*/i,
        ""
      )
      .replace(/^(the|a) prompt( would be| is)(:|\.)?\s*/i, "")
      .replace(/^(here is|here's) (the|a) prompt( for you)?(:|\.)?\s*/i, "")
      .replace(/^prompt(:|\.)?\s*/i, "")
      .trim();

    console.log("==== GEMİNİ TARAFINDAN OLUŞTURULAN PROMPT - BAŞLANGIÇ ====");
    console.log(generatedPrompt);
    console.log("==== GEMİNİ TARAFINDAN OLUŞTURULAN PROMPT - SON ====");

    return generatedPrompt;
  } catch (err) {
    console.error("Gemini prompt üretimi başarısız:", err.message);
    throw new Error(`Gemini prompt oluşturma hatası: ${err.message}`);
  }
}

// İç mekan tasarımı oluştur
exports.generateInterior = async (req, res) => {
  try {
    console.log("generateInterior fonksiyonu başlatıldı");

    // İsteğin body'sinden parametreleri al
    const {
      prompt,
      steps = 50,
      guidance = 60,
      outpaint = "None",
      safety_tolerance = 2,
      prompt_upsampling = false,
    } = req.body;

    console.log("İstek parametreleri:", {
      prompt,
      steps,
      guidance,
      outpaint,
      safety_tolerance,
      prompt_upsampling,
    });

    // Dosyaları kontrol et
    if (!req.files) {
      console.error("Hiç dosya yüklenmedi");
      return res.status(400).json({
        success: false,
        error: "Hiç dosya yüklenmedi",
      });
    }

    if (!req.files.image) {
      console.error("Orijinal görüntü yüklenmedi");
      return res.status(400).json({
        success: false,
        error: "Orijinal görüntü yüklenmelidir",
      });
    }

    if (!req.files.mask) {
      console.error("Maske görüntüsü yüklenmedi");
      return res.status(400).json({
        success: false,
        error: "Maske görüntüsü yüklenmelidir",
      });
    }

    // Prompt kontrol et
    if (!prompt) {
      console.error("Prompt sağlanmadı");
      return res.status(400).json({
        success: false,
        error: "Prompt gereklidir",
      });
    }

    // Gemini ile detaylı prompt oluştur
    let geminiPromptUrl;
    try {
      geminiPromptUrl = await createPromptWithGemini(prompt);
      console.log(
        "Gemini tarafından oluşturulan prompt (URL versiyonu):",
        geminiPromptUrl
      );
    } catch (gErr) {
      console.error("Gemini prompt oluşturulamadı:", gErr);
      return res.status(500).json({
        success: false,
        error: `Gemini prompt oluşturulamadı: ${gErr.message}`,
      });
    }

    // Dosya yollarını al
    const imagePath = req.files.image[0].path;
    const maskPath = req.files.mask[0].path;

    console.log("Dosya yolları:", { imagePath, maskPath });

    // Dosyaların varlığını kontrol et
    if (!fs.existsSync(imagePath)) {
      console.error(`Orijinal görüntü dosyası bulunamadı: ${imagePath}`);
      return res.status(500).json({
        success: false,
        error: `Orijinal görüntü dosyası bulunamadı: ${imagePath}`,
      });
    }

    if (!fs.existsSync(maskPath)) {
      console.error(`Maske görüntü dosyası bulunamadı: ${maskPath}`);
      return res.status(500).json({
        success: false,
        error: `Maske görüntü dosyası bulunamadı: ${maskPath}`,
      });
    }

    // Dosyaların tam URL'lerini oluştur
    const imageUrl = `${req.protocol}://${req.get("host")}/${imagePath
      .replace(/\\/g, "/")
      .replace("uploads/", "uploads/")}`;
    const maskUrl = `${req.protocol}://${req.get("host")}/${maskPath
      .replace(/\\/g, "/")
      .replace("uploads/", "uploads/")}`;

    console.log(`Image URL: ${imageUrl}`);
    console.log(`Mask URL: ${maskUrl}`);

    // Replicate API isteği için gövdeyi hazırla
    const requestBody = {
      input: {
        mask: maskUrl,
        image: imageUrl,
        steps: parseInt(steps),
        prompt: geminiPromptUrl,
        guidance: parseInt(guidance),
        outpaint: outpaint,
        output_format: "jpg",
        safety_tolerance: parseInt(safety_tolerance),
        prompt_upsampling:
          prompt_upsampling === "true" || prompt_upsampling === true,
      },
    };

    console.log(
      "Replicate API isteği gönderiliyor:",
      JSON.stringify(requestBody, null, 2)
    );

    // API token'ın varlığını kontrol et
    if (!process.env.REPLICATE_API_TOKEN) {
      console.error("REPLICATE_API_TOKEN çevre değişkeni bulunamadı");
      return res.status(500).json({
        success: false,
        error: "API yapılandırması eksik: REPLICATE_API_TOKEN bulunamadı",
      });
    }

    // Replicate API'sine doğrudan istekte bulun
    const replicateUrl =
      "https://api.replicate.com/v1/models/black-forest-labs/flux-fill-pro/predictions";
    console.log(`Replicate API endpoint: ${replicateUrl}`);

    let response;
    try {
      response = await fetch(replicateUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json",
          Prefer: "wait",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("Replicate API yanıt statüsü:", response.status);
    } catch (fetchError) {
      console.error("Replicate API bağlantı hatası:", fetchError);
      throw new Error(`Replicate API bağlantı hatası: ${fetchError.message}`);
    }

    // API yanıtı kontrol et
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.text();
        console.error("Replicate API hata yanıtı:", errorData);
      } catch (err) {
        console.error("Hata yanıtı çözümlenemedi:", err);
        errorData = "Hata yanıtı alınamadı";
      }

      throw new Error(
        `Replicate API hatası: ${response.status} ${response.statusText}\n${errorData}`
      );
    }

    // Başarılı yanıtı JSON olarak al
    let data;
    try {
      data = await response.json();
      console.log("Replicate API yanıtı:", JSON.stringify(data, null, 2));
    } catch (jsonError) {
      console.error("Yanıt JSON olarak çözümlenemedi:", jsonError);
      throw new Error(
        `API yanıtı JSON olarak çözümlenemedi: ${jsonError.message}`
      );
    }

    // Yanıtın doğru formatta olduğunu kontrol et
    let outputUrl = null;

    if (data.output) {
      console.log("Output doğrudan alındı:", data.output);
      outputUrl = data.output;
    } else if (data.status === "succeeded" && data.urls && data.urls.get) {
      console.log("Get URL'i kullanılıyor:", data.urls.get);

      // Tamamlanan tahmin için get URL'sini al
      let getResponse;
      try {
        getResponse = await fetch(data.urls.get, {
          headers: {
            Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
          },
        });

        if (!getResponse.ok) {
          throw new Error(
            `Get yanıtı alınamadı: ${getResponse.status} ${getResponse.statusText}`
          );
        }

        const getResponseData = await getResponse.json();
        console.log("Get yanıtı:", JSON.stringify(getResponseData, null, 2));

        if (getResponseData.output) {
          outputUrl = getResponseData.output;
        } else {
          console.warn("Get yanıtında output alanı bulunamadı");
          outputUrl = "Çıktı URL'i alınamadı";
        }
      } catch (getError) {
        console.error("Get URL'i işlenirken hata:", getError);
        throw new Error(`Get URL'i işleme hatası: ${getError.message}`);
      }
    } else if (data.status === "processing") {
      console.log("İşlem hala devam ediyor, durum:", data.status);
      outputUrl = "İşlem devam ediyor, sonuç henüz hazır değil.";
    } else {
      console.warn("Beklenmeyen API yanıt formatı:", data);
      outputUrl = "API yanıt formatı beklendiği gibi değil.";
    }

    // Eğer geçerli bir URL aldıysak, Clarity Upscaler'a gönder
    let enhancedImageUrl = null;
    let isEnhanced = false; // Görüntünün iyileştirilip iyileştirilmediği bilgisi

    // URL'in Clarity'den gelip gelmediğini kontrol et
    const isFromClarity =
      outputUrl &&
      outputUrl.includes("replicate") &&
      (outputUrl.includes(
        "dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e"
      ) ||
        outputUrl.includes("clarity"));

    if (isFromClarity) {
      console.log(
        "Görüntü zaten Clarity tarafından işlenmiş, tekrar işlenmeyecek:",
        outputUrl
      );
      enhancedImageUrl = outputUrl;
      isEnhanced = true; // Görüntü zaten iyileştirilmiş
    } else if (
      outputUrl &&
      typeof outputUrl === "string" &&
      outputUrl.startsWith("http")
    ) {
      try {
        console.log("Clarity Upscaler API'ye görüntü gönderiliyor:", outputUrl);

        const clarityPrompt = `${geminiPromptUrl}, masterpiece, best quality, highres, <lora:more_details:0.5> <lora:SDXLrender_v2.0:1>`;

        const clarityRequestBody = {
          input: {
            seed: 1337,
            image: outputUrl,
            prompt: clarityPrompt,
            dynamic: 6,
            handfix: "disabled",
            pattern: false,
            sharpen: 0,
            sd_model: "juggernaut_reborn.safetensors [338b85bc4f]",
            scheduler: "DPM++ 3M SDE Karras",
            creativity: 1,
            lora_links: "",
            downscaling: false,
            resemblance: 0.45,
            scale_factor: 6,
            tiling_width: 112,
            output_format: "png",
            tiling_height: 144,
            custom_sd_model: "",
            negative_prompt:
              "(worst quality, low quality, normal quality:2) JuggernautNegative-neg",
            num_inference_steps: 50,
            downscaling_resolution: 768,
          },
        };

        console.log(
          "Clarity Upscaler API isteği:",
          JSON.stringify(clarityRequestBody, null, 2)
        );

        const clarityResponse = await fetch(
          "https://api.replicate.com/v1/predictions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
              "Content-Type": "application/json",
              Prefer: "wait",
            },
            body: JSON.stringify({
              version:
                "dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e",
              input: {
                seed: 1337,
                image: outputUrl,
                prompt: clarityPrompt,
                dynamic: 6,
                handfix: "disabled",
                pattern: false,
                sharpen: 0,
                sd_model: "juggernaut_reborn.safetensors [338b85bc4f]",
                scheduler: "DPM++ 3M SDE Karras",
                creativity: 1,
                lora_links: "",
                downscaling: false,
                resemblance: 0.45,
                scale_factor: 6,
                tiling_width: 112,
                output_format: "png",
                tiling_height: 144,
                custom_sd_model: "",
                negative_prompt:
                  "(worst quality, low quality, normal quality:2) JuggernautNegative-neg",
                num_inference_steps: 50,
                downscaling_resolution: 768,
              },
            }),
          }
        );

        console.log("Clarity API yanıt statüsü:", clarityResponse.status);

        if (!clarityResponse.ok) {
          const errorData = await clarityResponse.text();
          console.error("Clarity API hata yanıtı:", errorData);
          throw new Error(
            `Clarity API hatası: ${clarityResponse.status} ${clarityResponse.statusText}`
          );
        }

        const clarityData = await clarityResponse.json();
        console.log(
          "Clarity API yanıtı:",
          JSON.stringify(clarityData, null, 2)
        );

        // Clarity API yanıtından URL'yi al
        if (clarityData.output && clarityData.output[0]) {
          enhancedImageUrl = clarityData.output[0];
          console.log("İyileştirilmiş görüntü URL:", enhancedImageUrl);
        } else if (
          clarityData.status === "succeeded" &&
          clarityData.urls &&
          clarityData.urls.get
        ) {
          // Tamamlanan tahmin için get URL'sini al
          const clarityGetResponse = await fetch(clarityData.urls.get, {
            headers: {
              Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
            },
          });

          if (!clarityGetResponse.ok) {
            throw new Error(
              `Clarity Get yanıtı alınamadı: ${clarityGetResponse.status}`
            );
          }

          const clarityGetData = await clarityGetResponse.json();

          if (clarityGetData.output && clarityGetData.output[0]) {
            enhancedImageUrl = clarityGetData.output[0];
            console.log("İyileştirilmiş görüntü URL (Get):", enhancedImageUrl);
          }
        }

        // Eğer başarılı bir şekilde iyileştirildiyse
        if (enhancedImageUrl) {
          isEnhanced = true;
        }
      } catch (clarityError) {
        console.error("Clarity Upscaler hatası:", clarityError);
        console.error("Hata stack:", clarityError.stack);
        console.warn(
          "Görüntü iyileştirme başarısız, orijinal görüntü kullanılacak"
        );
        // Hata durumunda orijinal görüntüyü kullanmaya devam et
      }
    }

    // API yanıtını JSON olarak gönder
    console.log(
      "İstemciye yanıt gönderiliyor, generated_image_url:",
      enhancedImageUrl || outputUrl,
      "enhanced:",
      isEnhanced
    );

    res.status(200).json({
      success: true,
      data: {
        generated_image_url: enhancedImageUrl || outputUrl,
        original_image_url: outputUrl,
        enhanced: isEnhanced,
        api_response: data,
        original_parameters: requestBody.input,
      },
    });
  } catch (error) {
    console.error("İç mekan tasarımı oluşturma hatası:", error);
    console.error("Hata stack:", error.stack);

    res.status(500).json({
      success: false,
      error: error.message || "Bir şeyler yanlış gitti!",
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
  }
};

// Çıktı görüntüsünü indir ve kaydet
exports.downloadGeneratedImage = async (url, filename) => {
  try {
    console.log(`Görüntü indirme başlatıldı: ${url}`);

    if (!url) {
      throw new Error("İndirilecek URL sağlanmadı");
    }

    let response;
    try {
      response = await fetch(url);
      console.log("Görüntü indirme yanıt statüsü:", response.status);

      if (!response.ok) {
        throw new Error(
          `Görüntü indirme başarısız: ${response.status} ${response.statusText}`
        );
      }
    } catch (fetchError) {
      console.error("Görüntü indirme bağlantı hatası:", fetchError);
      throw new Error(`Görüntü indirme bağlantı hatası: ${fetchError.message}`);
    }

    const buffer = await response.buffer();
    const filepath = path.join(__dirname, "../uploads", filename);

    console.log(`Görüntü kaydediliyor: ${filepath}`);
    fs.writeFileSync(filepath, buffer);

    console.log("Görüntü başarıyla indirildi ve kaydedildi");
    return filepath;
  } catch (error) {
    console.error("Görüntü indirme hatası:", error);
    console.error("Hata stack:", error.stack);
    throw new Error(`Görüntü indirilemedi: ${error.message}`);
  }
};

// URL'ler kullanarak iç mekan tasarımı oluştur (doğrudan URL'leri kullanarak)
exports.generateInteriorFromUrl = async (req, res) => {
  try {
    console.log("generateInteriorFromUrl fonksiyonu başlatıldı");
    console.log("Gelen istek body:", req.body);

    // İsteğin body'sinden parametreleri al
    const {
      imageUrl,
      maskUrl,
      prompt,
      steps = 50,
      guidance = 60,
      outpaint = "None",
      safety_tolerance = 2,
      prompt_upsampling = false,
    } = req.body;

    console.log("İstek parametreleri:", {
      imageUrl,
      maskUrl,
      prompt,
      steps,
      guidance,
      outpaint,
      safety_tolerance,
      prompt_upsampling,
    });

    // URL'leri kontrol et
    if (!imageUrl) {
      console.error("Orijinal görüntü URL'i sağlanmadı");
      return res.status(400).json({
        success: false,
        error: "Orijinal görüntü URL'i gereklidir",
      });
    }

    if (!maskUrl) {
      console.error("Maske görüntüsü URL'i sağlanmadı");
      return res.status(400).json({
        success: false,
        error: "Maske görüntüsü URL'i gereklidir",
      });
    }

    // Prompt kontrol et
    if (!prompt) {
      console.error("Prompt sağlanmadı");
      return res.status(400).json({
        success: false,
        error: "Prompt gereklidir",
      });
    }

    // Gemini ile detaylı prompt oluştur
    let geminiPromptUrl;
    try {
      geminiPromptUrl = await createPromptWithGemini(prompt);
      console.log(
        "Gemini tarafından oluşturulan prompt (URL versiyonu):",
        geminiPromptUrl
      );
    } catch (gErr) {
      console.error("Gemini prompt oluşturulamadı:", gErr);
      return res.status(500).json({
        success: false,
        error: `Gemini prompt oluşturulamadı: ${gErr.message}`,
      });
    }

    // Replicate API isteği için gövdeyi hazırla - doğrudan URL'leri kullan
    const requestBody = {
      input: {
        mask: maskUrl,
        image: imageUrl,
        steps: parseInt(steps),
        prompt: geminiPromptUrl,
        guidance: parseInt(guidance),
        outpaint: outpaint,
        output_format: "jpg",
        safety_tolerance: parseInt(safety_tolerance),
        prompt_upsampling:
          prompt_upsampling === "true" || prompt_upsampling === true,
      },
    };

    console.log(
      "Replicate API isteği gönderiliyor (doğrudan URL'ler ile):",
      JSON.stringify(requestBody, null, 2)
    );

    // API token'ın varlığını kontrol et
    if (!process.env.REPLICATE_API_TOKEN) {
      console.error("REPLICATE_API_TOKEN çevre değişkeni bulunamadı");
      return res.status(500).json({
        success: false,
        error: "API yapılandırması eksik: REPLICATE_API_TOKEN bulunamadı",
      });
    }

    // Replicate API'sine doğrudan istekte bulun
    const replicateUrl =
      "https://api.replicate.com/v1/models/black-forest-labs/flux-fill-pro/predictions";
    console.log(`Replicate API endpoint: ${replicateUrl}`);

    let response;
    try {
      response = await fetch(replicateUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json",
          Prefer: "wait",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("Replicate API yanıt statüsü:", response.status);
    } catch (fetchError) {
      console.error("Replicate API bağlantı hatası:", fetchError);
      throw new Error(`Replicate API bağlantı hatası: ${fetchError.message}`);
    }

    // API yanıtı kontrol et
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.text();
        console.error("Replicate API hata yanıtı:", errorData);
      } catch (err) {
        console.error("Hata yanıtı çözümlenemedi:", err);
        errorData = "Hata yanıtı alınamadı";
      }

      throw new Error(
        `Replicate API hatası: ${response.status} ${response.statusText}\n${errorData}`
      );
    }

    // Başarılı yanıtı JSON olarak al
    let data;
    try {
      data = await response.json();
      console.log("Replicate API yanıtı:", JSON.stringify(data, null, 2));
    } catch (jsonError) {
      console.error("Yanıt JSON olarak çözümlenemedi:", jsonError);
      throw new Error(
        `API yanıtı JSON olarak çözümlenemedi: ${jsonError.message}`
      );
    }

    // Yanıtın doğru formatta olduğunu kontrol et
    let outputUrl = null;

    if (data.output) {
      console.log("Output doğrudan alındı:", data.output);
      outputUrl = data.output;
    } else if (data.status === "succeeded" && data.urls && data.urls.get) {
      console.log("Get URL'i kullanılıyor:", data.urls.get);

      // Tamamlanan tahmin için get URL'sini al
      let getResponse;
      try {
        getResponse = await fetch(data.urls.get, {
          headers: {
            Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
          },
        });

        if (!getResponse.ok) {
          throw new Error(
            `Get yanıtı alınamadı: ${getResponse.status} ${getResponse.statusText}`
          );
        }

        const getResponseData = await getResponse.json();
        console.log("Get yanıtı:", JSON.stringify(getResponseData, null, 2));

        if (getResponseData.output) {
          outputUrl = getResponseData.output;
        } else {
          console.warn("Get yanıtında output alanı bulunamadı");
          outputUrl = "Çıktı URL'i alınamadı";
        }
      } catch (getError) {
        console.error("Get URL'i işlenirken hata:", getError);
        throw new Error(`Get URL'i işleme hatası: ${getError.message}`);
      }
    } else if (data.status === "processing") {
      console.log("İşlem hala devam ediyor, durum:", data.status);
      outputUrl = "İşlem devam ediyor, sonuç henüz hazır değil.";
    } else {
      console.warn("Beklenmeyen API yanıt formatı:", data);
      outputUrl = "API yanıt formatı beklendiği gibi değil.";
    }

    // Eğer geçerli bir URL aldıysak, Clarity Upscaler'a gönder
    let enhancedImageUrl = null;
    let isEnhanced = false; // Görüntünün iyileştirilip iyileştirilmediği bilgisi

    // URL'in Clarity'den gelip gelmediğini kontrol et
    const isFromClarity =
      outputUrl &&
      outputUrl.includes("replicate") &&
      (outputUrl.includes(
        "dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e"
      ) ||
        outputUrl.includes("clarity"));

    if (isFromClarity) {
      console.log(
        "Görüntü zaten Clarity tarafından işlenmiş, tekrar işlenmeyecek:",
        outputUrl
      );
      enhancedImageUrl = outputUrl;
      isEnhanced = true; // Görüntü zaten iyileştirilmiş
    } else if (
      outputUrl &&
      typeof outputUrl === "string" &&
      outputUrl.startsWith("http")
    ) {
      try {
        console.log("Clarity Upscaler API'ye görüntü gönderiliyor:", outputUrl);

        const clarityPrompt = `${geminiPromptUrl}, masterpiece, best quality, highres, <lora:more_details:0.5> <lora:SDXLrender_v2.0:1>`;

        const clarityRequestBody = {
          input: {
            seed: 1337,
            image: outputUrl,
            prompt: clarityPrompt,
            dynamic: 6,
            handfix: "disabled",
            pattern: false,
            sharpen: 0,
            sd_model: "juggernaut_reborn.safetensors [338b85bc4f]",
            scheduler: "DPM++ 3M SDE Karras",
            creativity: 1,
            lora_links: "",
            downscaling: false,
            resemblance: 0.45,
            scale_factor: 6,
            tiling_width: 112,
            output_format: "png",
            tiling_height: 144,
            custom_sd_model: "",
            negative_prompt:
              "(worst quality, low quality, normal quality:2) JuggernautNegative-neg",
            num_inference_steps: 50,
            downscaling_resolution: 768,
          },
        };

        console.log(
          "Clarity Upscaler API isteği:",
          JSON.stringify(clarityRequestBody, null, 2)
        );

        const clarityResponse = await fetch(
          "https://api.replicate.com/v1/predictions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
              "Content-Type": "application/json",
              Prefer: "wait",
            },
            body: JSON.stringify({
              version:
                "dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e",
              input: {
                seed: 1337,
                image: outputUrl,
                prompt: clarityPrompt,
                dynamic: 6,
                handfix: "disabled",
                pattern: false,
                sharpen: 0,
                sd_model: "juggernaut_reborn.safetensors [338b85bc4f]",
                scheduler: "DPM++ 3M SDE Karras",
                creativity: 1,
                lora_links: "",
                downscaling: false,
                resemblance: 0.45,
                scale_factor: 6,
                tiling_width: 112,
                output_format: "png",
                tiling_height: 144,
                custom_sd_model: "",
                negative_prompt:
                  "(worst quality, low quality, normal quality:2) JuggernautNegative-neg",
                num_inference_steps: 50,
                downscaling_resolution: 768,
              },
            }),
          }
        );

        console.log("Clarity API yanıt statüsü:", clarityResponse.status);

        if (!clarityResponse.ok) {
          const errorData = await clarityResponse.text();
          console.error("Clarity API hata yanıtı:", errorData);
          throw new Error(
            `Clarity API hatası: ${clarityResponse.status} ${clarityResponse.statusText}`
          );
        }

        const clarityData = await clarityResponse.json();
        console.log(
          "Clarity API yanıtı:",
          JSON.stringify(clarityData, null, 2)
        );

        // Clarity API yanıtından URL'yi al
        if (clarityData.output && clarityData.output[0]) {
          enhancedImageUrl = clarityData.output[0];
          console.log("İyileştirilmiş görüntü URL:", enhancedImageUrl);
        } else if (
          clarityData.status === "succeeded" &&
          clarityData.urls &&
          clarityData.urls.get
        ) {
          // Tamamlanan tahmin için get URL'sini al
          const clarityGetResponse = await fetch(clarityData.urls.get, {
            headers: {
              Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
            },
          });

          if (!clarityGetResponse.ok) {
            throw new Error(
              `Clarity Get yanıtı alınamadı: ${clarityGetResponse.status}`
            );
          }

          const clarityGetData = await clarityGetResponse.json();

          if (clarityGetData.output && clarityGetData.output[0]) {
            enhancedImageUrl = clarityGetData.output[0];
            console.log("İyileştirilmiş görüntü URL (Get):", enhancedImageUrl);
          }
        }

        // Eğer başarılı bir şekilde iyileştirildiyse
        if (enhancedImageUrl) {
          isEnhanced = true;
        }
      } catch (clarityError) {
        console.error("Clarity Upscaler hatası:", clarityError);
        console.error("Hata stack:", clarityError.stack);
        console.warn(
          "Görüntü iyileştirme başarısız, orijinal görüntü kullanılacak"
        );
        // Hata durumunda orijinal görüntüyü kullanmaya devam et
      }
    }

    // API yanıtını JSON olarak gönder
    console.log(
      "İstemciye yanıt gönderiliyor, generated_image_url:",
      enhancedImageUrl || outputUrl,
      "enhanced:",
      isEnhanced
    );

    res.status(200).json({
      success: true,
      data: {
        generated_image_url: enhancedImageUrl || outputUrl,
        original_image_url: outputUrl,
        enhanced: isEnhanced,
        api_response: data,
        original_parameters: requestBody.input,
      },
    });
  } catch (error) {
    console.error("İç mekan tasarımı oluşturma hatası:", error);
    console.error("Hata stack:", error.stack);

    res.status(500).json({
      success: false,
      error: error.message || "Bir şeyler yanlış gitti!",
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
  }
};

// URL'den görüntü indir ve kaydet
const downloadImageFromUrl = async (url, filename) => {
  try {
    console.log(`URL'den görüntü indirme başlatıldı: ${url}`);

    if (!url) {
      throw new Error("İndirilecek URL sağlanmadı");
    }

    // CORS proxy kullan
    let fetchUrl = url;
    if (url.startsWith("http") && !url.includes("localhost")) {
      const proxyUrl = "https://corsproxy.io/?";
      fetchUrl = `${proxyUrl}${encodeURIComponent(url)}`;
      console.log("Proxy URL kullanılıyor:", fetchUrl);
    }

    let response;
    try {
      response = await fetch(fetchUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });

      console.log("Görüntü indirme yanıt statüsü:", response.status);

      if (!response.ok) {
        throw new Error(
          `Görüntü indirme başarısız: ${response.status} ${response.statusText}`
        );
      }
    } catch (fetchError) {
      console.error("Görüntü indirme bağlantı hatası:", fetchError);
      throw new Error(`Görüntü indirme bağlantı hatası: ${fetchError.message}`);
    }

    const buffer = await response.buffer();
    const filepath = path.join(__dirname, "../uploads", filename);

    console.log(`Görüntü kaydediliyor: ${filepath}`);
    fs.writeFileSync(filepath, buffer);

    console.log("Görüntü başarıyla indirildi ve kaydedildi");
    return filepath;
  } catch (error) {
    console.error("Görüntü indirme hatası:", error);
    console.error("Hata stack:", error.stack);
    throw new Error(`Görüntü indirilemedi: ${error.message}`);
  }
};

// Resmi Clarity Upscaler ile geliştirme
exports.enhanceImageWithClarity = async (req, res) => {
  try {
    console.log("enhanceImageWithClarity fonksiyonu başlatıldı");
    console.log("Gelen istek body:", req.body);

    // İsteğin body'sinden parametreleri al
    const { imageUrl, prompt, scale_factor = 4, dynamic = 6 } = req.body;

    console.log("İstek parametreleri:", {
      imageUrl,
      prompt,
      scale_factor,
      dynamic,
    });

    // URL'leri kontrol et
    if (!imageUrl) {
      console.error("Görüntü URL'i sağlanmadı");
      return res.status(400).json({
        success: false,
        error: "Görüntü URL'i gereklidir",
      });
    }

    // Prompt kontrolü
    if (!prompt) {
      console.error("Prompt sağlanmadı");
      return res.status(400).json({
        success: false,
        error: "Prompt gereklidir",
      });
    }

    // API token'ın varlığını kontrol et
    if (!process.env.REPLICATE_API_TOKEN) {
      console.error("REPLICATE_API_TOKEN çevre değişkeni bulunamadı");
      return res.status(500).json({
        success: false,
        error: "API yapılandırması eksik: REPLICATE_API_TOKEN bulunamadı",
      });
    }

    // URL'in zaten Clarity tarafından işlenmiş olup olmadığını kontrol et
    const isFromClarity =
      imageUrl &&
      imageUrl.includes("replicate") &&
      (imageUrl.includes(
        "dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e"
      ) ||
        imageUrl.includes("clarity"));

    if (isFromClarity) {
      console.log(
        "Görüntü zaten Clarity tarafından işlenmiş, tekrar işlenmeyecek:",
        imageUrl
      );
      return res.status(200).json({
        success: true,
        message: "Görüntü zaten Clarity ile iyileştirilmiş",
        data: {
          prediction_id: "already-enhanced",
          status: "succeeded",
          output: imageUrl,
          enhanced_image_url: imageUrl,
          already_enhanced: true,
        },
      });
    }

    // Gemini ile detaylı prompt oluştur
    let enhancedPrompt;
    try {
      enhancedPrompt = await createPromptWithGemini(prompt);
      console.log("Gemini tarafından oluşturulan prompt:", enhancedPrompt);
    } catch (gErr) {
      console.error("Gemini prompt oluşturulamadı:", gErr);
      console.warn("Orijinal prompt kullanılacak");
      enhancedPrompt = prompt; // Hata durumunda orijinal prompt'u kullan
    }

    // Clarity modeli için prompt özelleştirme
    const clarityPrompt = enhancedPrompt
      ? `${enhancedPrompt}, masterpiece, best quality, highres, <lora:more_details:0.5> <lora:SDXLrender_v2.0:1>`
      : `${prompt}, masterpiece, best quality, highres, <lora:more_details:0.5> <lora:SDXLrender_v2.0:1>`;

    console.log("Clarity için kullanılan prompt:", clarityPrompt);

    const clarityRequestBody = {
      input: {
        seed: 1337,
        image: imageUrl,
        prompt: clarityPrompt,
        dynamic: parseInt(dynamic),
        handfix: "disabled",
        pattern: false,
        sharpen: 0,
        sd_model: "juggernaut_reborn.safetensors [338b85bc4f]",
        scheduler: "DPM++ 3M SDE Karras",
        creativity: 1,
        lora_links: "",
        downscaling: false,
        resemblance: 0.45,
        scale_factor: 6,
        tiling_width: 112,
        output_format: "png",
        tiling_height: 144,
        custom_sd_model: "",
        negative_prompt:
          "(worst quality, low quality, normal quality:2) JuggernautNegative-neg",
        num_inference_steps: 50,
        downscaling_resolution: 768,
      },
    };

    console.log(
      "Clarity Upscaler API isteği:",
      JSON.stringify(clarityRequestBody, null, 2)
    );

    try {
      const clarityResponse = await fetch(
        "https://api.replicate.com/v1/predictions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
            "Content-Type": "application/json",
            Prefer: "wait",
          },
          body: JSON.stringify({
            version:
              "dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e",
            input: {
              seed: 1337,
              image: imageUrl,
              prompt: clarityPrompt,
              dynamic: parseInt(dynamic),
              handfix: "disabled",
              pattern: false,
              sharpen: 0,
              sd_model: "juggernaut_reborn.safetensors [338b85bc4f]",
              scheduler: "DPM++ 3M SDE Karras",
              creativity: 1,
              lora_links: "",
              downscaling: false,
              resemblance: 0.45,
              scale_factor: 6,
              tiling_width: 112,
              output_format: "png",
              tiling_height: 144,
              custom_sd_model: "",
              negative_prompt:
                "(worst quality, low quality, normal quality:2) JuggernautNegative-neg",
              num_inference_steps: 50,
              downscaling_resolution: 768,
            },
          }),
        }
      );

      console.log("Clarity API yanıt statüsü:", clarityResponse.status);

      // Yanıt içeriğini ham olarak al (başarılı veya başarısız olduğuna bakılmaksızın)
      const clarityResponseText = await clarityResponse.text();
      console.log("Clarity API ham yanıt:", clarityResponseText);

      // JSON olarak ayrıştırmayı dene
      let clarityData;
      try {
        clarityData = JSON.parse(clarityResponseText);
        console.log(
          "Clarity API yanıtı:",
          JSON.stringify(clarityData, null, 2)
        );
      } catch (jsonError) {
        console.error(
          "Clarity API yanıtı JSON olarak ayrıştırılamadı:",
          jsonError
        );
        return res.status(500).json({
          success: false,
          error: `Clarity API yanıtı JSON olarak ayrıştırılamadı: ${jsonError.message}`,
          raw_response: clarityResponseText,
        });
      }

      if (!clarityResponse.ok) {
        console.error("Clarity API hata yanıtı:", clarityResponseText);
        return res.status(clarityResponse.status).json({
          success: false,
          error: `Clarity API hatası: ${clarityResponse.status} ${clarityResponse.statusText}`,
          api_response: clarityData,
        });
      }

      // Başarılı durumda yanıtı gönder
      return res.status(200).json({
        success: true,
        data: {
          prediction_id: clarityData.id,
          status: clarityData.status,
          api_response: clarityData,
          get_url: clarityData.urls?.get,
          original_parameters: clarityRequestBody.input,
          generated_image_url: clarityData.output, // Client'ta kullanmak için doğrudan URL'yi de ekle
          original_prompt: prompt,
          enhanced_prompt: enhancedPrompt,
        },
      });
    } catch (fetchError) {
      console.error("Clarity API fetch hatası:", fetchError);
      return res.status(500).json({
        success: false,
        error: `Clarity API isteği başarısız: ${fetchError.message}`,
        stack:
          process.env.NODE_ENV === "development" ? fetchError.stack : undefined,
      });
    }
  } catch (error) {
    console.error("Clarity Upscaler hatası:", error);
    console.error("Hata stack:", error.stack);

    return res.status(500).json({
      success: false,
      error: error.message || "Bir şeyler yanlış gitti!",
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
  }
};

// Replicate tahmin durumunu kontrol et
exports.checkPredictionStatus = async (req, res) => {
  try {
    const { predictionId } = req.params;

    console.log(
      `checkPredictionStatus fonksiyonu başlatıldı. Prediction ID: ${predictionId}`
    );

    if (!predictionId) {
      return res.status(400).json({
        success: false,
        error: "Tahmin ID'si gereklidir",
      });
    }

    // API token'ın varlığını kontrol et
    if (!process.env.REPLICATE_API_TOKEN) {
      console.error("REPLICATE_API_TOKEN çevre değişkeni bulunamadı");
      return res.status(500).json({
        success: false,
        error: "API yapılandırması eksik: REPLICATE_API_TOKEN bulunamadı",
      });
    }

    const url = `https://api.replicate.com/v1/predictions/${predictionId}`;
    console.log("Tahmin durumu kontrol ediliyor:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Replicate yanıt statüsü:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Replicate API hata yanıtı:", errorText);
      return res.status(response.status).json({
        success: false,
        error: `Replicate API hatası: ${response.status} ${response.statusText}`,
        details: errorText,
      });
    }

    const data = await response.json();
    console.log("Tahmin durumu:", data.status);

    // Kullanıcıya yanıt gönder
    return res.status(200).json({
      success: true,
      data: {
        prediction_id: data.id,
        status: data.status,
        output: data.output,
        created_at: data.created_at,
        completed_at: data.completed_at,
      },
    });
  } catch (error) {
    console.error("Tahmin durumu kontrol hatası:", error);
    console.error("Hata stack:", error.stack);

    return res.status(500).json({
      success: false,
      error: error.message || "Bir şeyler yanlış gitti!",
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
  }
};

// Gemini ile prompt oluşturma
exports.generatePromptWithGemini = async (req, res) => {
  try {
    console.log("generatePromptWithGemini fonksiyonu başlatıldı");
    console.log("İstek body:", req.body);

    const { userPrompt, imageData } = req.body;

    if (!userPrompt) {
      return res.status(400).json({
        success: false,
        error: "userPrompt değeri gereklidir",
      });
    }

    try {
      // Gemini API setup - Çevre değişkenlerinden API anahtarını al
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        throw new Error("GEMINI_API_KEY çevre değişkeni bulunamadı");
      }

      const genAI = new GoogleGenerativeAI(apiKey);

      // İçerik isteği için değişken
      let promptContent;

      // Gemini 1.5 Flash modelini yapılandır - koşullardan önce tanımla
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
      });

      // Client'dan gelen görüntü verisini kontrol et
      if (imageData && imageData.startsWith("data:image")) {
        console.log("Client'dan gelen resim verisi kullanılıyor");

        // base64 string'i ayır (data:image/png;base64,iVBORw0KGg... -> iVBORw0KGg...)
        const base64Data = imageData.split(";base64,").pop();

        console.log(
          `Client'dan gelen görüntü base64 formatında, boyut: ${base64Data.length} karakter`
        );

        // Görüntü ile içerik isteğini oluştur
        // Inside your createPromptWithGemini function, replace or augment the promptContent assignment with this English version:

        promptContent = [
          {
            inlineData: {
              data: base64Image,
              mimeType: "image/png",
            },
          },
          {
            text: `Based on the provided empty room image, generate a highly detailed, single-sentence interior design prompt that adheres to the following requirements:
1. Accurately describe all visible architectural elements (walls, flooring, windows, ceiling) without altering their dimensions or positions;
2. Furnish and decorate the space according to the user’s requested style ("${userPrompt}"), including furniture, accessories, lighting, textures, and color palette in one continuous sentence;
3. Describe the lighting scheme by referencing only the existing light direction and intensity evident in the photo;
4. Begin the prompt with "Design a…" to clearly signal the creative instruction;
5. Avoid using bullet points or line breaks—compose the entire prompt as one fluid sentence;
6. Preserve the original perspective, room proportions, and spatial relationships at all times;
7. Do not introduce any new architectural features (additional windows, doors, openings, or exterior views) that are not present in the image;
8. Do not modify or reinterpret the existing flooring material—refer to it as "existing flooring" to reinforce its preservation;
9. Reference only existing wall configurations and window frames—do not change their shape, size, color, or position;
10. Do not add any external landscape, cityscape, or outdoor elements beyond what is already visible through the original windows;
11. Position all decorative elements and furniture in relation to the current architectural layout without expanding or contracting room dimensions;
12. Maintain the exact ceiling height and corner angles visible in the photograph—do not imply any structural changes;
13. Use clear keywords like "existing architectural elements only" or "preserve original structure" to prompt strict adherence;
14. Ensure the mood and atmosphere description align with natural daylight and existing shadow patterns;
15. Emphasize textures and materials by naming only those present in the photo or the user’s chosen style;
16. Write the entire description in English in one continuous sentence.`,
          },
        ];
      } else {
        console.warn(
          "Client'dan görüntü verisi gelmedi, metin tabanlı prompt kullanılacak"
        );

        // Sadece metin tabanlı promptu kullan
        promptContent = [
          {
            inlineData: {
              data: base64Image,
              mimeType: "image/png",
            },
          },
          {
            text: `Based on the provided empty room image, generate a highly detailed, single-sentence interior design prompt that adheres to the following requirements:
1. Accurately describe all visible architectural elements (walls, flooring, windows, ceiling) without altering their dimensions or positions;
2. Furnish and decorate the space according to the user’s requested style ("${userPrompt}"), including furniture, accessories, lighting, textures, and color palette in one continuous sentence;
3. Describe the lighting scheme by referencing only the existing light direction and intensity evident in the photo;
4. Begin the prompt with "Design a…" to clearly signal the creative instruction;
5. Avoid using bullet points or line breaks—compose the entire prompt as one fluid sentence;
6. Preserve the original perspective, room proportions, and spatial relationships at all times;
7. Do not introduce any new architectural features (additional windows, doors, openings, or exterior views) that are not present in the image;
8. Do not modify or reinterpret the existing flooring material—refer to it as "existing flooring" to reinforce its preservation;
9. Reference only existing wall configurations and window frames—do not change their shape, size, color, or position;
10. Do not add any external landscape, cityscape, or outdoor elements beyond what is already visible through the original windows;
11. Position all decorative elements and furniture in relation to the current architectural layout without expanding or contracting room dimensions;
12. Maintain the exact ceiling height and corner angles visible in the photograph—do not imply any structural changes;
13. Use clear keywords like "existing architectural elements only" or "preserve original structure" to prompt strict adherence;
14. Ensure the mood and atmosphere description align with natural daylight and existing shadow patterns;
15. Emphasize textures and materials by naming only those present in the photo or the user’s chosen style;
16. Write the entire description in English in one continuous sentence.`,
          },
        ];
      }

      console.log("Gemini 1.5 Flash'e istek gönderiliyor...");

      // İsteği Gemini'ye gönder
      const promptResponse = await model.generateContent(promptContent);

      // Yanıtı çıkart
      const generatedPrompt = promptResponse.response.text();

      // Yanıtı işle - Gereksiz açıklama ve giriş cümlelerini temizle
      let cleanedPrompt = generatedPrompt
        .replace(
          /^(certainly|here is|here's|sure|of course|elbette)(!|,|:|\.)\s*/i,
          ""
        )
        .replace(/^(the|a) prompt( would be| is)(:|\.)?\s*/i, "")
        .replace(/^(here is|here's) (the|a) prompt( for you)?(:|\.)?\s*/i, "")
        .replace(/^prompt(:|\.)?\s*/i, "")
        .trim();

      console.log("==== GEMİNİ TARAFINDAN OLUŞTURULAN PROMPT - BAŞLANGIÇ ====");
      console.log(cleanedPrompt);
      console.log("==== GEMİNİ TARAFINDAN OLUŞTURULAN PROMPT - SON ====");

      // Başarılı yanıt dön
      return res.status(200).json({
        success: true,
        generatedPrompt: cleanedPrompt,
        originalPrompt: userPrompt,
      });
    } catch (geminiError) {
      console.error("Gemini API hatası:", geminiError);
      return res.status(500).json({
        success: false,
        error: `Gemini API hatası: ${geminiError.message}`,
        stack:
          process.env.NODE_ENV === "development"
            ? geminiError.stack
            : undefined,
      });
    }
  } catch (error) {
    console.error("Gemini prompt oluşturma hatası:", error);
    console.error("Hata stack:", error.stack);

    return res.status(500).json({
      success: false,
      error: error.message || "Bir şeyler yanlış gitti!",
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
  }
};

// Supabase'e resim yükleme fonksiyonu
async function uploadImageToSupabase(base64Image, fileName) {
  try {
    // base64 string'i ayır (data:image/png;base64,iVBORw0KGg... -> iVBORw0KGg...)
    const base64Data = base64Image.split(";base64,").pop();

    // Base64'ü Buffer'a çevir
    const imageBuffer = Buffer.from(base64Data, "base64");

    // Dosya uzantısını belirle
    const fileExtension = base64Image.split(";")[0].split("/")[1];
    const fullFileName = `${fileName}.${fileExtension}`;

    console.log(`Resim Supabase'e yükleniyor: ${fullFileName}`);

    // Supabase'e yükle
    const { data, error } = await supabase.storage
      .from("products")
      .upload(fullFileName, imageBuffer, {
        contentType: `image/${fileExtension}`,
        upsert: true,
      });

    if (error) {
      console.error("Supabase yükleme hatası:", error);
      throw new Error(`Supabase'e yükleme hatası: ${error.message}`);
    }

    // Dosyanın public URL'ini al
    const publicURL = supabase.storage
      .from("products")
      .getPublicUrl(fullFileName).data.publicUrl;

    console.log(`Supabase'e yükleme başarılı. URL: ${publicURL}`);
    return publicURL;
  } catch (error) {
    console.error("Supabase'e resim yükleme hatası:", error);
    throw new Error(`Resim yükleme hatası: ${error.message}`);
  }
}

// Resim yükleme endpoint'i
exports.uploadImage = async (req, res) => {
  try {
    console.log("uploadImage fonksiyonu başlatıldı");

    const { imageData, fileName, type } = req.body;

    if (!imageData || !fileName) {
      return res.status(400).json({
        success: false,
        error: "Resim verisi ve dosya adı gereklidir",
      });
    }

    // Dosya adına timestamp ekle
    const timestamp = new Date().getTime();
    const uniqueFileName = `${fileName}_${timestamp}_${type || "image"}`;

    // Supabase'e yükle
    const imageUrl = await uploadImageToSupabase(imageData, uniqueFileName);

    return res.status(200).json({
      success: true,
      data: {
        imageUrl: imageUrl,
        fileName: uniqueFileName,
      },
    });
  } catch (error) {
    console.error("Resim yükleme hatası:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Resim yüklenirken bir hata oluştu",
    });
  }
};
